// ═══════════════════════════════════════════════════════════
//  ConstellationPanel.jsx
//  Displays constellation lore, star names, and diagram
//  for the biome the player is currently in.
// ═══════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'

const CONSTELLATION_DATA = {
  forest: {
    name: 'Viridan',
    subtitle: 'The Verdant Crown',
    lore: 'Woven into the canopy before the first dawn, Viridan was the constellation that taught the forests to grow upward — toward light they could not yet see.',
    color: '#7fff7a',
    stars: [
      { name: 'Alderak', meaning: 'First leaf of the first tree' },
      { name: 'Vespira', meaning: 'Evening breath of ancient wood' },
      { name: 'Noctis',  meaning: 'Darkness that lets seeds sleep' },
      { name: 'Caelum',  meaning: 'The sky a root dreams of' },
      { name: 'Sorel',   meaning: 'Wild root, untamed and true' },
      { name: 'Thalwen', meaning: 'The song that moss remembers' },
    ],
    // Simple diagram positions (unit square, center-origin)
    diagram: [
      [[-0.6, 0.4], [-0.1, 0.7]],
      [[-0.1, 0.7], [0.5,  0.5]],
      [[0.5,  0.5], [0.3, -0.1]],
      [[0.3, -0.1], [-0.3,-0.3]],
      [[-0.3,-0.3], [-0.7,-0.1]],
      [[-0.7,-0.1], [-0.6, 0.4]],
    ],
    nodes: [[-0.6,0.4],[-0.1,0.7],[0.5,0.5],[0.3,-0.1],[-0.3,-0.3],[-0.7,-0.1]],
  },
  ocean: {
    name: 'Pelagis',
    subtitle: 'The Deep Breath',
    lore: 'Pelagis was placed beneath the waves before water existed. It gave the ocean its depth, its patience, and its long, unhurried memory of the stars it once touched.',
    color: '#7adcff',
    stars: [
      { name: 'Mareven',  meaning: 'Tide that never forgets' },
      { name: 'Solunn',   meaning: 'Light bending through blue' },
      { name: 'Thyris',   meaning: 'Pressure at the deepest point' },
      { name: 'Aquelm',   meaning: 'The name water calls itself' },
      { name: 'Vespora',  meaning: 'Where surface meets void' },
      { name: 'Neridan',  meaning: 'Current that carries wishes' },
    ],
    diagram: [
      [[-0.7, 0.2],[0.0,  0.65]],
      [[0.0,  0.65],[0.65, 0.3]],
      [[0.65, 0.3], [0.4, -0.3]],
      [[0.4, -0.3], [-0.2,-0.6]],
      [[-0.2,-0.6], [-0.65,-0.2]],
      [[-0.65,-0.2],[-0.7,  0.2]],
    ],
    nodes: [[-0.7,0.2],[0.0,0.65],[0.65,0.3],[0.4,-0.3],[-0.2,-0.6],[-0.65,-0.2]],
  },
  sky: {
    name: 'Aethon',
    subtitle: 'The Windwoven',
    lore: 'Aethon was the last constellation placed before the atmosphere was breathed into being. It governs the space between — between breath and vacuum, between thought and void.',
    color: '#c89cff',
    stars: [
      { name: 'Zephyra',  meaning: 'Wind that knows where it came from' },
      { name: 'Luminal',  meaning: 'Light at the edge of seeing' },
      { name: 'Calyx',    meaning: 'The cup that holds altitude' },
      { name: 'Vorthen',  meaning: 'Spiral of a climbing hawk' },
      { name: 'Aelith',   meaning: 'Where birds stop existing' },
      { name: 'Pinnath',  meaning: 'The last star before the dark' },
    ],
    diagram: [
      [[-0.5, 0.7],[0.2,  0.5]],
      [[0.2,  0.5],[0.7,  0.0]],
      [[0.7,  0.0],[0.4, -0.55]],
      [[0.4, -0.55],[-0.3,-0.6]],
      [[-0.3,-0.6], [-0.7,-0.1]],
      [[-0.7,-0.1], [-0.5, 0.7]],
    ],
    nodes: [[-0.5,0.7],[0.2,0.5],[0.7,0.0],[0.4,-0.55],[-0.3,-0.6],[-0.7,-0.1]],
  },
  frost: {
    name: 'The Silent Crown',
    subtitle: '— Where Sound Began —',
    lore: '“Before the first song was ever sung, there was silence—endless and absolute. From that silence, the first rhythm formed. And from that rhythm, the universe began.”',
    color: '#c0e8ff',
    stars: [
      { name: 'Nivara', meaning: 'The frozen breath' },
      { name: 'Caelis', meaning: 'The waiting sky' },
      { name: 'Virel',  meaning: 'The first tremor' },
      { name: 'Thalos', meaning: 'The unspoken pulse' },
      { name: 'Eiryn',  meaning: 'The quiet beginning' },
    ],
    diagram: [[[-0.6,0.5],[0,0.8]],[[0,0.8],[0.6,0.5]],[[0.6,0.5],[0.4,-0.4]],[[0.4,-0.4],[-0.4,-0.4]],[[-0.4,-0.4],[-0.6,0.5]]],
    nodes: [[-0.6,0.5],[0,0.8],[0.6,0.5],[0.4,-0.4],[-0.4,-0.4]],
  },
  sakura: {
    name: 'The Blooming Memory',
    subtitle: '— Petals of Remembrance —',
    lore: '“Not all stars are born of fire. Some are born of remembrance. Every petal that falls carries a memory—and when enough are remembered, they return to the sky as light.”',
    color: '#ffb8d8',
    stars: [
      { name: 'Hanari', meaning: 'The first bloom' },
      { name: 'Selune', meaning: 'The drifting petal' },
      { name: 'Kaede',  meaning: 'The fleeting moment' },
      { name: 'Mirai',  meaning: 'What once was' },
      { name: 'Komorebi', meaning: 'The echo of spring' },
    ],
    diagram: [[[-0.5,0.2],[0,0.6]],[[0,0.6],[0.5,0.2]],[[0.5,0.2],[0.3,-0.5]],[[0.3,-0.5],[-0.3,-0.5]],[[-0.3,-0.5],[-0.5,0.2]]],
    nodes: [[-0.5,0.2],[0,0.6],[0.5,0.2],[0.3,-0.5],[-0.3,-0.5]],
  },
  spring: {
    name: 'The Awakening Field',
    subtitle: '— The Miracle of Life —',
    lore: '“When the first light touched the earth, the world did not awaken all at once. It rose slowly—blade by blade, breath by breath—until life remembered how to grow.”',
    color: '#a8ff78',
    stars: [
      { name: 'Verdan', meaning: 'The first green' },
      { name: 'Solis',  meaning: 'The gentle light' },
      { name: 'Liora',  meaning: 'The rising breath' },
      { name: 'Thera',  meaning: 'The living earth' },
      { name: 'Aethera', meaning: 'The open sky' },
    ],
    diagram: [[[-0.7,-0.2],[-0.3,0.4]],[[-0.3,0.4],[0.3,0.4]],[[0.3,0.4],[0.7,-0.2]],[[0.7,-0.2],[0,-0.6]],[[0,-0.6],[-0.7,-0.2]]],
    nodes: [[-0.7,-0.2],[-0.3,0.4],[0.3,0.4],[0.7,-0.2],[0,-0.6]],
  },
  rainbow: {
    name: 'The Bridge of Light',
    subtitle: '— Connection Between Realms —',
    lore: '“When the sky first met the sea, their meeting did not break the world—it connected it. Light bent, stretched, and curved—becoming a bridge between realms.”',
    color: '#ffe06e',
    stars: [
      { name: 'Prismara', meaning: 'The bending light' },
      { name: 'Aurex',    meaning: 'The golden arc' },
      { name: 'Luminel',  meaning: 'The crossing path' },
      { name: 'Vireon',   meaning: 'The color between' },
      { name: 'Elara',    meaning: 'The distant meeting' },
    ],
    diagram: [[[-0.8,-0.3],[-0.4,0.3]],[[-0.4,0.3],[0,0.6]],[[0,0.6],[0.4,0.3]],[[0.4,0.3],[0.8,-0.3]],[[0.8,-0.3],[-0.8,-0.3]]],
    nodes: [[-0.8,-0.3],[-0.4,0.3],[0,0.6],[0.4,0.3],[0.8,-0.3]],
  },
  twilight: {
    name: 'The Final Horizon',
    subtitle: '— Threshold of Transcendence —',
    lore: '“At the edge of day and night, the world holds its breath. This is where endings soften—and beginnings quietly return.”',
    color: '#ff9966',
    stars: [
      { name: 'Solara', meaning: 'The fading sun' },
      { name: 'Noctara', meaning: 'The rising night' },
      { name: 'Veyra',  meaning: 'The last light' },
      { name: 'Orien',  meaning: 'The watcher between' },
      { name: 'Kala',  meaning: 'The unseen dawn' },
    ],
    diagram: [[[-0.7,0.1],[-0.2,0.6]],[[-0.2,0.6],[0.4,0.4]],[[0.4,0.4],[0.7,-0.2]],[[0.7,-0.2],[0,-0.5]],[[0,-0.5],[-0.7,0.1]]],
    nodes: [[-0.7,0.1],[-0.2,0.6],[0.4,0.4],[0.7,-0.2],[0,-0.5]],
  },
}

const SCALE = 52 // px from center for diagram

function DiagramSVG({ data, collectedStars, color }) {
  const cx = 65, cy = 65
  return (
    <svg viewBox="0 0 130 130" style={{ width: '100%', maxWidth: '130px', overflow: 'visible' }}>
      {/* Lines */}
      {data.diagram.map(([[x1,y1],[x2,y2]], i) => (
        <line key={i}
          x1={cx + x1*SCALE} y1={cy - y1*SCALE}
          x2={cx + x2*SCALE} y2={cy - y2*SCALE}
          stroke={color} strokeWidth="0.7" strokeOpacity="0.35"
        />
      ))}
      {/* Nodes */}
      {data.nodes.map(([x,y], i) => {
        const starName = data.stars[i]?.name
        const collected = collectedStars?.has(starName)
        return (
          <g key={i}>
            {collected && (
              <circle cx={cx + x*SCALE} cy={cy - y*SCALE} r="7"
                fill={color} opacity="0.12" />
            )}
            <circle
              cx={cx + x*SCALE} cy={cy - y*SCALE}
              r={collected ? 3.5 : 2.2}
              fill={collected ? color : '#c8b898'}
              opacity={collected ? 1 : 0.45}
            />
            {collected && (
              <circle cx={cx + x*SCALE} cy={cy - y*SCALE} r="3.5"
                fill="none" stroke={color} strokeWidth="0.8" opacity="0.6" />
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function ConstellationPanel({ currentBiome, collectedStars, disabled }) {
  const [open, setOpen] = useState(false)
  const [prevBiome, setPrevBiome] = useState(null)

  // Auto-open briefly on biome change
  useEffect(() => {
    if (!currentBiome || currentBiome === prevBiome || currentBiome === 'transcendence') return
    setPrevBiome(currentBiome)
    setOpen(true)
    const t = setTimeout(() => setOpen(false), 5000)
    return () => clearTimeout(t)
  }, [currentBiome])

  if (disabled || currentBiome === 'transcendence') return null

  const data = CONSTELLATION_DATA[currentBiome]
  if (!data) return null

  const collectedCount = data.stars.filter(s => collectedStars?.has(s.name)).length
  const complete = collectedCount === data.stars.length

  return (
    <>
      {/* Toggle tab — right side */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: `translateY(-50%) ${open ? 'translateX(-260px)' : 'translateX(0)'}`,
          zIndex: 55,
          background: 'rgba(8,5,18,0.85)',
          border: '1px solid rgba(201,168,76,0.25)',
          borderRight: 'none',
          color: data.color,
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
      >
        {open ? '✕' : '✦ SKY'}
      </button>

      {/* Panel */}
      <div style={{
        position: 'fixed',
        right: 0,
        top: '50%',
        transform: `translateY(-50%) translateX(${open ? '0' : '260px'})`,
        zIndex: 54,
        width: '260px',
        maxHeight: '85vh',
        overflowY: 'auto',
        background: 'rgba(6,4,14,0.92)',
        border: '1px solid rgba(201,168,76,0.15)',
        backdropFilter: 'blur(16px)',
        transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
        scrollbarWidth: 'none',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.4rem 1.5rem 1rem',
          borderBottom: `1px solid ${data.color}22`,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.6rem',
            letterSpacing: '0.32em',
            color: '#c9a84c',
            opacity: 0.6,
            marginBottom: '0.5rem',
          }}>
            CONSTELLATION
          </p>
          <h2 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '1.25rem',
            letterSpacing: '0.1em',
            color: data.color,
            textShadow: `0 0 20px ${data.color}55`,
            margin: '0 0 0.2rem',
          }}>
            {data.name}
          </h2>
          <p style={{
            fontFamily: "'IM Fell English', serif",
            fontStyle: 'italic',
            fontSize: '0.78rem',
            color: '#c8b898',
            opacity: 0.7,
            margin: 0,
          }}>
            {data.subtitle}
          </p>
        </div>

        {/* Diagram */}
        <div style={{
          padding: '1.2rem',
          display: 'flex',
          justifyContent: 'center',
          borderBottom: `1px solid ${data.color}18`,
        }}>
          <DiagramSVG data={data} collectedStars={collectedStars} color={data.color} />
        </div>

        {/* Progress */}
        <div style={{
          padding: '0.8rem 1.5rem',
          borderBottom: `1px solid ${data.color}18`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.4rem',
          }}>
            <span style={{
              fontFamily: "'Crimson Text', serif",
              fontStyle: 'italic',
              fontSize: '0.72rem',
              color: '#c8b898',
              opacity: 0.65,
            }}>
              Stars restored
            </span>
            <span style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '0.72rem',
              color: complete ? data.color : '#f0e8d5',
              textShadow: complete ? `0 0 10px ${data.color}` : 'none',
            }}>
              {collectedCount} / {data.stars.length}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{
            height: '2px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '1px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${(collectedCount / data.stars.length) * 100}%`,
              background: data.color,
              boxShadow: `0 0 8px ${data.color}`,
              transition: 'width 0.6s ease',
              borderRadius: '1px',
            }} />
          </div>
          {complete && (
            <p style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '0.62rem',
              letterSpacing: '0.2em',
              color: data.color,
              textAlign: 'center',
              marginTop: '0.6rem',
              opacity: 0.9,
            }}>
              ✦ CONSTELLATION RESTORED ✦
            </p>
          )}
        </div>

        {/* Lore */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: `1px solid ${data.color}18` }}>
          <p style={{
            fontFamily: "'IM Fell English', serif",
            fontStyle: 'italic',
            fontSize: '0.78rem',
            lineHeight: 1.8,
            color: '#f0e8d5',
            opacity: 0.78,
          }}>
            "{data.lore}"
          </p>
        </div>

        {/* Star list */}
        <div style={{ padding: '0.8rem 0 0.5rem' }}>
          <p style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.58rem',
            letterSpacing: '0.28em',
            color: '#c9a84c',
            opacity: 0.55,
            padding: '0 1.5rem',
            marginBottom: '0.5rem',
          }}>
            STARS OF {data.name.toUpperCase()}
          </p>
          {data.stars.map((star) => {
            const collected = collectedStars?.has(star.name)
            return (
              <div key={star.name} style={{
                padding: '0.55rem 1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                opacity: collected ? 1 : 0.45,
              }}>
                <span style={{
                  fontSize: '0.55rem',
                  color: data.color,
                  marginTop: '0.15rem',
                  flexShrink: 0,
                  textShadow: collected ? `0 0 8px ${data.color}` : 'none',
                }}>
                  {collected ? '✦' : '◌'}
                </span>
                <div>
                  <p style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    color: collected ? data.color : '#f0e8d5',
                    margin: '0 0 0.1rem',
                  }}>
                    {star.name}
                  </p>
                  <p style={{
                    fontFamily: "'Crimson Text', serif",
                    fontStyle: 'italic',
                    fontSize: '0.68rem',
                    color: '#c8b898',
                    opacity: 0.6,
                    margin: 0,
                  }}>
                    {star.meaning}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
