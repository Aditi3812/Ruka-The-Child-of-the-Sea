// ═══════════════════════════════════════════════════════════
//  FinalSequence.jsx
//  Cinematic dialogue + transformation overlay for
//  the Transcendence / Birth Festival finale.
// ═══════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'

const DIALOGUE_LINES = [
  { text: 'Oh, now I see...',                                delay: 29000, style: 'pause'    },
  { text: 'In this Birth Festival, the witness is me.',       delay: 35000, style: 'normal'   },
  { text: 'I live in the Universe,and the Universe lives in Me.', delay: 41000, style: 'revelation' },
  { text: 'For I am,',                                      delay: 47000, style: 'revelation' },
]

function DialogueLine({ text, style, visible }) {
  const styles = {
    pause: {
      fontFamily: "'Cinzel', serif",
      fontStyle: 'italic',
      fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
      color: '#f0e8d5',
      opacity: visible ? 0.7 : 0,
      letterSpacing: '0.3em',
    },
    normal: {
      fontFamily: "'Crimson Text', serif",
      fontStyle: 'italic',
      fontSize: 'clamp(1rem, 2.2vw, 1.3rem)',
      color: '#f0e8d5',
      opacity: visible ? 0.85 : 0,
      letterSpacing: '0.08em',
    },
    revelation: {
      fontFamily: "'Cinzel', serif",
      fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
      color: '#ffd700',
      opacity: visible ? 1 : 0,
      letterSpacing: '0.25em',
      textShadow: '0 0 30px rgba(255,215,0,0.6), 0 0 60px rgba(255,165,0,0.4)',
    },
  }

  return (
    <p style={{
      ...styles[style],
      margin: '0.6rem 0',
      lineHeight: 1.7,
      whiteSpace: 'pre-line',
      transition: 'opacity 2s ease, transform 2s ease-out',
      transform: visible ? 'scale(1)' : 'scale(0.92)',
      textAlign: 'center',
    }}>
      {text}
    </p>
  )
}

export default function FinalSequence({ active, onRevelationChange }) {
  const [visibleLines, setVisibleLines] = useState(new Set())
  const [fadeLines, setFadeLines] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const [showFade, setShowFade] = useState(false)
  const [phase, setPhase] = useState('waiting')

  useEffect(() => {
    if (!active) return
    console.log('[FinalSequence] Cinematic sequence started')
    setPhase('dialogue')

    const timers = []

    // Reveal dialogue lines
    DIALOGUE_LINES.forEach((line, i) => {
      timers.push(setTimeout(() => {
        setVisibleLines(prev => new Set([...prev, i]))
      }, line.delay))
    })

    // Signal "I live in the Universe..." beat (Revelation)
    timers.push(setTimeout(() => {
      if (onRevelationChange) onRevelationChange(true)
    }, 41000))

    // Signal "For I am," beat (Conclusion)
    timers.push(setTimeout(() => {
      if (onRevelationChange) onRevelationChange(false)
    }, 47000))

    // Fade out dialogue lines before title
    timers.push(setTimeout(() => {
      setFadeLines(true)
    }, 52000))

    // Show Birth Festival title
    timers.push(setTimeout(() => {
      setShowTitle(true)
      console.log('[FinalSequence] Golden Title Revealed')
    }, 55000))

    // Final fade to white
    timers.push(setTimeout(() => {
      setShowFade(true)
      console.log('[FinalSequence] Final ascension fade')
    }, 65000))

    return () => timers.forEach(clearTimeout)
  }, [active])

  if (!active) return null

  return (
    <>
      {/* Dialogue box — above player */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 62,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        {/* Subtle background blur */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(100,60,200,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />

        {/* Dialogue lines */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem',
          maxWidth: '560px',
          textAlign: 'center',
          opacity: fadeLines ? 0 : 1,
          transition: 'opacity 2s ease',
        }}>
          {DIALOGUE_LINES.map((line, i) => {
            const isLastLine = i === DIALOGUE_LINES.length - 1;
            const lastLineVisible = visibleLines.has(DIALOGUE_LINES.length - 1);
            // When the last line "For I am," appears, we hide others so it centers perfectly
            const isLineVisible = visibleLines.has(i) && (!lastLineVisible || isLastLine);
            return (
              <DialogueLine
                key={i}
                text={line.text}
                style={line.style}
                visible={isLineVisible}
              />
            );
          })}
        </div>
      </div>

      {/* Birth Festival title */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 63,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: '25vh', // Positions title elegantly above the character
        opacity: showTitle ? 1 : 0,
        transition: 'opacity 3s ease',
      }}>
        <p style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(2.2rem, 7vw, 3.8rem)',
          letterSpacing: '0.35em',
          color: '#ffd700',
          textShadow: '0 0 25px #ffd700, 0 0 50px #c9a84c, 0 0 100px rgba(201,168,76,0.5)',
          margin: 0,
          textAlign: 'center',
        }}>
          THE CHILD OF THE SEA
        </p>
      </div>

      {/* Final fade to light */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(255,248,240,1) 0%, rgba(200,170,255,0.95) 60%, rgba(120,160,255,0.9) 100%)',
        opacity: showFade ? 1 : 0,
        transition: 'opacity 5s ease',
      }} />
    </>
  )
}
