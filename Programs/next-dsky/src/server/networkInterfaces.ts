import * as os from 'os'
import type { NetworkInterfaceOption } from '../types/serverState'

/**
 * Detect available IPv4 network interfaces, sorted by RFC1918 preference.
 */
export function detectNetworkInterfaces(): NetworkInterfaceOption[] {
    const result: NetworkInterfaceOption[] = []
    const ifaces = os.networkInterfaces()

    for (const [name, entries] of Object.entries(ifaces)) {
        for (const entry of entries || []) {
            if (entry.family !== 'IPv4') continue
            if (entry.internal) continue
            if (entry.address.startsWith('169.254.')) continue // Skip APIPA
            result.push({ name, ip: entry.address })
            break // one IPv4 per interface is enough
        }
    }

    return result.sort((a, b) =>
        scoreIp(b.ip) - scoreIp(a.ip) ||
        nameScore(b.name) - nameScore(a.name) ||
        a.name.localeCompare(b.name)
    )
}

// Subnets that are almost always virtual/host-only rather than the real LAN.
// Ranked below real LAN addresses so the DSKY never advertises them by default.
//   192.168.56.x / .99.x  VirtualBox host-only, minikube
//   172.16-31.x           Docker / WSL / Hyper-V defaults
//   100.64-127.x          CGNAT / Cloudflare WARP / Tailscale
export function isVirtualSubnet(ip: string): boolean {
    const p = ip.split('.').map(n => parseInt(n, 10))
    if (p.length !== 4 || p.some(n => Number.isNaN(n))) return false
    const [a, b, c] = p
    if (a === 192 && b === 168 && (c === 56 || c === 99)) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 100 && b >= 64 && b <= 127) return true
    return false
}

function scoreIp(ip: string): number {
    if (isVirtualSubnet(ip)) return -1 // rank virtual/host-only last
    const parts = ip.split('.').map(n => parseInt(n, 10))
    if (parts.length !== 4 || parts.some(n => Number.isNaN(n))) return 0
    const [a, b] = parts
    if (a === 192 && b === 168) return 3
    if (a === 10) return 2
    if (a === 172 && b >= 16 && b <= 31) return 1
    return 0
}

// Prefer physical-looking NIC names over obviously virtual ones on ties
// (e.g. "Wi-Fi" beats "Ethernet 2" that is really hosting a VM).
const VIRTUAL_NAME = /virtual|vethernet|hyper-v|vmware|virtualbox|vbox|wsl|docker|loopback|warp|tailscale|zerotier/i
function nameScore(name: string): number {
    return VIRTUAL_NAME.test(name) ? 0 : 1
}

/**
 * Pick the best interface for mDNS multicast (highest-ranked real LAN address).
 * Returns null if no suitable interface found.
 */
export function pickBestInterface(): string | null {
    const interfaces = detectNetworkInterfaces()
    return interfaces.length > 0 ? interfaces[0].ip : null
}

/**
 * All local IPv4 addresses for the interface owning `ip` (same OS adapter),
 * used to prune advertised mDNS A-records to a single chosen interface.
 * Returns [ip] if the owning adapter can't be resolved.
 */
export function addressesForInterfaceOf(ip: string): string[] {
    const ifaces = os.networkInterfaces()
    for (const entries of Object.values(ifaces)) {
        const list = entries || []
        if (list.some(e => e.family === 'IPv4' && e.address === ip)) {
            const v4 = list.filter(e => e.family === 'IPv4' && !e.internal).map(e => e.address)
            return v4.length ? v4 : [ip]
        }
    }
    return [ip]
}
