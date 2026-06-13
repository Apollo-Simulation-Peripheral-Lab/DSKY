/**
 * Shared arcade scoreboard for the games hub.
 *
 * Persists a top-5 leaderboard per game plus the recently-used initials (for the
 * VERB quick-pick) to game_scores.json next to the app (same convention as
 * ha_entities.json). The OTA updater carries this file across updates.
 */

import fs from 'fs'
import path from 'path'
import type { GameId, ScoreEntry } from '../../../types/serverState'

const MAX_ENTRIES = 5
const MAX_RECENT = 5
const filePath = () => path.resolve('game_scores.json')

interface ScoresFile {
    boards: Record<string, ScoreEntry[]>   // gameId -> sorted best->worst, top MAX_ENTRIES
    recent: string[]                        // recently used initials, most-recent first
}

let cache: ScoresFile | null = null

function load(): ScoresFile {
    if (cache) return cache
    try {
        const parsed = JSON.parse(fs.readFileSync(filePath(), 'utf-8'))
        cache = { boards: parsed.boards ?? {}, recent: parsed.recent ?? [] }
    } catch {
        cache = { boards: {}, recent: [] }
    }
    return cache
}

function persist() {
    if (!cache) return
    try {
        fs.writeFileSync(filePath(), JSON.stringify(cache, null, 2), 'utf-8')
    } catch (err) {
        console.error('[Games] Failed to persist scores:', err)
    }
}

export interface ScoringDescriptor {
    metric: 'score' | 'time'
    higherIsBetter: boolean
}

export const SCORING: Record<GameId, ScoringDescriptor> = {
    flappy:      { metric: 'score', higherIsBetter: true },
    tetris:      { metric: 'score', higherIsBetter: true },
    snake:       { metric: 'score', higherIsBetter: true },
    game2048:    { metric: 'score', higherIsBetter: true },
    minesweeper: { metric: 'time',  higherIsBetter: false },
    sudoku:      { metric: 'time',  higherIsBetter: false },
}

function sortBoard(board: ScoreEntry[], higherIsBetter: boolean): ScoreEntry[] {
    return [...board].sort((a, b) => higherIsBetter ? b.value - a.value : a.value - b.value)
}

export function getBoard(gameId: GameId): ScoreEntry[] {
    return load().boards[gameId] ?? []
}

export function getRecentInitials(): string[] {
    return load().recent
}

/** Would `value` make the top-5 for this game? */
export function qualifies(gameId: GameId, value: number): boolean {
    const board = getBoard(gameId)
    if (board.length < MAX_ENTRIES) return true
    const worst = board[board.length - 1].value
    return SCORING[gameId].higherIsBetter ? value > worst : value < worst
}

/** Insert an entry, persist, and return the new board plus this entry's 1-based rank. */
export function submitScore(gameId: GameId, entry: ScoreEntry): { board: ScoreEntry[]; rank: number } {
    const data = load()
    const merged = sortBoard([...(data.boards[gameId] ?? []), entry], SCORING[gameId].higherIsBetter)
    const board = merged.slice(0, MAX_ENTRIES)
    data.boards[gameId] = board
    if (entry.initials && entry.initials !== '---') {
        data.recent = [entry.initials, ...data.recent.filter(i => i !== entry.initials)].slice(0, MAX_RECENT)
    }
    cache = data
    persist()
    return { board, rank: board.indexOf(entry) + 1 }
}
