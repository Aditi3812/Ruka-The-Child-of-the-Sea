// ═══════════════════════════════════════════════════════════
//  Prologue.jsx  (v3 — The Birth Festival)
//  7 cinematic scroll sections with updated lore
// ═══════════════════════════════════════════════════════════

import React, { useRef, useState, useEffect, useCallback } from 'react'

// ─── Falling Stars Canvas ────────────────────────────────────
function FallingStarsCanvas() {
  const canvasRef = useRef()
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)
    const stars = Array.from({ length: 34 }, () => ({
      x: Math.random() * (canvas.width || 800),
      y: -Math.random() * 400,
      vy: 1.0 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.5,
      size: 1 + Math.random() * 2.8,
      trail: 0,
      alpha: 0.4 + Math.random() * 0.6,
      hue: Math.random() > 0.6 ? 38 : (Math.random() > 0.5 ? 200 : 270),
    }))
    let raf
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const s of stars) {
        s.y += s.vy; s.x += s.vx
        s.trail = Math.min(s.trail + 0.015, 1)
        const grad = ctx.createLinearGradient(s.x, s.y - s.vy * 12, s.x, s.y)
        grad.addColorStop(0, `hsla(${s.hue},80%,70%,0)`)
        grad.addColorStop(1, `hsla(${s.hue},80%,70%,${s.alpha * s.trail})`)
        ctx.beginPath(); ctx.strokeStyle = grad; ctx.lineWidth = s.size * 0.45
        ctx.moveTo(s.x, s.y - s.vy * 12); ctx.lineTo(s.x, s.y); ctx.stroke()
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${s.hue},90%,90%,${s.alpha})`; ctx.fill()
        if (s.y > canvas.height + 20) {
          s.y = -20; s.x = Math.random() * canvas.width; s.trail = 0
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none'
    }} />
  )
}

// ─── Constellation Background (faint) ────────────────────────
function ConstellationBg() {
  return (
    <svg viewBox="0 0 800 400" style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      opacity: 0.18, pointerEvents: 'none'
    }}>
      {/* Random star dots */}
      {[
        [80,60],[200,40],[350,90],[500,50],[650,80],[720,30],
        [120,200],[280,180],[420,220],[560,170],[700,210],
        [60,300],[190,330],[330,290],[480,340],[620,310],[760,280],
        [140,120],[390,140],[540,100],[670,150],
      ].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r={1.5 + (i%3)*0.5}
          fill={['#c9a84c','#a0c8ff','#c89cff'][i%3]} />
      ))}
      {/* Faint connecting lines */}
      {[
        [[80,60],[200,40]],[[200,40],[350,90]],[[350,90],[500,50]],
        [[120,200],[280,180]],[[280,180],[420,220]],[[420,220],[560,170]],
        [[60,300],[190,330]],[[190,330],[330,290]],
      ].map(([[x1,y1],[x2,y2]],i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#c9a84c" strokeWidth="0.5" strokeOpacity="0.4" />
      ))}
    </svg>
  )
}

// ─── Whale SVG ───────────────────────────────────────────────
function WhaleIllustration({ visible }) {
  return (
    <div className={`prologue-whale-wrap ${visible ? 'whale-visible' : ''}`}>
      <svg viewBox="0 0 340 180" fill="none" xmlns="http://www.w3.org/2000/svg"
        className="prologue-whale-svg">
        <ellipse cx="165" cy="98" rx="125" ry="48" fill="rgba(28,14,58,0.88)" />
        <ellipse cx="272" cy="90" rx="54" ry="38" fill="rgba(38,20,72,0.92)" />
        <ellipse cx="182" cy="112" rx="90" ry="20" fill="rgba(90,60,170,0.16)" />
        <path d="M42 94 C22 66, 8 54, 14 96 C8 120, 24 116, 42 104Z" fill="rgba(22,12,48,0.88)" />
        <path d="M42 104 C24 118, 10 134, 22 128 C34 120, 42 110, 46 104Z" fill="rgba(18,10,38,0.82)" />
        <path d="M148 54 C156 24, 174 20, 178 52Z" fill="rgba(32,18,62,0.92)" />
        <path d="M210 108 C232 130, 248 138, 236 122 C224 108, 212 102, 210 108Z" fill="rgba(28,16,58,0.82)" />
        <circle cx="278" cy="83" r="5.5" fill="rgba(160,120,255,0.75)" />
        <circle cx="280" cy="81" r="2.2" fill="rgba(220,200,255,0.95)" />
        {/* Cosmic glow dots along body */}
        {[[90,72],[122,58],[158,50],[192,66],[100,108],[138,118],[172,120],[208,116]].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r={1.6 + (i%3)*0.4} fill={['rgba(180,140,255,0.55)','rgba(201,168,76,0.5)','rgba(120,200,255,0.45)'][i%3]} />
        ))}
        {/* Star trail behind */}
        {[0,1,2,3,4].map(i => (
          <circle key={i} cx={30 - i*7} cy={96 + Math.sin(i*1.4)*14}
            r={2.8 - i*0.4} fill={`rgba(201,168,76,${0.65 - i*0.11})`} />
        ))}
        {/* Subtle body lines */}
        <path d="M50 96 Q165 72 272 88" stroke="rgba(160,120,255,0.12)" strokeWidth="1" fill="none" />
      </svg>
    </div>
  )
}

// ─── Blending Sky+Ocean bg ───────────────────────────────────
function SkyOceanBlend({ opacity }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `
        radial-gradient(ellipse at 50% 0%, rgba(26,58,120,0.55) 0%, transparent 65%),
        radial-gradient(ellipse at 50% 100%, rgba(20,80,90,0.45) 0%, transparent 65%),
        linear-gradient(180deg, #060818 0%, #0a1020 40%, #080c18 70%, #060814 100%)
      `,
      opacity,
      transition: 'opacity 1.2s ease',
    }} />
  )
}

// ─── Section wrapper ──────────────────────────────────────────
function Section({ id, className, children, style }) {
  return (
    <section id={id} className={`prologue-section ${className || ''}`} style={style}>
      {children}
    </section>
  )
}

// ─── Text Appearance Helper ──────────────────────────────────
const textAppearStyle = (v) => ({
  opacity: v,
  transform: `translateY(${(1 - v) * 12}px)`,
  transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
  display: 'block',
});

// ─── Main Prologue Component ─────────────────────────────────
export default function Prologue({ onDismiss }) {
  const containerRef = useRef()
  const [scrollPct, setScrollPct] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    const pct = max > 0 ? el.scrollTop / max : 0
    setScrollPct(pct)
    if (pct > 0.94) triggerDismiss()
  }, [])

  const triggerDismiss = useCallback(() => {
    if (dismissed) return
    setDismissed(true)
    setFadeOut(true)
    setTimeout(onDismiss, 1400)
    console.log('[Prologue] Dismissed — entering 3D world')
  }, [dismissed, onDismiss])

  useEffect(() => {
    const el = containerRef.current
    if (el) el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el?.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Enter' || e.key === ' ') triggerDismiss() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [triggerDismiss])

  // Scroll-driven section opacity helpers
  const vis = (start, end) => Math.max(0, Math.min(1, (scrollPct - start) / (end - start)))

  // S2: sky+ocean blend
  const s2 = vis(0.08, 0.18)
  // S3: whale + text
  const s3 = vis(0.26, 0.36)
  // S4: falling stars
  const s4 = vis(0.44, 0.53)
  // S5: child intro — slide from right
  const s5 = vis(0.55, 0.64)
  // S6: map the sky / constellations
  const s6 = vis(0.68, 0.76)
  // S7: final lines
  const s7 = vis(0.82, 0.90)

  // Granular visibilities for internal lines
  // S2
  const s2_label = vis(0.08, 0.10)
  const s2_line1 = vis(0.11, 0.14)
  const s2_line2 = vis(0.15, 0.18)

  // S3
  const s3_label = vis(0.26, 0.28)
  const s3_line1 = vis(0.29, 0.31)
  const s3_line2 = vis(0.32, 0.34)
  const s3_line3 = vis(0.34, 0.36)

  // S4
  const s4_line1 = vis(0.44, 0.47)
  const s4_line2 = vis(0.47, 0.50)
  const s4_line3 = vis(0.50, 0.53)

  // S5
  const s5_label = vis(0.55, 0.57)
  const s5_line1 = vis(0.58, 0.61)
  const s5_line2 = vis(0.61, 0.64)

  // S6
  const s6_line1 = vis(0.68, 0.70)
  const s6_line2 = vis(0.70, 0.73)
  const s6_line3 = vis(0.73, 0.76)

  // S7
  const s7_1 = vis(0.82, 0.84)
  const s7_2 = vis(0.84, 0.86)
  const s7_3 = vis(0.86, 0.88)
  const s7_4 = vis(0.88, 0.90)

  return (
    <div className={`prologue-root ${fadeOut ? 'prologue-fadeout' : ''}`} aria-label="Story Prologue">
      <div className="prologue-grain" />
      <div className="prologue-vignette" />

      <div className="prologue-scroll-container" ref={containerRef}>

        {/* ── S1: Title — The Birth Festival ── */}
        <Section id="s1" className="prologue-s1">
          <div className="prologue-drift-bg">
            <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
          </div>
          <div className="s1-content">
            <div className="s1-glyph">✦ · · · ✦ · · · ✦</div>
            <h1 className="s1-title">The Birth<br />Festival</h1>
            <div className="s1-rule" />
            <p className="s1-sub">once every millennium, the sky and sea finally meet</p>
          </div>
          <div className="scroll-invitation">
            <span>scroll to hear the story</span>
            <div className="scroll-arrow">↓</div>
          </div>
        </Section>

        {/* ── S2: Sky + Ocean meet ── */}
        <Section id="s2" className="prologue-s2" style={{ opacity: s2, transform: `translateY(${(1-s2)*28}px)` }}>
          <SkyOceanBlend opacity={s2} />
          <div className="s2-text" style={{ position: 'relative', zIndex: 2 }}>
            <div className="s2-label" style={textAppearStyle(s2_label)}>The Sacred Convergence</div>
            <p className="s2-body" style={{ ...textAppearStyle(s2_line1), fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              Once every millennium, <em>the sky and the sea finally meet.</em>
            </p>
            <p className="s2-body" style={{ 
              ...textAppearStyle(s2_line2), 
              fontSize: '1.4rem',
              textShadow: `0 0 15px rgba(255, 255, 255, ${s2_line2 * 0.5})` 
            }}>
              In that singular moment between worlds — between the infinite above and the boundless below — something extraordinary is born.
            </p>
          </div>
        </Section>

        {/* ── S3: Mother Whale ── */}
        <Section id="s3" className="prologue-s3" style={{ opacity: s3, transform: `translateY(${(1-s3)*28}px)` }}>
          <WhaleIllustration visible={s3 > 0.45} />
          <div className="s2-text">
            <div className="s2-label" style={textAppearStyle(s3_label)}>The Keeper of the Cosmos</div>
            <p className="s2-body">
              <span style={textAppearStyle(s3_line1)}>
                <em>Mother Whale</em> conducts this sacred ceremony.
              </span><br />
              <span style={textAppearStyle(s3_line2)}>Her ancient song gives birth to a new star.</span>
              <span style={textAppearStyle(s3_line2)}>Her breath shapes the constellation.</span>
              <span style={textAppearStyle(s3_line3)}>Her memory holds the universe whole.</span>
            </p>
          </div>
        </Section>

        {/* ── S4: Falling Stars ── */}
        <Section id="s4" className="prologue-s4" style={{ opacity: s4 }}>
          <FallingStarsCanvas />
          <div className="s4-text" style={{ position: 'relative', zIndex: 2 }}>
            <p className="s4-body">
              <span style={textAppearStyle(s4_line1)}>Each time…</span>
              <span style={textAppearStyle(s4_line2)}>she chooses one</span>
              <span style={{ ...textAppearStyle(s4_line3), color: '#c89cff', fontSize: '1.8rem', textShadow: `0 0 25px rgba(200,156,255, ${s4_line3})` }}>
                Child of the Sea.
              </span>
            </p>
          </div>
        </Section>

        {/* ── S5: Child of the Sea — slides from right ── */}
        <Section id="s5" className="prologue-s5"
          style={{
            opacity: s5,
            transform: `translateX(${(1 - s5) * 60}px)`,
            transition: 'opacity 0.6s ease, transform 0.6s ease'
          }}>
          <div className="s3-symbol" style={{ color: '#7adcff' }}>◈</div>
          <div className="s3-text">
            <div className="s3-label" style={{ ...textAppearStyle(s5_label), color: '#7adcff' }}>A Witness to Creation</div>
            <p className="s3-body" style={textAppearStyle(s5_line1)}>
              A witness. A vessel. A dreamer.<br />
              One soul chosen from the vast deep<br />
              to stand at the edge of all things...
            </p>
            <p className="s3-body s3-body-2" style={{ ...textAppearStyle(s5_line2), fontSize: '1.6rem', color: '#fff', textShadow: `0 0 20px rgba(255,255,255,${s5_line2*0.6})` }}>
              and watch a universe be born.
            </p>
          </div>
        </Section>

        {/* ── S6: Map the sky / constellations appear ── */}
        <Section id="s6" className="prologue-s6"
          style={{ opacity: s6, transform: `translateY(${(1-s6)*24}px)` }}>
          <ConstellationBg />
          <div className="s4-text" style={{ position: 'relative', zIndex: 2, maxWidth: '540px' }}>
            <p className="s4-body" style={{ fontSize: 'clamp(0.9rem, 2.2vw, 1.3rem)', lineHeight: 2.2 }}>
              <span style={textAppearStyle(s6_line1)}>But first…</span>
              <span style={{ ...textAppearStyle(s6_line2), opacity: s6_line2 * 0.7, fontSize: '0.9em' }}>they must map the sky.</span>
              <span style={{ ...textAppearStyle(s6_line2), opacity: s6_line2 * 0.7, fontSize: '0.9em' }}>Restore the constellations.</span>
              <span style={{ ...textAppearStyle(s6_line3), fontSize: '1.2rem', color: '#c9a84c', textShadow: `0 0 15px rgba(201,168,76,${s6_line3*0.4})` }}>Remember what was once whole.</span>
            </p>
          </div>
        </Section>

        {/* ── S7: The Revelation ── */}
        <Section id="s7" className="prologue-s7" style={{ opacity: s7, transform: `scale(${0.96 + s7*0.04})` }}>
          <div className="s5-rule-top" />
          <div className="s7-lines">
            <p className="s7-line" style={textAppearStyle(s7_1)}>
              Only then…
            </p>
            <p className="s7-line accent" style={textAppearStyle(s7_2)}>
              will they open their eyes —
            </p>
            <p className="s7-line" style={textAppearStyle(s7_3)}>
              and realize…
            </p>
            <p className="s7-line revelation" style={{ ...textAppearStyle(s7_4), fontSize: '2.4rem', textShadow: `0 0 30px rgba(255,255,255,${s7_4}), 0 0 60px rgba(180,140,255,${s7_4*0.5})` }}>
              The secrets held by the universe.
            </p>
          </div>
          <div className="s5-rule-bottom" />
          <button className="s5-cta" onClick={triggerDismiss}>
            ✦ &nbsp; Begin the Journey &nbsp; ✦
          </button>
          <p className="s5-hint">or keep scrolling</p>
        </Section>

        <div style={{ height: '20vh' }} />
      </div>
    </div>
  )
}
