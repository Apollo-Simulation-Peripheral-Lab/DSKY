/**
 * Status-lamp show for the games hub.
 *
 * The DSKY's physical indicator lamps are driven by pushing a full DSKY state to
 * the serial port (via the 70 ms doUpdate loop's pendingUpdate). Normally
 * entering a custom app pushes OFF_TEST (all lamps dark). This module instead
 * runs a little light show while the games app is open:
 *   - an entry cascade animation, then
 *   - a steady "all lamps on" baseline, and
 *   - brief reactions to game events (score / game over / win).
 *
 * It owns a timer that repeatedly emits a lamp frame; updateSerialState dedupes,
 * so emitting an unchanged frame is cheap.
 */

import { OFF_TEST } from '../../../utils/dskyStates'

type Emit = (state: any) => void
export type LampEvent = 'score' | 'gameover' | 'win'

// Order used for the entry cascade (roughly interleaving the two lamp columns).
const LAMP_KEYS = [
    'IlluminateUplinkActy', 'IlluminateTemp',
    'IlluminateNoAtt', 'IlluminateGimbalLock',
    'IlluminateStby', 'IlluminateProg',
    'IlluminateKeyRel', 'IlluminateRestart',
    'IlluminateOprErr', 'IlluminateTracker',
    'IlluminateNoDap', 'IlluminateAlt',
    'IlluminatePrioDisp', 'IlluminateVel',
]

const ENTRY_MS = 1600
const FRAME_MS = 80

let emit: Emit | null = null
let timer: ReturnType<typeof setInterval> | null = null
let startMs = 0
let evt: { type: LampEvent; endMs: number } | null = null

function clock(): number { return performance.now() }

function setAll(lamps: Record<string, number>, on: number) {
    for (const k of LAMP_KEYS) lamps[k] = on
}

function buildFrame(): any {
    const t = clock() - startMs
    const lamps: Record<string, number> = {}
    setAll(lamps, 0)
    let comp = false

    if (t < ENTRY_MS) {
        // Entry: cascade lamps on one-by-one (first 80%), then an all-on flash.
        const frac = t / ENTRY_MS
        if (frac < 0.8) {
            const n = Math.floor((frac / 0.8) * LAMP_KEYS.length) + 1
            for (let i = 0; i < Math.min(n, LAMP_KEYS.length); i++) lamps[LAMP_KEYS[i]] = 1
        } else {
            setAll(lamps, 1)
        }
        comp = true
    } else {
        let active: LampEvent | null = null
        if (evt) {
            if (clock() < evt.endMs) active = evt.type
            else evt = null
        }
        if (active === 'gameover') {
            // Alarm blink — distinct red-ish indicators flashing fast.
            const on = Math.floor(t / 90) % 2 === 0 ? 1 : 0
            lamps['IlluminateOprErr'] = on
            lamps['IlluminateRestart'] = on
            lamps['IlluminateTemp'] = on
            lamps['IlluminateProg'] = on
        } else if (active === 'win') {
            // Celebratory: everything blinks together.
            const on = Math.floor(t / 90) % 2 === 0 ? 1 : 0
            setAll(lamps, on)
            comp = on === 1
        } else {
            // Steady baseline: lamps stay on. COMP ACTY blips on a score event.
            setAll(lamps, 1)
            comp = active === 'score'
        }
    }

    return { ...OFF_TEST, ...lamps, IlluminateCompLight: comp }
}

export function startLampShow(e: Emit) {
    stopLampShow()
    emit = e
    startMs = clock()
    evt = null
    emit(buildFrame())   // emit immediately so there's no OFF_TEST flash first
    timer = setInterval(() => { if (emit) emit(buildFrame()) }, FRAME_MS)
}

export function stopLampShow() {
    if (timer) { clearInterval(timer); timer = null }
    emit = null
    evt = null
}

/** Trigger a brief lamp reaction. Score blips COMP ACTY; over/win blink patterns. */
export function lampEvent(type: LampEvent) {
    if (!emit) return
    evt = { type, endMs: clock() + (type === 'score' ? 250 : 1200) }
}
