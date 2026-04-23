// ═══════════════════════════════════════════════════════════
//  BiomeSelectorPanel.jsx
//  Collapsible side panel listing biomes; calls onSelectBiome
//  with a target Z coordinate so App can teleport the player.
// ═══════════════════════════════════════════════════════════

import React, { useState } from 'react'

const BIOMES = [
  {
    id: 'forest',
    label: 'Enchanted Forest',
    emoji: '🌲',
    color: '#7fff7a',
    x: 0,
    z: 0,
    description: 'Dense canopy — 6 green stars await',
    available: true,
  },
  {
    id: 'ocean',
    label: 'Ocean Realm',
    emoji: '🌊',
    color: '#7adcff',
    x: 75,
    z: 0,
    description: 'Open water — 6 blue stars drift below',
    available: true,
  },
  {
    id: 'sky',
    label: 'Eternal Sky',
    emoji: '✨',
    color: '#c89cff',
    x: -75,
    z: 0,
    description: 'Floating platforms — 6 violet stars rise',
    available: true,
  },
  {
    id: 'frost',
    label: 'Frost Realm',
    emoji: '❄️',
    color: '#c0e8ff',
    x: 0,
    z: -75,
    description: 'Ice and silence — coming soon',
    available: true,
  },
  {
    id: 'sakura',
    label: 'Sakura Realm',
    emoji: '🌸',
    color: '#ffb8d8',
    x: 75,
    z: -75,
    description: 'Cherry blossoms — coming soon',
    available: true,
  },
  {
    id: 'spring',
    label: 'Spring Valley',
    emoji: '🌿',
    color: '#a8ff78',
    x: -75,
    z: -75,
    description: 'Lush meadows — coming soon',
    available: true,
  },
  {
    id: 'rainbow',
    label: 'Rainbow Sky Isles',
    emoji: '🌈',
    color: '#ffe06e',
    x: 0,
    z: -150,
    description: 'Prismatic heights — coming soon',
    available: true,
  },
  {
    id: 'twilight',
    label: 'Twilight Realm',
    emoji: '🌅',
    color: '#ff9966',
    x: 75,
    z: -150,
    description: 'Day meets night — coming soon',
    available: true,
  },
]

export default function BiomeSelectorPanel({ currentBiome, onSelectBiome, disabled }) {
  const [open, setOpen] = useState(false)

  if (disabled) return null

  return (
    <>
      {/* Toggle tab */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed',
          left: 0,
          top: '50%',
          transform: `translateY(-50%) ${open ? 'translateX(220px)' : 'translateX(0)'}`,
          zIndex: 55,
          background: 'rgba(8,5,18,0.85)',
          border: '1px solid rgba(201,168,76,0.25)',
          borderLeft: 'none',
          color: '#c9a84c',
          fontFamily: "'Cinzel', serif",
          fontSize: '0.62rem',
          letterSpacing: '0.22em',
          padding: '0.9rem 0.5rem',
          cursor: 'pointer',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
          backdropFilter: 'blur(8px)',
        }}
        title={open ? 'Close biome map' : 'Open biome map'}
      >
        {open ? '✕' : 'BIOMES'}
      </button>

      {/* Side panel */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: '50%',
        transform: `translateY(-50%) translateX(${open ? '0' : '-220px'})`,
        zIndex: 54,
        width: '220px',
        maxHeight: '80vh',
        overflowY: 'auto',
        background: 'rgba(6,4,14,0.9)',
        border: '1px solid rgba(201,168,76,0.18)',
        backdropFilter: 'blur(16px)',
        transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
        scrollbarWidth: 'none',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.2rem 1.4rem 0.8rem',
          borderBottom: '1px solid rgba(201,168,76,0.12)',
        }}>
          <p style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.62rem',
            letterSpacing: '0.3em',
            color: '#c9a84c',
            opacity: 0.7,
            margin: 0,
          }}>
            REALMS OF RESTORATION
          </p>
        </div>

        {/* Biome list */}
        <div style={{ padding: '0.5rem 0' }}>
          {BIOMES.map((b) => {
            const active = currentBiome === b.id
            const canSelect = b.available && !active
            return (
              <div
                key={b.id}
                onClick={() => {
                  if (!canSelect) return
                  console.log(`[BiomeSelectorPanel] Selected: ${b.id}`)
                  onSelectBiome(b.id, b.x, b.z)
                  setOpen(false)
                }}
                style={{
                  padding: '0.85rem 1.4rem',
                  cursor: canSelect ? 'pointer' : 'default',
                  borderLeft: active ? `2px solid ${b.color}` : '2px solid transparent',
                  background: active ? `${b.color}10` : 'transparent',
                  transition: 'all 0.25s ease',
                  opacity: b.available ? 1 : 0.38,
                  position: 'relative',
                  userSelect: 'none',
                }}
                onMouseEnter={e => { if (canSelect) e.currentTarget.style.background = `${b.color}18` }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.95rem' }}>{b.emoji}</span>
                  <span style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '0.68rem',
                    letterSpacing: '0.12em',
                    color: active ? b.color : '#f0e8d5',
                    textShadow: active ? `0 0 12px ${b.color}66` : 'none',
                  }}>
                    {b.label}
                  </span>
                </div>
                <p style={{
                  fontFamily: "'Crimson Text', serif",
                  fontStyle: 'italic',
                  fontSize: '0.7rem',
                  color: '#c8b898',
                  opacity: 0.65,
                  margin: 0,
                  paddingLeft: '1.5rem',
                }}>
                  {b.description}
                </p>
                {active && (
                  <div style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: b.color,
                    boxShadow: `0 0 6px ${b.color}`,
                  }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.8rem 1.4rem',
          borderTop: '1px solid rgba(201,168,76,0.1)',
        }}>
          <p style={{
            fontFamily: "'Crimson Text', serif",
            fontStyle: 'italic',
            fontSize: '0.68rem',
            color: '#c8b898',
            opacity: 0.45,
            margin: 0,
            textAlign: 'center',
          }}>
            fly freely to explore
          </p>
        </div>
      </div>
    </>
  )
}
