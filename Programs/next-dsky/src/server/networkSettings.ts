import * as fs from 'fs'
import * as path from 'path'

/**
 * Persists the user's chosen mDNS advertising interface so it survives restarts.
 * Stored next to the other runtime config (e.g. ha_entities.json) in the
 * next-dsky working directory.
 */

const FILE = 'network_settings.json'
const filePath = () => path.resolve(FILE)

interface NetworkSettings {
    /** IPv4 address of the interface to advertise on; null/absent = auto. */
    interface?: string | null
}

export const loadNetworkInterface = (): string | null => {
    try {
        const p = filePath()
        if (!fs.existsSync(p)) return null
        const data = JSON.parse(fs.readFileSync(p, 'utf-8')) as NetworkSettings
        return data.interface ?? null
    } catch (err: any) {
        console.error('[Network] Failed to read network_settings.json:', err?.message || err)
        return null
    }
}

export const saveNetworkInterface = (ip: string | null): void => {
    try {
        const settings: NetworkSettings = { interface: ip }
        fs.writeFileSync(filePath(), JSON.stringify(settings, null, 2), 'utf-8')
        console.log(`[Network] Saved interface preference: ${ip ?? '(auto)'}`)
    } catch (err: any) {
        console.error('[Network] Failed to write network_settings.json:', err?.message || err)
    }
}
