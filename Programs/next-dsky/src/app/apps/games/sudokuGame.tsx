"use client"

import { useEffect, useState } from "react"
import type { SudokuState } from "../../../types/serverState"

interface SudokuGameProps {
    state: SudokuState
}

function formatTime(sec: number): string {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Positions whose value duplicates another in the same row/col/box. */
function findConflicts(board: SudokuState['board']): Set<string> {
    const bad = new Set<string>()
    const mark = (cells: { x: number; y: number; v: number }[]) => {
        const seen = new Map<number, { x: number; y: number }[]>()
        for (const c of cells) {
            if (c.v === 0) continue
            const arr = seen.get(c.v) ?? []
            arr.push({ x: c.x, y: c.y })
            seen.set(c.v, arr)
        }
        for (const arr of seen.values()) {
            if (arr.length > 1) arr.forEach(p => bad.add(`${p.y}-${p.x}`))
        }
    }
    for (let i = 0; i < 9; i++) {
        mark(board[i].map((cell, x) => ({ x, y: i, v: cell.value })))                 // row
        mark(board.map((row, y) => ({ x: i, y, v: row[i].value })))                   // col
    }
    for (let by = 0; by < 9; by += 3) {
        for (let bx = 0; bx < 9; bx += 3) {
            const cells: { x: number; y: number; v: number }[] = []
            for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) {
                cells.push({ x: bx + dx, y: by + dy, v: board[by + dy][bx + dx].value })
            }
            mark(cells)
        }
    }
    return bad
}

export default function SudokuGame({ state }: SudokuGameProps) {
    const primary = 'var(--menu-primary, #5ef08a)'
    const secondary = 'var(--menu-secondary, #2a7a44)'
    const accent = 'var(--menu-accent, #facc15)'
    const danger = '#f87171'

    const [now, setNow] = useState<number>(Date.now())
    useEffect(() => {
        if (state.phase !== 'playing') return
        const id = setInterval(() => setNow(Date.now()), 250)
        return () => clearInterval(id)
    }, [state.phase])

    const elapsed = state.phase === 'won'
        ? (state.finalTimeSec ?? 0)
        : state.startedAtMs > 0 ? (now - state.startedAtMs) / 1000 : 0

    const conflicts = findConflicts(state.board)
    const numMode = state.mode === 'enter'
    const cursorColor = numMode ? '#7dd3fc' : accent   // cyan while typing, amber while moving

    return (
        <div style={{
            position: 'absolute', inset: 0, background: '#000',
            display: 'flex', flexDirection: 'column',
            padding: '2cqh 3cqw', boxSizing: 'border-box',
            fontFamily: 'Gorton, "Arial Narrow", sans-serif', color: primary,
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '2.8cqh', marginBottom: '1.2cqh' }}>
                <span>TIME <b>{formatTime(elapsed)}</b></span>
                <span style={{
                    fontWeight: 700, color: cursorColor,
                    border: `1px solid ${cursorColor}`, borderRadius: '0.4cqh', padding: '0.2cqh 1.4cqw',
                }}>
                    {numMode ? 'NUM' : 'MOVE'}
                </span>
                <span style={{ color: secondary }}>
                    BEST {state.bestTimeSec !== null ? formatTime(state.bestTimeSec) : '--:--'}
                </span>
            </div>

            {/* Board */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
                <div style={{
                    aspectRatio: '1 / 1', height: '100%', maxWidth: '100%',
                    display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gridTemplateRows: 'repeat(9, 1fr)',
                    border: `2px solid ${primary}`, position: 'relative',
                }}>
                    {state.board.flatMap((row, y) =>
                        row.map((cell, x) => {
                            const isCursor = state.cursor.x === x && state.cursor.y === y
                            const conflict = conflicts.has(`${y}-${x}`)
                            const color = conflict ? danger : cell.given ? primary : accent
                            return (
                                <div key={`${y}-${x}`} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxSizing: 'border-box',
                                    // thick lines on 3×3 box boundaries, thin elsewhere
                                    borderRight: `${x % 3 === 2 && x !== 8 ? 2 : 0.5}px solid ${x % 3 === 2 && x !== 8 ? primary : secondary}`,
                                    borderBottom: `${y % 3 === 2 && y !== 8 ? 2 : 0.5}px solid ${y % 3 === 2 && y !== 8 ? primary : secondary}`,
                                    background: isCursor && state.phase === 'playing' ? (numMode ? 'rgba(125,211,252,0.22)' : 'rgba(250,204,21,0.22)') : cell.given ? 'rgba(94,240,138,0.07)' : 'transparent',
                                    outline: isCursor && state.phase === 'playing' ? `2px solid ${cursorColor}` : 'none',
                                    outlineOffset: '-2px',
                                    color,
                                    fontWeight: cell.given ? 700 : 500,
                                    fontSize: '3.6cqh',
                                    zIndex: isCursor ? 2 : 1,
                                }}>
                                    {cell.value !== 0 ? cell.value : ''}
                                </div>
                            )
                        })
                    )}

                    {state.phase === 'won' && (
                        <div style={{
                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.78)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            textAlign: 'center', zIndex: 10,
                        }}>
                            <div style={{ fontSize: '5cqh', fontWeight: 700, color: accent }}>SOLVED</div>
                            <div style={{ fontSize: '3cqh', color: primary, marginTop: '1cqh' }}>TIME: {formatTime(elapsed)}</div>
                            <div style={{ fontSize: '2.4cqh', color: secondary, marginTop: '0.4cqh' }}>
                                BEST: {state.bestTimeSec !== null ? formatTime(state.bestTimeSec) : '--:--'}
                            </div>
                            <div style={{ fontSize: '2.2cqh', color: secondary, marginTop: '1.2cqh' }}>RSET back</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Key hints — emphasise the active mode's main action */}
            <div style={{
                marginTop: '1.2cqh', fontSize: '2.2cqh', color: secondary,
                display: 'flex', justifyContent: 'center', gap: '2.5cqw', flexWrap: 'wrap',
            }}>
                <span style={{ color: cursorColor }}><K>KEY REL</K> {numMode ? '→ MOVE' : '→ NUM'}</span>
                {numMode
                    ? <span><K>1-9</K> place · <K>0</K> erase</span>
                    : <span><K>4</K>◀ <K>6</K>▶ <K>8</K>▲ <K>2</K>▼</span>}
                <span><K>+</K>/<K>-</K> step · <K>ENTR</K> next</span>
                <span><K>CLR</K> erase · <K>VERB</K> scores · <K>RSET</K> back</span>
            </div>
        </div>
    )
}

function K({ children }: { children: React.ReactNode }) {
    return <span style={{ color: 'var(--menu-primary, #5ef08a)', fontWeight: 600 }}>{children}</span>
}
