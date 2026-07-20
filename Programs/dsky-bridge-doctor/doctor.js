#!/usr/bin/env node
/*
 * DSKY Bridge Doctor
 * ==================
 * Run this ON THE PC that runs next-dsky (the machine the physical DSKY is
 * trying to bridge to). Diagnoses BOTH ends and prints a plain verdict.
 *
 *   PC side (Node built-ins, no network deps):
 *     - lists this PC's IPs, flags fake ones (VPN / WSL / Hyper-V)
 *     - finds the DSKY mDNS advertisement, prints the ws:// URL the DSKY dials
 *     - probes the PC's own /ws endpoint
 *
 *   OrangePi side (over SSH via the bundled node-ssh library):
 *     - logs in (orangepi / orangepi), confirms next-dsky is up
 *     - runs a reachability + WebSocket test FROM THE PI back to this PC
 *       (this is the connection that is actually failing)
 *     - briefly relaunches next-dsky in the foreground to capture its live
 *       [Bridge] / [mDNS] logs (the appliance normally discards them)
 *
 * Usually just run with no arguments (the .bat does this). Options:
 *   node doctor.js --pi 192.168.1.42     Pi IP if auto-detect fails
 *   node doctor.js --pc-ip 192.168.1.50  force which PC IP the Pi tests against
 *   node doctor.js --no-pi               PC-side checks only (skip SSH)
 */

const os = require('os')
const net = require('net')
const dgram = require('dgram')
const http = require('http')
const crypto = require('crypto')

const PORT = 3000
const WS_PATH = '/ws'
const MDNS_ADDR = '224.0.0.251'
const MDNS_PORT = 5353
const SERVICE = '_dsky._tcp.local'
const PI_USER = 'orangepi'
const PI_PASS = 'orangepi'

// ---- args ----
const argv = process.argv.slice(2)
const getArg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined }
const OPT = { piHost: getArg('--pi'), pcIp: getArg('--pc-ip'), noPi: argv.includes('--no-pi') }

const useColor = process.stdout.isTTY
const paint = (c, s) => useColor ? `${c}${s}\x1b[0m` : s
const K = { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', bold: '\x1b[1m', dim: '\x1b[2m' }
const ok = (s) => console.log(`${paint(K.green, '  OK  ')} ${s}`)
const bad = (s) => console.log(`${paint(K.red, ' FAIL ')} ${s}`)
const warn = (s) => console.log(`${paint(K.yellow, ' WARN ')} ${s}`)
const info = (s) => console.log(`       ${paint(K.dim, s)}`)
const head = (s) => console.log(`\n${paint(K.bold, paint(K.cyan, s))}`)

// ---- 1. Local interfaces --------------------------------------------------
const FAKE_HINTS = ['wsl', 'hyper-v', 'vethernet', 'virtual', 'warp', 'cloudflare',
  'vpn', 'tailscale', 'zerotier', 'vmware', 'virtualbox', 'loopback', 'docker']
// Subnets that are almost always virtual/host-only, not the real LAN:
//   192.168.56.x  VirtualBox host-only default
//   192.168.99.x  older Docker/minikube
//   172.16-31.x   Docker/WSL/Hyper-V default ranges
//   169.254.x     link-local (no DHCP / not really connected)
//   100.64-127.x  CGNAT / Tailscale / WARP
function fakeByIp(ip) {
  const p = ip.split('.').map(Number)
  if (p[0] === 192 && p[1] === 168 && (p[2] === 56 || p[2] === 99)) return 'virtual host-only subnet'
  if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return 'docker/virtual subnet'
  if (p[0] === 169 && p[1] === 254) return 'link-local (not connected)'
  if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return 'CGNAT/VPN subnet'
  return null
}
const looksFake = (name, ip) => FAKE_HINTS.find(h => name.toLowerCase().includes(h)) || fakeByIp(ip)

function localIPv4s() {
  const out = []
  for (const [name, addrs] of Object.entries(os.networkInterfaces()))
    for (const a of addrs || [])
      if (a.family === 'IPv4' && !a.internal) out.push({ name, ip: a.address, fake: looksFake(name, a.address) })
  return out
}

// ---- 2. Minimal mDNS browser (no deps) ------------------------------------
function encodeName(name) {
  const bufs = []
  for (const p of name.split('.')) { const b = Buffer.from(p, 'utf8'); bufs.push(Buffer.from([b.length]), b) }
  bufs.push(Buffer.from([0])); return Buffer.concat(bufs)
}
function buildQuery(name, type) {
  const h = Buffer.alloc(12); h.writeUInt16BE(1, 4)
  const tail = Buffer.alloc(4); tail.writeUInt16BE(type, 0); tail.writeUInt16BE(1, 2)
  return Buffer.concat([h, encodeName(name), tail])
}
function readName(buf, offset) {
  const labels = []; let jumped = false, safety = 0, pos = offset, next = offset
  while (safety++ < 128) {
    const len = buf[pos]; if (len === undefined) break
    if ((len & 0xc0) === 0xc0) { const ptr = ((len & 0x3f) << 8) | buf[pos + 1]; if (!jumped) next = pos + 2; pos = ptr; jumped = true; continue }
    if (len === 0) { if (!jumped) next = pos + 1; break }
    labels.push(buf.slice(pos + 1, pos + 1 + len).toString('utf8')); pos += 1 + len
  }
  return { name: labels.join('.'), next }
}
function parseAnswers(buf) {
  const ancount = buf.readUInt16BE(6) + buf.readUInt16BE(8) + buf.readUInt16BE(10)
  let pos = 12; const qd = buf.readUInt16BE(4)
  for (let i = 0; i < qd; i++) pos = readName(buf, pos).next + 4
  const rr = []
  for (let i = 0; i < ancount && pos < buf.length; i++) {
    const nm = readName(buf, pos); pos = nm.next
    const type = buf.readUInt16BE(pos); pos += 8 // type(2)+class(2)+ttl(4)
    const rdlen = buf.readUInt16BE(pos); pos += 2
    const rdata = buf.slice(pos, pos + rdlen); const rec = { name: nm.name, type }
    if (type === 1 && rdlen === 4) rec.a = `${rdata[0]}.${rdata[1]}.${rdata[2]}.${rdata[3]}`
    else if (type === 12) rec.ptr = readName(buf, pos).name
    else if (type === 33) { rec.port = rdata.readUInt16BE(4); rec.target = readName(buf, pos + 6).name }
    else if (type === 16) { const txt = {}; let o = 0
      while (o < rdata.length) { const l = rdata[o++]; const s = rdata.slice(o, o + l).toString('utf8'); o += l; const eq = s.indexOf('='); if (eq > 0) txt[s.slice(0, eq)] = s.slice(eq + 1) }
      rec.txt = txt }
    pos += rdlen; rr.push(rec)
  }
  return rr
}
function discover(timeoutMs = 4000) {
  return new Promise((resolve) => {
    const sock = dgram.createSocket({ type: 'udp4', reuseAddr: true })
    const services = {}, aByHost = {}
    sock.on('message', (msg) => { let rr; try { rr = parseAnswers(msg) } catch { return }
      for (const r of rr) {
        if (r.type === 12 && r.name === SERVICE && r.ptr) services[r.ptr] ||= { addrs: new Set() }
        if (r.type === 33 && r.name.endsWith(SERVICE)) { services[r.name] ||= { addrs: new Set() }; services[r.name].port = r.port; services[r.name].target = r.target }
        if (r.type === 16 && r.name.endsWith(SERVICE)) { services[r.name] ||= { addrs: new Set() }; services[r.name].txt = r.txt }
        if (r.type === 1 && r.a) (aByHost[r.name] ||= new Set()).add(r.a)
      } })
    sock.on('error', () => {})
    sock.bind(0, () => { try { sock.addMembership(MDNS_ADDR) } catch {}
      const send = () => { try { sock.send(buildQuery(SERVICE, 12), MDNS_PORT, MDNS_ADDR) } catch {} }
      send(); setTimeout(send, 500); setTimeout(send, 1500) })
    setTimeout(() => { for (const s of Object.values(services)) if (s.target && aByHost[s.target]) for (const a of aByHost[s.target]) s.addrs.add(a)
      try { sock.close() } catch {}; resolve(services) }, timeoutMs)
  })
}

// ---- 3. Active probes (from this PC) --------------------------------------
function tcpProbe(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const s = new net.Socket(); let done = false
    const finish = (r) => { if (done) return; done = true; try { s.destroy() } catch {}; resolve(r) }
    s.setTimeout(timeout)
    s.once('connect', () => finish({ ok: true }))
    s.once('timeout', () => finish({ ok: false, err: 'timeout (no route / firewall)' }))
    s.once('error', (e) => finish({ ok: false, err: e.code || e.message }))
    s.connect(port, host)
  })
}
function wsProbe(host, port, path = WS_PATH, timeout = 4000) {
  return new Promise((resolve) => {
    const key = crypto.randomBytes(16).toString('base64')
    const req = http.request({ host, port, path, method: 'GET',
      headers: { Connection: 'Upgrade', Upgrade: 'websocket', 'Sec-WebSocket-Key': key, 'Sec-WebSocket-Version': '13' } })
    let done = false
    const finish = (r) => { if (done) return; done = true; try { req.destroy() } catch {}; resolve(r) }
    req.setTimeout(timeout, () => finish({ ok: false, err: 'timeout' }))
    req.on('upgrade', (res) => finish({ ok: res.statusCode === 101, status: res.statusCode }))
    req.on('response', (res) => finish({ ok: false, err: `no upgrade (HTTP ${res.statusCode})` }))
    req.on('error', (e) => finish({ ok: false, err: e.code || e.message }))
    req.end()
  })
}

function findPiCandidates(services, pcIps) {
  const mine = new Set(pcIps), cands = new Set()
  for (const s of Object.values(services)) for (const a of s.addrs) if (!mine.has(a)) cands.add(a)
  return [...cands]
}

// Scan a /24 for a host with port 3000 + a working /ws upgrade — i.e. a DSKY.
// Only scans the REAL LAN subnet(s), skipping the PC's own IP.
async function scanLanForDsky(realIPs, onProgress) {
  const found = []
  const subnets = [...new Set(realIPs.filter(i => !i.fake).map(i => i.ip.split('.').slice(0, 3).join('.')))]
  for (const base of subnets) {
    const mineLastOctet = realIPs.filter(i => i.ip.startsWith(base + '.')).map(i => Number(i.ip.split('.')[3]))
    const targets = []
    for (let n = 1; n <= 254; n++) if (!mineLastOctet.includes(n)) targets.push(`${base}.${n}`)
    // Probe TCP:3000 in batches for speed.
    const BATCH = 40
    for (let i = 0; i < targets.length; i += BATCH) {
      if (onProgress) onProgress(base, Math.min(i + BATCH, targets.length), targets.length)
      const slice = targets.slice(i, i + BATCH)
      const hits = await Promise.all(slice.map(async ip => (await tcpProbe(ip, PORT, 600)).ok ? ip : null))
      for (const ip of hits.filter(Boolean)) {
        const ws = await wsProbe(ip, PORT, WS_PATH, 2000)
        if (ws.ok) found.push(ip)
      }
    }
  }
  return found
}

// ---- 4. SSH to the Pi (node-ssh) ------------------------------------------
async function connectPi(host) {
  const { NodeSSH } = require('node-ssh')
  const ssh = new NodeSSH()
  await ssh.connect({
    host, username: PI_USER, password: PI_PASS,
    tryKeyboard: true,
    onKeyboardInteractive: (_n, _i, _p, prompts, finish) => finish(prompts.map(() => PI_PASS)),
    readyTimeout: 9000,
  })
  return ssh
}
async function piExec(ssh, cmd, { timeoutMs = 30000 } = {}) {
  // node-ssh has no per-exec timeout; wrap the remote command in `timeout`.
  const wrapped = `timeout ${Math.ceil(timeoutMs / 1000)} bash -lc ${shq(cmd)}`
  const r = await ssh.execCommand(wrapped)
  return { out: (r.stdout || '') + (r.stderr ? '\n' + r.stderr : ''), stdout: r.stdout || '', code: r.code }
}
const shq = (s) => `'${String(s).replace(/'/g, `'\\''`)}'`

// ---- Main -----------------------------------------------------------------
async function main() {
  console.log(paint(K.bold, 'DSKY Bridge Doctor') + '  ' + paint(K.dim, '(run on the PC that runs next-dsky)'))

  const realIPs = localIPv4s()
  const goodLan = realIPs.filter(i => !i.fake).map(i => i.ip)

  head('1. This PC\'s network addresses')
  for (const i of realIPs) i.fake
    ? warn(`${i.ip}  (${i.name})  <- likely NOT reachable by the DSKY [${i.fake}]`)
    : ok(`${i.ip}  (${i.name})`)
  if (!realIPs.length) bad('No external IPv4 found — is this PC on the network?')
  if (goodLan.length > 1) info(`Multiple real LAN IPs: ${goodLan.join(', ')}`)

  let pcTarget = OPT.pcIp || goodLan[0] || null

  head('2. DSKY mDNS advertisement on the LAN (4s)...')
  const services = await discover()
  if (!Object.keys(services).length)
    warn('No _dsky._tcp service seen. (Firewall on UDP 5353, or advertising on a fake adapter.)')
  for (const [name, s] of Object.entries(services)) {
    const port = s.port || PORT, addrs = [...s.addrs]
    console.log(`   ${paint(K.bold, name.replace('.' + SERVICE, ''))}  port ${port}` +
      (s.txt?.app ? `  app=${s.txt.app}` : '') + (s.txt?.version ? `  v${s.txt.version}` : ''))
    if (addrs.length) { info(`advertised: ${addrs.join(', ')}`)
      for (const a of addrs) { const scheme = port === 443 ? 'wss' : 'ws'; info(`DSKY would dial: ${scheme}://${a}:${port}${s.txt?.wsPath || WS_PATH}`) } }
    else info('advertised NO usable A record (DSKY may fall back to an unresolvable hostname)')
  }

  head('3. Probing this PC\'s own /ws endpoint')
  const pcCandidates = [...new Set([...goodLan, ...realIPs.filter(i => i.fake).map(i => i.ip)])]
  for (const ip of pcCandidates) {
    const tcp = await tcpProbe(ip, PORT)
    if (!tcp.ok) { bad(`${ip}:${PORT} — TCP: ${tcp.err}`); continue }
    const ws = await wsProbe(ip, PORT)
    ws.ok ? ok(`${ip}:${PORT} — /ws handshake OK`) : warn(`${ip}:${PORT} — TCP open but /ws failed: ${ws.err}`)
  }

  if (OPT.noPi) { head('Skipping OrangePi checks (--no-pi)'); return finalNote(pcTarget, realIPs) }

  // ---- OrangePi side ----
  head('4. OrangePi (physical DSKY) checks over SSH')
  let piHost = OPT.piHost
  if (!piHost) {
    const cands = findPiCandidates(services, pcCandidates)
    if (cands.length >= 1) { piHost = cands[0]; info(`Auto-detected Pi at ${piHost}` + (cands.length > 1 ? ` (others: ${cands.slice(1).join(', ')}; use --pi <ip> to pick)` : ' (from mDNS)')) }
    else {
      // mDNS found nothing. Scan the real LAN for a host serving a DSKY /ws.
      info('mDNS found no DSKY. Scanning the LAN for the DSKY (this takes ~15-30s)...')
      const hits = await scanLanForDsky(realIPs, (base, done, total) => {
        if (useColor && done % 80 === 0) process.stdout.write(`\r       scanning ${base}.0/24  ${done}/${total}   `)
      })
      if (useColor) process.stdout.write('\r' + ' '.repeat(50) + '\r')
      if (hits.length) { piHost = hits[0]; ok(`Found a DSKY on the LAN at ${piHost}` + (hits.length > 1 ? ` (also: ${hits.slice(1).join(', ')})` : '')) }
      else { info('LAN scan found no DSKY. Trying hostname orangepi.local ...'); piHost = 'orangepi.local' }
    }
  }

  // The PC IP the Pi should test against MUST be on the Pi's own subnet.
  // (A PC with a VirtualBox 192.168.56.x adapter would otherwise be tested on
  // an address the Pi can never reach.) Only override when not forced by --pc-ip.
  if (!OPT.pcIp && /^\d+\.\d+\.\d+\.\d+$/.test(piHost || '')) {
    const piBase = piHost.split('.').slice(0, 3).join('.')
    const sameSubnet = goodLan.find(ip => ip.startsWith(piBase + '.'))
    if (sameSubnet && sameSubnet !== pcTarget) {
      info(`Using this PC's ${sameSubnet} (same subnet as the DSKY) for the reachability test.`)
      pcTarget = sameSubnet
    }
  }

  info(`Connecting to ${PI_USER}@${piHost} ...`)
  let ssh
  try {
    ssh = await connectPi(piHost)
  } catch (e) {
    bad(`SSH to the Pi failed: ${e.message}`)
    info('Possible causes: SSH not enabled on the Pi, wrong IP, or different password.')
    info('Retry with the Pi\'s IP:  run  RUN-DOCTOR.bat  after editing it, or in a terminal:')
    info(`    node doctor.js --pi <pi-ip>`)
    info('(Find the Pi IP in your router\'s device list, or on the DSKY: Menu -> About.)')
    return finalNote(pcTarget, realIPs)
  }

  try {
    const ping = await piExec(ssh, 'echo DSKY_SSH_OK; hostname; uptime -p || true')
    ok(`SSH OK — ${ping.stdout.trim().split('\n').slice(1).join(' | ')}`)

    const up = await piExec(ssh, 'curl -fsS -m 4 http://localhost:3000 >/dev/null && echo UP || echo DOWN')
    up.out.includes('UP') ? ok('next-dsky is running on the Pi (localhost:3000 responds)')
                          : bad('next-dsky is NOT responding on the Pi (localhost:3000). It may have crashed.')

    if (pcTarget) {
      head(`5. THE KEY TEST — can the DSKY reach this PC?  (run FROM the Pi -> ${pcTarget}:${PORT})`)
      const piTcp = await piExec(ssh,
        `timeout 5 bash -c 'exec 3<>/dev/tcp/${pcTarget}/${PORT}' 2>/dev/null && echo TCP_OK || echo TCP_FAIL`)
      if (piTcp.out.includes('TCP_OK')) {
        ok(`Pi CAN open TCP to ${pcTarget}:${PORT}`)
        const piWs = await piExec(ssh,
          `curl -s -m 6 -o /dev/null -w '%{http_code}' -H 'Connection: Upgrade' -H 'Upgrade: websocket' ` +
          `-H 'Sec-WebSocket-Version: 13' -H 'Sec-WebSocket-Key: AAAAAAAAAAAAAAAAAAAAAA==' ` +
          `http://${pcTarget}:${PORT}${WS_PATH}`)
        const code = piWs.stdout.trim()
        code === '101' ? ok('Pi completed the WebSocket /ws handshake to the PC (HTTP 101)')
                       : warn(`Pi reached the port but /ws did not upgrade (HTTP ${code || '?'}).`)
      } else {
        bad(`Pi CANNOT reach ${pcTarget}:${PORT} — this is almost certainly why bridging fails.`)
        info('Cause is usually Windows Firewall blocking inbound on port 3000, OR the PC is')
        info('advertising a VPN/WSL address instead of its LAN IP (see sections 1 & 2).')
      }
    } else warn('No good LAN IP on this PC to test against. Rerun with --pc-ip <ip>.')

    head('6. Reproducing the exact bridge dial from the Pi (non-destructive, ~8s)')
    if (pcTarget) {
      const bridgeUrl = `ws://${pcTarget}:${PORT}${WS_PATH}`
      info(`Opening a WebSocket from the Pi to ${bridgeUrl}`)
      info('(the same connection BRIDGE mode makes). Your running DSKY is not touched.')
      // Use the Pi's own node + the `ws` module already bundled with next-dsky.
      // This mirrors BridgeIntegration.connectClient() exactly.
      const piNode = [
        `const WebSocket=require('ws');`,
        `const w=new WebSocket(${JSON.stringify(bridgeUrl)});`,
        `const t=setTimeout(()=>{console.log('RESULT: TIMEOUT (no response in 7s)');process.exit(0)},7000);`,
        `w.on('open',()=>{console.log('RESULT: CONNECTED');clearTimeout(t);w.close();process.exit(0)});`,
        `w.on('error',e=>{console.log('RESULT: ERROR '+(e.code||e.message));clearTimeout(t);process.exit(0)});`,
      ].join('')
      const cap = await piExec(ssh,
        `cd ~/DSKY/Programs/next-dsky && node -e ${shq(piNode)}`,
        { timeoutMs: 20000 })
      const line = (cap.out.match(/RESULT:.*/) || [''])[0].trim()
      if (/CONNECTED/.test(line)) ok('Bridge CONNECTED from the Pi — the link works at the network level.')
      else if (/ERROR/.test(line)) bad(`Bridge FAILED from the Pi — ${line.replace('RESULT: ', '')}`)
      else if (/TIMEOUT/.test(line)) bad('Bridge TIMED OUT from the Pi (silently dropped — usually a firewall).')
      else { warn('Could not run the Pi-side WebSocket test.'); if (cap.out.trim()) info(cap.out.trim().split('\n').slice(-3).join(' | ')) }
    } else {
      warn('Skipped — no PC LAN IP to bridge to.')
    }
  } finally {
    try { ssh.dispose() } catch {}
  }

  finalNote(pcTarget, realIPs)
}

function finalNote(pcTarget, realIPs) {
  head('Done')
  const suggest = pcTarget || (realIPs.find(i => !i.fake) || {}).ip || '<PC-LAN-IP>'
  info('Copy EVERYTHING above (all sections) and send it back for diagnosis.')
  info('Quick unblock: on the DSKY, Menu -> Bridge -> MANUAL URL, then type:')
  info(`   ws://${suggest}:${PORT}/ws`)
}

main().catch(e => { console.error('\nDoctor crashed:', e && e.stack || e); process.exitCode = 1 })
