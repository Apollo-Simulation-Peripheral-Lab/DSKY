import { nouns } from ".."
export const runClock = () => {
    const now = new Date()
    nouns['36'] = [now.getHours(), now.getMinutes(), now.getSeconds() * 100]
    nouns['65'] = [now.getHours(), now.getMinutes(), now.getSeconds() * 100]
} 