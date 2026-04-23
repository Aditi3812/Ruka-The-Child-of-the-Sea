// ═══════════════════════════════════════════════════════════
//  BiomeEntryOverlay.jsx
//  Cinematic "You have entered…" overlay on biome change
// ═══════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react'

const BIOME_META = {
  forest: {
    emoji: '🌲',
    name: 'The Enchanted Forest',
    subtitle: '— The Atelier of Nature —',
    color: '#7fff7a',
    glow: 'rgba(127,255,122,0.3)',
  },
  ocean: {
    emoji: '🌊',
    name: 'The Ocean Realm',
    subtitle: '— Where Stars Were Swallowed —',
    color: '#7adcff',
    glow: 'rgba(122,220,255,0.3)',
  },
  sky: {
    emoji: '✨',
    name: 'The Eternal Sky',
    subtitle: '— The Roof of All Memory —',
    color: '#c89cff',
    glow: 'rgba(200,156,255,0.3)',
  },
  frost: {
    emoji: '❄️',
    name: 'The Frost Realm',
    subtitle: '— Where Silence Has a Voice —',
    color: '#c0e8ff',
    glow: 'rgba(192,232,255,0.3)',
  },
  sakura: {
    emoji: '🌸',
    name: 'The Sakura Realm',
    subtitle: '— Petals of a Forgotten Dream —',
    color: '#ffb8d8',
    glow: 'rgba(255,184,216,0.3)',
  },
  spring: {
    emoji: '🌿',
    name: 'Spring Valley',
    subtitle: '— The First Breath of the World —',
    color: '#a8ff78',
    glow: 'rgba(168,255,120,0.3)',
  },
  rainbow: {
    emoji: '🌈',
    name: 'Rainbow Sky Isles',
    subtitle: '— Where Light Remembers to Dance —',
    color: '#ffe06e',
    glow: 'rgba(255,224,110,0.3)',
  },
  twilight: {
    emoji: '🌅',
    name: 'The Twilight Realm',
    subtitle: '— Between the Last Light and the First Dark —',
    color: '#ff9966',
    glow: 'rgba(255,153,102,0.3)',
  },
  transcendence: {
    emoji: '🐋',
    name: 'The Return',
    subtitle: '— The Cosmos Remembers You —',
    color: '#ffffff',
    glow: 'rgba(255,255,255,0.4)',
  },
}

export default function BiomeEntryOverlay({ biome }) {
  const [visible, setVisible] = useState(false)
  const [currentBiome, setCurrentBiome] = useState(null)
  const [phase, setPhase] = useState('hidden') // hidden | fadein | hold | fadeout
  const prevBiome = useRef(null)
  const timerRefs = useRef([])

  useEffect(() => {
    if (!biome || biome === prevBiome.current) return
    prevBiome.current = biome
    setCurrentBiome(biome)

    console.log(`[BiomeEntryOverlay] Entering: ${biome}`)

    // Clear any running timers
    timerRefs.current.forEach(clearTimeout)
    timerRefs.current = []

    setPhase('fadein')
    setVisible(true)

    const t1 = setTimeout(() => setPhase('hold'), 800)
    const t2 = setTimeout(() => setPhase('fadeout'), 3000)
    const t3 = setTimeout(() => { setVisible(false); setPhase('hidden') }, 4200)
    timerRefs.current = [t1, t2, t3]

    return () => timerRefs.current.forEach(clearTimeout)
  }, [biome])

  if (!visible || !currentBiome) return null
  const meta = BIOME_META[currentBiome] || BIOME_META.forest

  const opacity = phase === 'fadein' ? 1 : phase === 'hold' ? 1 : 0

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 65,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity,
      transition: phase === 'fadein'
        ? 'opacity 0.8s ease'
        : phase === 'fadeout'
        ? 'opacity 1.2s ease'
        : 'none',
    }}>
      {/* Backdrop glow */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '200px',
        borderRadius: '50%',
        background: `radial-gradient(ellipse, ${meta.glow} 0%, transparent 70%)`,
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        textAlign: 'center',
        padding: '2.5rem 4rem',
        border: `1px solid ${meta.color}22`,
        background: 'rgba(6,4,14,0.55)',
        backdropFilter: 'blur(12px)',
      }}>
        <p style={{
          fontFamily: "'Crimson Text', serif",
          fontStyle: 'italic',
          fontSize: '0.82rem',
          letterSpacing: '0.3em',
          color: meta.color,
          opacity: 0.65,
          marginBottom: '0.7rem',
        }}>
          You have entered…
        </p>
        <p style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(1.1rem, 2.8vw, 1.8rem)',
          letterSpacing: '0.16em',
          color: '#f0e8d5',
          textShadow: `0 0 30px ${meta.glow}, 0 0 60px ${meta.glow}`,
          marginBottom: '0.5rem',
        }}>
          {meta.emoji}&ensp;{meta.name}
        </p>
        <p style={{
          fontFamily: "'IM Fell English', serif",
          fontStyle: 'italic',
          fontSize: '0.88rem',
          letterSpacing: '0.12em',
          color: meta.color,
          opacity: 0.72,
        }}>
          {meta.subtitle}
        </p>
      </div>

      {/* Decorative lines */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        top: 'calc(50% + 80px)',
        width: '120px',
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${meta.color}55, transparent)`,
      }} />
    </div>
  )
}
