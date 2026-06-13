"use client"

import type { ScoreEntryState } from "../../../types/serverState"

const GAME_LABELS: Record<string, string> = {
    flappy: 'FLAPPY ROCKET',
    tetris: 'TETRIS',
    snake: 'SNAKE',
    game2048: '2048',
    minesweeper: 'MINESWEEPER',
    sudoku: 'SUDOKU',
}

function formatValue(value: number, metric: 'score' | 'time'): string {
    if (metric === 'time') {
        const m = Math.floor(value / 60)
        const s = Math.floor(value % 60)
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }
    return String(value)
}

export default function ScoreEntryView({ state }: { state: ScoreEntryState }) {
    const primary = 'var(--menu-primary, #5ef08a)'
    const secondary = 'var(--menu-secondary, #2a7a44)'
    const accent = 'var(--menu-accent, #facc15)'
    const label = state.gameId ? GAME_LABELS[state.gameId] ?? '' : ''

    const wrap: React.CSSProperties = {
        position: 'absolute', inset: 0, background: '#000',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '3cqh 5cqw', boxSizing: 'border-box',
        fontFamily: 'Gorton, "Arial Narrow", sans-serif', color: primary, textAlign: 'center',
    }

    if (state.stage === 'entry') {
        return (
            <div style={wrap}>
                <div style={{ fontSize: '3.4cqh', fontWeight: 700, color: accent, letterSpacing: '0.15em' }}>
                    NEW HIGH SCORE
                </div>
                <div style={{ fontSize: '2.8cqh', color: secondary, marginTop: '0.6cqh' }}>
                    {label} · {formatValue(state.value, state.metric)}
                </div>

                {/* 3 initials */}
                <div style={{ display: 'flex', gap: '3cqw', margin: '3cqh 0' }}>
                    {state.initials.split('').map((ch, i) => {
                        const sel = i === state.cursor
                        return (
                            <div key={i} style={{
                                width: '12cqw', height: '12cqh', minWidth: '12cqw',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '8cqh', fontWeight: 700,
                                border: `2px solid ${sel ? accent : secondary}`,
                                background: sel ? 'rgba(250,204,21,0.15)' : 'transparent',
                                color: sel ? accent : primary,
                            }}>
                                {ch}
                            </div>
                        )
                    })}
                </div>

                {state.recent.length > 0 && (
                    <div style={{ fontSize: '2.2cqh', color: secondary }}>
                        recent: {state.recent.join(' ')}
                    </div>
                )}

                <div style={{ fontSize: '2.2cqh', color: secondary, marginTop: '2cqh', lineHeight: 1.7 }}>
                    <div><K>8</K>/<K>2</K> letter · <K>4</K>/<K>6</K> slot · <K>VERB</K> recent</div>
                    <div><K>ENTR</K> save · <K>CLR</K> leave blank · <K>RSET</K> skip</div>
                </div>
            </div>
        )
    }

    // stage 'board' — the leaderboard
    return (
        <div style={wrap}>
            <div style={{ fontSize: '3.6cqh', fontWeight: 700, letterSpacing: '0.15em' }}>{label}</div>
            <div style={{ fontSize: '2.6cqh', color: accent, marginBottom: '2cqh' }}>HIGH SCORES</div>
            {state.board.length === 0 && (
                <div style={{ fontSize: '2.8cqh', color: secondary, margin: '2cqh 0' }}>NO SCORES YET</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8cqh', width: '60cqw', maxWidth: '90%' }}>
                {state.board.map((entry, i) => {
                    const here = i + 1 === state.rank
                    return (
                        <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: '3.2cqh', fontWeight: here ? 700 : 500,
                            color: here ? accent : primary,
                            padding: '0.4cqh 2cqw',
                            background: here ? 'rgba(250,204,21,0.12)' : 'transparent',
                        }}>
                            <span style={{ color: secondary }}>{i + 1}</span>
                            <span style={{ letterSpacing: '0.3em' }}>{entry.initials}</span>
                            <span>{formatValue(entry.value, state.metric)}</span>
                        </div>
                    )
                })}
            </div>
            <div style={{ fontSize: '2.3cqh', color: secondary, marginTop: '2.5cqh' }}>
                <K>RSET</K> back to games
            </div>
        </div>
    )
}

function K({ children }: { children: React.ReactNode }) {
    return <span style={{ color: 'var(--menu-primary, #5ef08a)', fontWeight: 600 }}>{children}</span>
}
