/**
 * Games hub — dispatches key input to the active sub-game, runs the tick loop,
 * and orchestrates the shared arcade scoreboard (initials entry on a high score).
 * Pattern mirrors clockApp.ts (multi-tab internal dispatch).
 */

import type { GamesAppState, GameId, ScoreEntryState } from '../../types/serverState'
import { INITIAL_FLAPPY, handleFlappyKey, tickFlappy, resetFlappy } from './games/flappy'
import { INITIAL_TETRIS, handleTetrisKey, tickTetris, resetTetris } from './games/tetris'
import { INITIAL_SNAKE, handleSnakeKey, tickSnake, resetSnake } from './games/snake'
import { INITIAL_2048, handle2048Key, reset2048 } from './games/game2048'
import { INITIAL_MINESWEEPER, handleMinesweeperKey, resetMinesweeper } from './games/minesweeper'
import { INITIAL_SUDOKU, handleSudokuKey, resetSudoku } from './games/sudoku'
import { SCORING, qualifies, submitScore, getBoard, getRecentInitials } from './games/scoreboard'
import { startLampShow, stopLampShow, lampEvent } from './games/lamps'

const GAME_LIST: { id: GameId; label: string }[] = [
    { id: 'flappy', label: 'FLAPPY ROCKET' },
    { id: 'tetris', label: 'TETRIS' },
    { id: 'snake', label: 'SNAKE' },
    { id: 'game2048', label: '2048' },
    { id: 'minesweeper', label: 'MINESWEEPER' },
    { id: 'sudoku', label: 'SUDOKU' },
]

const TICK_MS = 33  // ~30 Hz server authority; client interpolates at RAF
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const INITIAL_SCORE_ENTRY: ScoreEntryState = {
    active: false,
    stage: 'entry',
    viewOnly: false,
    gameId: null,
    value: 0,
    metric: 'score',
    rank: 0,
    initials: 'AAA',
    cursor: 0,
    recent: [],
    board: [],
}

let state: GamesAppState
let tickInterval: ReturnType<typeof setInterval> | null = null
let lastTickMs = 0
let onStateChange: ((s: GamesAppState) => void) | null = null

// For lamp reactions: track the active game's last seen score/phase.
let lastScore = 0
let lastPhase: string | null = null

export function initGames(onChange: (s: GamesAppState) => void, onLamps?: (lampState: any) => void): GamesAppState {
    cleanup()
    onStateChange = onChange
    lastScore = 0
    lastPhase = null
    // Kick off the status-lamp show (entry animation -> steady "on").
    if (onLamps) startLampShow(onLamps)
    state = {
        activeGame: null,
        selectorIndex: 0,
        flappy: { ...INITIAL_FLAPPY, tickMs: Date.now() },
        tetris: { ...INITIAL_TETRIS, tickMs: Date.now() },
        snake: { ...INITIAL_SNAKE, tickMs: Date.now() },
        game2048: { ...INITIAL_2048 },
        minesweeper: { ...INITIAL_MINESWEEPER },
        sudoku: { ...INITIAL_SUDOKU },
        scoreEntry: { ...INITIAL_SCORE_ENTRY },
    }
    return state
}

export function cleanup() {
    stopTicker()
    stopLampShow()
    onStateChange = null
}

export function getGamesState(): GamesAppState {
    return state
}

function broadcast() {
    reactLamps(state)
    onStateChange?.(state)
}

/** Map the active game's score/phase changes to status-lamp reactions. */
function reactLamps(s: GamesAppState) {
    if (!s.activeGame) { lastScore = 0; lastPhase = null; return }
    let score = 0
    let phase = ''
    switch (s.activeGame) {
        case 'flappy':      score = s.flappy.score; phase = s.flappy.phase; break
        case 'tetris':      score = s.tetris.score; phase = s.tetris.phase; break
        case 'snake':       score = s.snake.score; phase = s.snake.phase; break
        case 'game2048':    score = s.game2048.score; phase = s.game2048.phase; break
        case 'minesweeper': phase = s.minesweeper.phase; break
        case 'sudoku':      phase = s.sudoku.phase; break
    }
    if (score > lastScore) lampEvent('score')
    if (phase !== lastPhase) {
        if (phase === 'gameover') lampEvent('gameover')
        else if (phase === 'won') lampEvent('win')
    }
    lastScore = score
    lastPhase = phase
}

function startTicker() {
    if (tickInterval) return
    // Use performance.now() — monotonic clock, immune to NTP/system time
    // changes. Date.now() produced negative dt after NTP adjustments, warping
    // the ship out of bounds and triggering fake game overs.
    lastTickMs = performance.now()
    tickInterval = setInterval(() => {
        if (!state) { stopTicker(); return }
        const now = performance.now()
        const raw = (now - lastTickMs) / 1000
        // Clamp to prevent tunneling if the event loop stalled.
        const dt = raw > 0.05 ? 0.05 : raw < 0 ? 0 : raw
        lastTickMs = now
        if (state.activeGame === 'flappy') {
            const next = tickFlappy(state.flappy, dt)
            state = { ...state, flappy: next }
            if (next.phase === 'gameover') { stopTicker(); state = maybeStartScoreEntry(state) }
        } else if (state.activeGame === 'tetris') {
            const next = tickTetris(state.tetris, dt)
            state = { ...state, tetris: next }
            if (next.phase === 'gameover') { stopTicker(); state = maybeStartScoreEntry(state) }
        } else if (state.activeGame === 'snake') {
            const next = tickSnake(state.snake, dt)
            state = { ...state, snake: next }
            if (next.phase === 'gameover') { stopTicker(); state = maybeStartScoreEntry(state) }
        } else {
            // 2048, minesweeper, sudoku are purely input-driven — no tick.
            stopTicker()
            return
        }
        broadcast()
    }, TICK_MS)
}

function stopTicker() {
    if (tickInterval) {
        clearInterval(tickInterval)
        tickInterval = null
    }
}

export function handleGamesKey(key: string): GamesAppState {
    if (!state) return state

    // Score-entry overlay takes precedence over everything else.
    if (state.scoreEntry.active) {
        state = handleScoreEntryKey(state, key)
        broadcast()
        return state
    }

    // Selector screen
    if (state.activeGame === null) {
        if (key === '-') {
            state = { ...state, selectorIndex: (state.selectorIndex + 1) % GAME_LIST.length }
            broadcast()
            return state
        }
        if (key === '+') {
            state = { ...state, selectorIndex: (state.selectorIndex - 1 + GAME_LIST.length) % GAME_LIST.length }
            broadcast()
            return state
        }
        if (key === 'v') {
            // VERB on the selector: view high scores for the highlighted game.
            state = openScoreView(state, GAME_LIST[state.selectorIndex].id)
            broadcast()
            return state
        }
        if (key === 'e') {
            const selected = GAME_LIST[state.selectorIndex]
            if (selected.id === 'flappy') {
                state = { ...state, activeGame: 'flappy', flappy: resetFlappy(state.flappy.best) }
            } else if (selected.id === 'tetris') {
                state = { ...state, activeGame: 'tetris', tetris: resetTetris(state.tetris.best) }
            } else if (selected.id === 'snake') {
                state = { ...state, activeGame: 'snake', snake: resetSnake(state.snake.best) }
            } else if (selected.id === 'game2048') {
                state = { ...state, activeGame: 'game2048', game2048: reset2048(state.game2048.best) }
            } else if (selected.id === 'minesweeper') {
                state = { ...state, activeGame: 'minesweeper', minesweeper: resetMinesweeper(state.minesweeper.bestTimeSec, state.minesweeper) }
            } else if (selected.id === 'sudoku') {
                state = { ...state, activeGame: 'sudoku', sudoku: resetSudoku(state.sudoku.bestTimeSec) }
            }
            broadcast()
            return state
        }
        return state
    }

    // VERB from within a game: peek at that game's high scores (RSET returns).
    if (key === 'v' && state.activeGame) {
        state = openScoreView(state, state.activeGame)
        broadcast()
        return state
    }

    // RSET from within any game returns to the selector and resets that game's
    // state (preserving the best score).
    if (key === 'r') {
        stopTicker()
        state = resetActiveGameToSelector(state)
        broadcast()
        return state
    }

    // Per-game input handling. Tick-driven games (flappy/tetris/snake) start
    // or stop the ticker based on the new phase; input-driven games don't
    // need a ticker.
    if (state.activeGame === 'flappy') {
        const next = handleFlappyKey(state.flappy, key)
        state = { ...state, flappy: next }
        if (next.phase === 'playing') startTicker()
        else stopTicker()
    } else if (state.activeGame === 'tetris') {
        const next = handleTetrisKey(state.tetris, key)
        state = { ...state, tetris: next }
        // 'clearing' needs the ticker running so the blink timer advances.
        if (next.phase === 'playing' || next.phase === 'clearing') startTicker()
        else stopTicker()
    } else if (state.activeGame === 'snake') {
        const next = handleSnakeKey(state.snake, key)
        state = { ...state, snake: next }
        if (next.phase === 'playing') startTicker()
        else stopTicker()
    } else if (state.activeGame === 'game2048') {
        state = { ...state, game2048: handle2048Key(state.game2048, key) }
    } else if (state.activeGame === 'minesweeper') {
        state = { ...state, minesweeper: handleMinesweeperKey(state.minesweeper, key) }
    } else if (state.activeGame === 'sudoku') {
        state = { ...state, sudoku: handleSudokuKey(state.sudoku, key) }
    }

    // A key press may have ended an input-driven game (minesweeper/sudoku/2048).
    state = maybeStartScoreEntry(state)

    broadcast()
    return state
}

// --- Scoreboard orchestration ---

/** The achieved score/time if the active game just finished, else null. */
function finishedValue(s: GamesAppState): number | null {
    switch (s.activeGame) {
        case 'flappy':      return s.flappy.phase === 'gameover' && s.flappy.score > 0 ? s.flappy.score : null
        case 'tetris':      return s.tetris.phase === 'gameover' && s.tetris.score > 0 ? s.tetris.score : null
        case 'snake':       return s.snake.phase === 'gameover' && s.snake.score > 0 ? s.snake.score : null
        case 'game2048':    return s.game2048.phase === 'gameover' && s.game2048.score > 0 ? s.game2048.score : null
        case 'minesweeper': return s.minesweeper.phase === 'won' ? Math.max(1, Math.round((Date.now() - s.minesweeper.startedAtMs) / 1000)) : null
        case 'sudoku':      return s.sudoku.phase === 'won' ? Math.max(1, Math.round(s.sudoku.finalTimeSec ?? 0)) : null
        default:            return null
    }
}

/** If the finished game qualifies for the leaderboard, open the initials entry. */
function maybeStartScoreEntry(s: GamesAppState): GamesAppState {
    if (s.scoreEntry.active || !s.activeGame) return s
    const value = finishedValue(s)
    if (value === null || !qualifies(s.activeGame, value)) return s
    return {
        ...s,
        scoreEntry: {
            active: true,
            stage: 'entry',
            viewOnly: false,
            gameId: s.activeGame,
            value,
            metric: SCORING[s.activeGame].metric,
            rank: 0,
            initials: 'AAA',
            cursor: 0,
            recent: getRecentInitials(),
            board: getBoard(s.activeGame),
        },
    }
}

/** Open the leaderboard for `gameId` in read-only mode (VERB from a game/selector). */
function openScoreView(s: GamesAppState, gameId: GameId): GamesAppState {
    return {
        ...s,
        scoreEntry: {
            active: true,
            stage: 'board',
            viewOnly: true,
            gameId,
            value: 0,
            metric: SCORING[gameId].metric,
            rank: 0,
            initials: 'AAA',
            cursor: 0,
            recent: [],
            board: getBoard(gameId),
        },
    }
}

function handleScoreEntryKey(s: GamesAppState, key: string): GamesAppState {
    const se = s.scoreEntry

    if (key === 'r') {
        // View-only: just close the overlay, returning to the game/selector as it was.
        if (se.viewOnly) return { ...s, scoreEntry: { ...INITIAL_SCORE_ENTRY } }
        // After a real entry: RSET exits to the selector (cancels if not committed).
        stopTicker()
        return resetActiveGameToSelector(s)
    }

    if (se.stage === 'board') return s   // only RSET does anything on the board screen

    const patch = (p: Partial<ScoreEntryState>): GamesAppState => ({ ...s, scoreEntry: { ...se, ...p } })

    if (key === '8' || key === '2') {
        const dir = key === '8' ? 1 : -1   // 8 = next letter, 2 = previous
        const chars = se.initials.split('')
        const li = (LETTERS.indexOf(chars[se.cursor]) + dir + 26) % 26
        chars[se.cursor] = LETTERS[li]
        return patch({ initials: chars.join('') })
    }
    if (key === '6') return patch({ cursor: Math.min(2, se.cursor + 1) })
    if (key === '4') return patch({ cursor: Math.max(0, se.cursor - 1) })
    if (key === 'v') {
        // Quick-pick: cycle through previously used initials.
        if (se.recent.length === 0) return s
        const idx = se.recent.indexOf(se.initials)
        return patch({ initials: se.recent[(idx + 1) % se.recent.length], cursor: 0 })
    }
    if (key === 'c') return commitScore(s, '---')   // leave blank
    if (key === 'e') return commitScore(s, se.initials)
    return s
}

function commitScore(s: GamesAppState, initials: string): GamesAppState {
    const se = s.scoreEntry
    if (!se.gameId) return s
    const { board, rank } = submitScore(se.gameId, { initials, value: se.value })
    return { ...s, scoreEntry: { ...se, stage: 'board', initials, rank, board } }
}

function resetActiveGameToSelector(s: GamesAppState): GamesAppState {
    const base: GamesAppState = {
        ...s,
        activeGame: null,
        scoreEntry: { ...INITIAL_SCORE_ENTRY },
    }
    switch (s.activeGame) {
        case 'flappy':      return { ...base, flappy: resetFlappy(s.flappy.best) }
        case 'tetris':      return { ...base, tetris: resetTetris(s.tetris.best) }
        case 'snake':       return { ...base, snake: resetSnake(s.snake.best) }
        case 'game2048':    return { ...base, game2048: { ...INITIAL_2048, best: s.game2048.best } }
        case 'minesweeper': return { ...base, minesweeper: resetMinesweeper(s.minesweeper.bestTimeSec, s.minesweeper) }
        case 'sudoku':      return { ...base, sudoku: { ...INITIAL_SUDOKU, bestTimeSec: s.sudoku.bestTimeSec } }
        default:            return base
    }
}

export function getGameList() {
    return GAME_LIST
}
