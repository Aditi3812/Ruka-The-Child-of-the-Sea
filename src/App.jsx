// ═══════════════════════════════════════════════════════════
//  STELLAR JOURNEY — App.jsx  (v5 — Full 8-Biome Living Cosmos)
//
//  Biomes (all mandatory, all implemented):
//  1. Enchanted Forest  (day)
//  2. Ocean Realm       (sunset)
//  3. Sky Realm         (night / floating islands)
//  4. Frost Realm       (night / ice)
//  5. Sakura Realm      (dawn / twilight)
//  6. Spring Valley     (day meadow)
//  7. Rainbow Sky Isles (day / vertically linked above Spring)
//  8. Twilight Zone     (sunset → night / transcendence trigger)
//
//  Systems preserved: movement, camera, star-collection,
//  constellation panel, biome selector, final sequence.
// ═══════════════════════════════════════════════════════════

import React, {
  useRef, useState, useEffect, useCallback, useMemo
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

import PlayerController   from './PlayerController.jsx'
import CameraController   from './CameraController.jsx'
import Prologue           from './Prologue.jsx'
import BiomeEntryOverlay  from './BiomeEntryOverlay.jsx'
import BiomeSelectorPanel from './BiomeSelectorPanel.jsx'
import ConstellationPanel from './ConstellationPanel.jsx'
import FinalSequence      from './FinalSequence.jsx'

// ═══════════════════════════════════════════════════════════
//  WORLD LAYOUT
// ═══════════════════════════════════════════════════════════
const LAYOUT = {
  forest:   { x: 0,    z: 0 },
  ocean:    { x: 75,   z: 0 },
  sky:      { x: -75,  z: 0 },
  frost:    { x: 0,    z: -75 },
  sakura:   { x: 75,   z: -75 },
  spring:   { x: -75,  z: -75 },
  rainbow:  { x: 0,    z: -150 },
  twilight: { x: 75,   z: -150 },
}

const BIOME_LABELS = {
  forest:        'The Enchanted Forest',
  ocean:         'The Ocean Realm',
  sky:           'The Eternal Sky',
  frost:         'The Frost Realm',
  sakura:        'The Sakura Realm',
  spring:        'Spring Valley',
  rainbow:       'Rainbow Sky Isles',
  twilight:      'The Twilight Zone',
  transcendence: 'The Return',
}

function detectBiome(pos, transcendence) {
  if (transcendence) return 'transcendence'
  
  let closest = 'forest'
  let minDist = Infinity
  
  Object.entries(LAYOUT).forEach(([id, coord]) => {
    const dist = Math.sqrt(Math.pow(pos.x - coord.x, 2) + Math.pow(pos.z - coord.z, 2))
    if (dist < minDist) {
      minDist = dist
      closest = id
    }
  })
  return closest
}

// ═══════════════════════════════════════════════════════════
//  STRING TUNE
// ═══════════════════════════════════════════════════════════
function useStringTune() {
  useEffect(() => {
    import('@fiddle-digital/string-tune')
      .then((mod) => {
        const ST = mod.default || mod.StringTune || mod
        if (typeof ST === 'function') {
          const inst = new ST()
          if (typeof inst.init === 'function') inst.init()
          console.log('[StringTune] initialized')
        } else {
          console.log('[StringTune] no constructor — skipping')
        }
      })
      .catch((err) => console.log('[StringTune] failed:', err.message))
  }, [])
}

// ═══════════════════════════════════════════════════════════
//  DEBUG CUBE
// ═══════════════════════════════════════════════════════════
function DebugCube({ visible }) {
  const ref = useRef()
  const logged = useRef(false)
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.x += 0.01
    ref.current.rotation.y += 0.015
    if (!logged.current) { console.log('[PHASE 1] Render loop active'); logged.current = true }
  })
  if (!visible) return null
  return (
    <mesh ref={ref} position={[0, 2, -4]}>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshStandardMaterial color="#c9a84c" emissive="#c9a84c" emissiveIntensity={0.6} />
    </mesh>
  )
}

// ═══════════════════════════════════════════════════════════
//  PLAYER MESH
// ═══════════════════════════════════════════════════════════
function PlayerMesh({ playerRef, transcendence, revelationActive }) {
  const auraRef = useRef()
  const particles = useMemo(() => Array.from({ length: 60 }).map(() => ({
    pos: [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
    color: ['#ffb0d0', '#7adcff', '#ffd700', '#c89cff', '#7fff7a'][Math.floor(Math.random() * 5)]
  })), [])

  useFrame((state) => {
    if (!auraRef.current) return
    const t = state.clock.elapsedTime
    const targetOpacity = revelationActive ? 0.6 : (transcendence ? 0.35 : 0.1)
    const targetScale = revelationActive ? 2.5 : (transcendence ? 1.4 : 1.1)
    
    auraRef.current.material.opacity = THREE.MathUtils.lerp(auraRef.current.material.opacity, targetOpacity + Math.sin(t * 4) * 0.1, 0.05)
    auraRef.current.scale.setScalar(THREE.MathUtils.lerp(auraRef.current.scale.x, targetScale, 0.05))
  })

  return (
    <group ref={playerRef} position={[0, 1.2, 5]}>
      {/* Head */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial 
          color="#f8f4e8" 
          roughness={0.8} 
          transparent={transcendence} 
          opacity={revelationActive ? 0.2 : (transcendence ? 0.5 : 1)} 
        />
        {/* Dot Eyes */}
        <mesh position={[0.07, 0, 0.18]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.07, 0, 0.18]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshBasicMaterial color="#1a1a1a" />
        </mesh>
      </mesh>
      {/* Simple Cloak */}
      <mesh position={[0, 0.15, 0]}>
        <coneGeometry args={[0.35, 0.7, 12, 1, true]} />
        <meshStandardMaterial 
          color={transcendence ? "#ffffff" : "#4a357a"} 
          transparent 
          opacity={revelationActive ? 0.15 : (transcendence ? 0.4 : 1)}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Inner Sparkles & Transcendence Glow */}
      {transcendence && (
        <>
          <mesh ref={auraRef}>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.2} depthWrite={false} />
          </mesh>
          {particles.map((p, i) => (
            <mesh key={i} position={p.pos.map(v => v * (revelationActive ? 2.2 : 0.6))}>
              <sphereGeometry args={[revelationActive ? 0.025 : 0.015, 4, 4]} />
              <meshBasicMaterial color={p.color} />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
//  STAR (collectible)
// ═══════════════════════════════════════════════════════════
function Star({ position, name, biomeColor, onCollect, collected }) {
  const coreRef = useRef()
  const auraRef = useRef()
  const [hovered, setHovered] = useState(false)
  const [fading,  setFading]  = useState(false)
  const alphaRef = useRef(1)
  const doneRef  = useRef(false)

  useFrame((state) => {
    if (doneRef.current) return
    const t = state.clock.elapsedTime
    if (coreRef.current) {
      coreRef.current.position.y = position[1] + Math.sin(t*1.1+position[0])*0.28
      coreRef.current.scale.setScalar(1 + Math.sin(t*2.3+position[2])*0.13)
    }
    if (auraRef.current) auraRef.current.material.opacity = 0.15 + Math.sin(t*1.7+position[2])*0.1
    if (fading && coreRef.current) {
      alphaRef.current = Math.max(0, alphaRef.current - 0.032)
      if (coreRef.current.material) coreRef.current.material.opacity = alphaRef.current
      if (auraRef.current) auraRef.current.material.opacity = alphaRef.current * 0.2
      if (alphaRef.current <= 0) { doneRef.current = true; onCollect(name) }
    }
  })

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    if (collected || fading) return
    console.log(`[Star] Collected: ${name}`)
    setFading(true)
  }, [collected, fading, name])

  if (collected && doneRef.current) return null
  if (collected && !fading)        return null
  const col = hovered ? '#ffffff' : biomeColor
  return (
    <group>
      <mesh position={position} onClick={handleClick}
        onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <sphereGeometry args={[1.0, 6, 6]} /><meshBasicMaterial visible={false} />
      </mesh>
      <mesh ref={auraRef} position={position}>
        <sphereGeometry args={[0.62, 8, 8]} />
        <meshBasicMaterial color={col} transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef} position={position}>
        <sphereGeometry args={[0.19, 10, 10]} />
        <meshStandardMaterial color={col} emissive={col}
          emissiveIntensity={hovered ? 4.5 : 2.2} transparent opacity={1} />
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
//  CONSTELLATION LINES
// ═══════════════════════════════════════════════════════════
function getConstellationColor(biome, defaultColor) {
  const lightBiomes = ['forest', 'sakura', 'spring', 'rainbow'];
  if (lightBiomes.includes(biome)) {
    // Return a dark version of the theme color or a neutral dark
    if (biome === 'forest') return '#0d1f0a';
    if (biome === 'sakura') return '#3a1a20';
    if (biome === 'spring') return '#1a3a0a';
    if (biome === 'rainbow') return '#443300';
  }
  return defaultColor;
}

function ConstellationLines({ stars, color }) {
  const segments = useMemo(() => {
    const lines = []
    for (let i = 0; i < stars.length - 1; i++)
      lines.push([new THREE.Vector3(...stars[i].position), new THREE.Vector3(...stars[i+1].position)])
    if (stars.length >= 4) lines.push([new THREE.Vector3(...stars[0].position), new THREE.Vector3(...stars[3].position)])
    if (stars.length >= 6) lines.push([new THREE.Vector3(...stars[2].position), new THREE.Vector3(...stars[5].position)])
    return lines
  }, [stars])
  return (
    <group>
      {segments.map((pts, i) => (
        <Line key={i} points={pts} color={color} lineWidth={1.3} transparent opacity={0.55} />
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
//  GLOBAL STAR FIELD
// ═══════════════════════════════════════════════════════════
function GlobalStarField() {
  const geo = useMemo(() => {
    const pts = []
    for (let i = 0; i < 600; i++)
      pts.push((Math.random()-0.5)*260, (Math.random()*65)-5, -8-Math.random()*440)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3))
    return g
  }, [])
  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.09} transparent opacity={0.28} sizeAttenuation />
    </points>
  )
}

// ═══════════════════════════════════════════════════════════
//  BIOME 1: ENCHANTED FOREST  (day, warm, open)
// ═══════════════════════════════════════════════════════════
const FOREST_STAR_DATA = [
  { position: [-8,  6,  LAYOUT.forest.z-5],  name: 'Alderak' },
  { position: [8,   8,  LAYOUT.forest.z-5],  name: 'Vespira' },
  { position: [-12, 5,  LAYOUT.forest.z-18], name: 'Noctis'  },
  { position: [-24, 10, LAYOUT.forest.z-24], name: 'Caelum'  },
  { position: [24,  8,  LAYOUT.forest.z-12], name: 'Sorel'   },
  { position: [-4,  11, LAYOUT.forest.z-8],  name: 'Thalwen' },
]

const FOREST_TREES = (() => {
  const pts = [
    [-18,-3],[-13,-9],[-7,-5],[-1,-4],[3,-8],[7,-6],[12,-10],[17,-4],
    [-16,-15],[-10,-13],[-5,-17],[1,-14],[6,-18],[11,-13],[15,-16],
    [-18,-22],[-12,-24],[-6,-20],[1,-25],[6,-22],[11,-24],[17,-19],
    [-14,-30],[-8,-28],[-3,-31],[4,-29],[9,-27],[14,-31],
    [-20,-10],[20,-10],[-20,-25],[20,-25],
  ]
  return pts.map(([x,z]) => ({
    x: LAYOUT.forest.x+x, z: LAYOUT.forest.z+z,
    h: 3.5+Math.abs((x*3+z)%5),
    c: ['#1a4d14','#226320','#2e6a28','#1e5018','#3a7234'][Math.abs(x+z)%5],
    tc: ['#3b1f08','#4a2810','#3a1c06'][Math.abs(x*z+1)%3],
  }))
})()

const FOREST_FLOWERS = Array.from({length:45}, (_,i) => {
  const s = i*9.17
  return { x: LAYOUT.forest.x+((s*11.3)%54)-27, z: LAYOUT.forest.z-2-(s%32),
    col: ['#ff6b6b','#ff9ff3','#feca57','#48dbfb','#ff9ff3'][i%5], phase: s%6.28 }
})

function ForestBiome({ collectedStars, onStarCollect, complete }) {
  const flowerRefs = useRef([])
  const ffGeo = useMemo(() => {
    const pts = []
    for (let i=0;i<60;i++) pts.push(LAYOUT.forest.x+(Math.random()-0.5)*55, 1+Math.random()*12, LAYOUT.forest.z-Math.random()*40)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts),3))
    return g
  }, [])
  useFrame(({clock}) => {
    const t = clock.elapsedTime
    flowerRefs.current.forEach((m,i) => {
      if (!m) return
      m.position.y = 0.08 + Math.sin(t*0.8+FOREST_FLOWERS[i].phase)*0.05
    })
  })
  return (
    <group>
      {/* Brown soil ground */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[LAYOUT.forest.x,-0.5,LAYOUT.forest.z-15]}>
        <planeGeometry args={[100,100]} /><meshStandardMaterial color="#3d2b1f" roughness={1} />
      </mesh>

      {/* Green grass patches */}
      {[[-12,LAYOUT.forest.z-8],[8,LAYOUT.forest.z-16],[-3,LAYOUT.forest.z-24],[15,LAYOUT.forest.z-12],
        [LAYOUT.forest.x+5,LAYOUT.forest.z-5],[LAYOUT.forest.x-10,LAYOUT.forest.z-20]].map(([x,z],i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x,-0.48,z]}>
          <circleGeometry args={[4+i*0.7,12]} />
          <meshStandardMaterial color="#1a3d12" roughness={1} transparent opacity={0.7} />
        </mesh>
      ))}
      {FOREST_TREES.map((t,i) => (
        <group key={i} position={[t.x,0,t.z]}>
          <mesh position={[0,t.h*0.22,0]}>
            <cylinderGeometry args={[0.18,0.24,t.h*0.44,7]} />
            <meshStandardMaterial color={t.tc} roughness={1} />
          </mesh>
          <mesh position={[0,t.h*0.62,0]}>
            <boxGeometry args={[t.h*0.8,t.h*0.52,t.h*0.8]} />
            <meshStandardMaterial color={t.c} roughness={0.85} />
          </mesh>
          <mesh position={[0,t.h*0.88,0]}>
            <boxGeometry args={[t.h*0.52,t.h*0.4,t.h*0.52]} />
            <meshStandardMaterial color="#2d6222" roughness={0.8} />
          </mesh>
          <mesh position={[0,t.h*1.1,0]}>
            <boxGeometry args={[t.h*0.3,t.h*0.28,t.h*0.3]} />
            <meshStandardMaterial color="#3a7234" roughness={0.8} />
          </mesh>
        </group>
      ))}
      {[[-6,LAYOUT.forest.z-7],[2,LAYOUT.forest.z-13],[-18,LAYOUT.forest.z-18],[10,LAYOUT.forest.z-20],[-10,LAYOUT.forest.z-26],[16,LAYOUT.forest.z-5]].map(([x,z],i) => (
        <group key={i} position={[x,0.25,z]}>
          <mesh><sphereGeometry args={[0.6,8,6]}/><meshStandardMaterial color="#1c4a14" roughness={0.9}/></mesh>
          <mesh position={[0.4,0.1,0.2]}><sphereGeometry args={[0.4,7,5]}/><meshStandardMaterial color="#22581a" roughness={0.9}/></mesh>
          <mesh position={[-0.3,0.15,-0.2]}><sphereGeometry args={[0.45,7,5]}/><meshStandardMaterial color="#1e4f16" roughness={0.9}/></mesh>
        </group>
      ))}
      {FOREST_FLOWERS.map((f,i) => (
        <mesh key={i} ref={el => flowerRefs.current[i] = el} position={[f.x,0.08,f.z]}>
          <sphereGeometry args={[0.1,6,6]} />
          <meshStandardMaterial color={f.col} emissive={f.col} emissiveIntensity={0.9} />
        </mesh>
      ))}
      {[[LAYOUT.forest.x-9,LAYOUT.forest.z-12],[LAYOUT.forest.x+6,LAYOUT.forest.z-20],[LAYOUT.forest.x-16,LAYOUT.forest.z-6]].map(([x,z],i) => (
        <mesh key={i} position={[x,4,z]} rotation={[0,i*0.6,0]}>
          <cylinderGeometry args={[0.4,1.2,14,8,1,true]} />
          <meshBasicMaterial color="#ffe88a" transparent opacity={0.04} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Firefly-like star field — low density */}
      <points geometry={ffGeo}>
        <pointsMaterial color="#ccffaa" size={0.10} transparent opacity={0.50} sizeAttenuation />
      </points>
      {FOREST_STAR_DATA.map(s => (
        <Star key={s.name} position={s.position} name={s.name} biomeColor="#7fff7a"
          collected={collectedStars.has(s.name)} onCollect={onStarCollect} />
      ))}
      {complete && <ConstellationLines stars={FOREST_STAR_DATA} color={getConstellationColor('forest', '#7fff7a')} />}
      {complete && <pointLight position={[LAYOUT.forest.x,8,LAYOUT.forest.z-14]} color="#7fff7a" intensity={6} distance={44} />}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
//  BIOME 2: OCEAN REALM  (sunset, golden hour)
// ═══════════════════════════════════════════════════════════
const OCEAN_STAR_DATA = [
  { position: [LAYOUT.ocean.x-12, 4,  LAYOUT.ocean.z-5],  name: 'Mareven' },
  { position: [LAYOUT.ocean.x+8,   6,  LAYOUT.ocean.z-12], name: 'Solunn'  },
  { position: [LAYOUT.ocean.x-5,  8,  LAYOUT.ocean.z-18], name: 'Thyris'  },
  { position: [LAYOUT.ocean.x+15,  5,  LAYOUT.ocean.z-22], name: 'Aquelm'  },
  { position: [LAYOUT.ocean.x+2,   10, LAYOUT.ocean.z-10], name: 'Vespora' },
  { position: [LAYOUT.ocean.x-15, 7,  LAYOUT.ocean.z-26], name: 'Neridan' },
]

const OCEAN_FLOATERS = Array.from({length:18}, (_,i) => {
  const s = i*7.31
  return { x: LAYOUT.ocean.x+((s*13.7)%44)-22, y: 0.5+(s%1.8), z: LAYOUT.ocean.z-3-(s%34),
    size: 0.35+(s%10)*0.11, hue: ['#0d2a40','#1a3a5c','#1e4a6a','#2a5a7a','#0a2035'][i%5], phase: s%6.28 }
})

function OceanBiome({ collectedStars, onStarCollect, complete }) {
  const floatRefs = useRef([])
  const waveRef   = useRef()
  const goldenShimmerGeo = useMemo(() => {
    const pts = []
    for (let i=0;i<150;i++) pts.push((Math.random()-0.5)*80, 0.1, (Math.random()-0.5)*50)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts),3))
    return g
  }, [])

  const earlyStarGeo = useMemo(() => {
    const pts = []
    for (let i=0;i<80;i++) pts.push(LAYOUT.ocean.x+(Math.random()-0.5)*80, 4+Math.random()*30, LAYOUT.ocean.z-Math.random()*50)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts),3))
    return g
  }, [])
  const reflStars = useMemo(() => OCEAN_STAR_DATA.map(s => [s.position[0], -s.position[1]*0.25-0.3, s.position[2]]), [])
  useFrame(({clock}) => {
    const t = clock.elapsedTime
    floatRefs.current.forEach((m,i) => {
      if (!m) return
      m.position.y = OCEAN_FLOATERS[i].y + Math.sin(t*0.55+OCEAN_FLOATERS[i].phase)*0.45
      m.rotation.y += 0.003
    })
    if (waveRef.current?.material) waveRef.current.material.opacity = 0.52+Math.sin(t*0.28)*0.05
  })
  return (
    <group>
      {/* Sand floor */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[LAYOUT.ocean.x,-2.0,LAYOUT.ocean.z-15]}>
        <planeGeometry args={[100,100]} /><meshStandardMaterial color="#d2b48c" roughness={1} />
      </mesh>

      {/* Water: Shore (Blue) */}
      <mesh ref={waveRef} rotation={[-Math.PI/2,0,0]} position={[LAYOUT.ocean.x,0.05,LAYOUT.ocean.z-10]}>
        <planeGeometry args={[90,35]} />
        <meshStandardMaterial color="#0077be" transparent opacity={0.6} metalness={0.4} roughness={0.1} />
      </mesh>

      {/* Water: Distance (Orange tint) */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[LAYOUT.ocean.x,0.04,LAYOUT.ocean.z-35]}>
        <planeGeometry args={[90,30]} />
        <meshStandardMaterial color="#ff7e5f" transparent opacity={0.4} metalness={0.2} roughness={0.1} />
      </mesh>

      {/* Golden Shimmers */}
      <points geometry={goldenShimmerGeo} position={[LAYOUT.ocean.x, 0, LAYOUT.ocean.z-22]}>
        <pointsMaterial color="#ffd700" size={0.15} transparent opacity={0.6} sizeAttenuation />
      </points>

      <mesh position={[LAYOUT.ocean.x,2,LAYOUT.ocean.z-50]}>
        <planeGeometry args={[100,18]} />
        <meshBasicMaterial color="#ff6020" transparent opacity={0.07} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[LAYOUT.ocean.x,18,LAYOUT.ocean.z-48]}>
        <planeGeometry args={[100,14]} />
        <meshBasicMaterial color="#ff8030" transparent opacity={0.04} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {[-20,-10,0,10,20].map((x,i) => (
        <mesh key={i} position={[LAYOUT.ocean.x+x,-1.5,LAYOUT.ocean.z-22-i*3]}>
          <cylinderGeometry args={[0.5,0.8,7,8]} />
          <meshStandardMaterial color="#0c1e32" roughness={0.9} />
        </mesh>
      ))}
      {OCEAN_FLOATERS.map((f,i) => (
        <mesh key={i} ref={el => floatRefs.current[i] = el} position={[f.x,f.y,f.z]}>
          <sphereGeometry args={[f.size,10,10]} />
          <meshStandardMaterial color={f.hue} transparent opacity={0.72} metalness={0.3} roughness={0.2} />
        </mesh>
      ))}
      <points geometry={earlyStarGeo}>
        <pointsMaterial color="#ffe4a0" size={0.09} transparent opacity={0.35} sizeAttenuation />
      </points>
      {reflStars.map((pos,i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.08,5,5]} />
          <meshBasicMaterial color="#7adcff" transparent opacity={0.10} depthWrite={false} />
        </mesh>
      ))}
      {OCEAN_STAR_DATA.map(s => (
        <Star key={s.name} position={s.position} name={s.name} biomeColor="#7adcff"
          collected={collectedStars.has(s.name)} onCollect={onStarCollect} />
      ))}
      {complete && <ConstellationLines stars={OCEAN_STAR_DATA} color="#7adcff" />}
      {complete && <pointLight position={[LAYOUT.ocean.x,6,LAYOUT.ocean.z-16]} color="#7adcff" intensity={5} distance={44} />}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
//  BIOME 3: SKY REALM  (night, floating islands)
// ═══════════════════════════════════════════════════════════
const SKY_STAR_DATA = [
  { position: [LAYOUT.sky.x-10, 8,  LAYOUT.sky.z-4],  name: 'Zephyra' },
  { position: [LAYOUT.sky.x+12,  12, LAYOUT.sky.z-10], name: 'Luminal'  },
  { position: [LAYOUT.sky.x-6,  16, LAYOUT.sky.z-16], name: 'Calyx'    },
  { position: [LAYOUT.sky.x+8,   10, LAYOUT.sky.z-22], name: 'Vorthen'  },
  { position: [LAYOUT.sky.x-14, 14, LAYOUT.sky.z-8],  name: 'Aelith'   },
  { position: [LAYOUT.sky.x+2,   20, LAYOUT.sky.z-18], name: 'Pinnath'  },
]

const SKY_PLATFORMS = [
  {x:-10,y:4, z:-2, w:7, d:4.5,c:'#2d1b4e',ec:'#4020a0'},
  {x:8,  y:6, z:-7, w:9, d:5.5,c:'#3d2060',ec:'#5030c0'},
  {x:-5, y:9, z:-13,w:6, d:4,  c:'#2a184a',ec:'#3818a0'},
  {x:12, y:7, z:-17,w:8, d:4.5,c:'#3d2060',ec:'#5030c0'},
  {x:-14,y:12,z:-9, w:5, d:3.5,c:'#1e1238',ec:'#301890'},
  {x:3,  y:14,z:-21,w:10,d:5.5,c:'#2d1b4e',ec:'#4020a0'},
  {x:-8, y:10,z:-25,w:6, d:3.5,c:'#4a2870',ec:'#6030d0'},
  {x:16, y:5, z:-11,w:6, d:4,  c:'#3d2060',ec:'#5030c0'},
  {x:-18,y:8, z:-19,w:5, d:3,  c:'#2d1b4e',ec:'#4020a0'},
  {x:6,  y:18,z:-15,w:7, d:4.5,c:'#1e1238',ec:'#301890'},
]

function SkyBiome({ collectedStars, onStarCollect, complete }) {
  const platRefs = useRef([])
  const bgGeo = useMemo(() => {
    const pts = []
    for (let i=0;i<320;i++) pts.push(LAYOUT.sky.x+(Math.random()-0.5)*100, 1+Math.random()*40, LAYOUT.sky.z-Math.random()*55)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts),3))
    return g
  }, [])
  useFrame(({clock}) => {
    SKY_PLATFORMS.forEach((p,i) => {
      const m = platRefs.current[i]
      if (!m) return
      m.position.y = p.y + Math.sin(clock.elapsedTime*0.38+p.x)*0.38
    })
  })
  return (
    <group>
      <points geometry={bgGeo}>
        <pointsMaterial color="#c0a0ff" size={0.14} transparent opacity={0.72} sizeAttenuation />
      </points>
      {SKY_PLATFORMS.map((p,i) => (
        <group key={i} ref={el => platRefs.current[i] = el} position={[LAYOUT.sky.x+p.x,p.y,LAYOUT.sky.z+p.z]}>
          <mesh>
            <boxGeometry args={[p.w,0.42,p.d]} />
            <meshStandardMaterial color={p.c} emissive={p.ec} emissiveIntensity={0.22} roughness={0.5} />
          </mesh>
          <mesh position={[0,-0.25,0]}>
            <boxGeometry args={[p.w*0.8,0.08,p.d*0.8]} />
            <meshBasicMaterial color={p.ec} transparent opacity={0.16} depthWrite={false} />
          </mesh>
          {i%3===0 && (
            <mesh position={[0,0.5,0]}>
              <boxGeometry args={[0.3,0.5,0.3]} />
              <meshStandardMaterial color="#8060d0" emissive="#6040c0" emissiveIntensity={0.6} />
            </mesh>
          )}
        </group>
      ))}
      {[-12,-4,6,14].map((x,i) => (
        <mesh key={i} position={[LAYOUT.sky.x+x,7+i*2,LAYOUT.sky.z-13-i*4]}>
          <sphereGeometry args={[3+i*0.5,8,6]} />
          <meshStandardMaterial color="#180f38" transparent opacity={0.22} />
        </mesh>
      ))}
      {SKY_STAR_DATA.map(s => (
        <Star key={s.name} position={s.position} name={s.name} biomeColor="#c89cff"
          collected={collectedStars.has(s.name)} onCollect={onStarCollect} />
      ))}
      {complete && <ConstellationLines stars={SKY_STAR_DATA} color="#c89cff" />}
      {complete && <pointLight position={[LAYOUT.sky.x,14,LAYOUT.sky.z-14]} color="#c89cff" intensity={6} distance={52} />}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
//  BIOME 4: FROST REALM  (night, ice, snow)
//  CRITICAL: stars are CYAN/LAVENDER — NOT white (avoids snow confusion)
// ═══════════════════════════════════════════════════════════
const FROST_STAR_DATA = [
  { position: [LAYOUT.frost.x - 10, 5, LAYOUT.frost.z - 5],  name: 'Nivara' },
  { position: [LAYOUT.frost.x + 18, 7, LAYOUT.frost.z - 5],  name: 'Caelis' },
  { position: [LAYOUT.frost.x - 18, 12, LAYOUT.frost.z - 5], name: 'Virel'  },
  { position: [LAYOUT.frost.x + 20, 10, LAYOUT.frost.z - 10], name: 'Thalos' },
  { position: [LAYOUT.frost.x - 24, 9,  LAYOUT.frost.z - 20], name: 'Eiryn'  },
]

const FROST_MOUNTAINS = [
  {x:-22,z:-18,h:14,w:9},{x:-10,z:-24,h:18,w:7},
  {x:2,  z:-20,h:22,w:11},{x:14, z:-16,h:15,w:8},
  {x:23, z:-22,h:12,w:9},{x:-18,z:-10,h:10,w:7},
  {x:18, z:-10,h:11,w:8},
]

function FrostBiome({ collectedStars, onStarCollect, complete }) {
  const crystalRefs = useRef([])
  const cyanGeo = useMemo(() => {
    const pts = []
    for (let i=0;i<120;i++) pts.push(LAYOUT.frost.x+(Math.random()-0.5)*70, 2+Math.random()*28, LAYOUT.frost.z-Math.random()*48)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts),3))
    return g
  }, [])
  const lavGeo = useMemo(() => {
    const pts = []
    for (let i=0;i<60;i++) pts.push(LAYOUT.frost.x+(Math.random()-0.5)*70, 2+Math.random()*28, LAYOUT.frost.z-Math.random()*48)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts),3))
    return g
  }, [])
  useFrame(({clock}) => {
    const t = clock.elapsedTime
    crystalRefs.current.forEach((m,i) => {
      if (!m?.material) return
      m.material.emissiveIntensity = 0.3+Math.sin(t*1.2+i*0.9)*0.2
    })
  })
  return (
    <group>
      {/* Snow ground */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[LAYOUT.frost.x,-0.55,LAYOUT.frost.z-15]}>
        <planeGeometry args={[100,100]} /><meshStandardMaterial color="#d8eef5" roughness={0.9} />
      </mesh>
      {/* Snow mounds */}
      {[[-8,LAYOUT.frost.z-8],[5,LAYOUT.frost.z-15],[-15,LAYOUT.frost.z-20],[12,LAYOUT.frost.z-22],[-3,LAYOUT.frost.z-12]].map(([x,z],i) => (
        <mesh key={i} position={[LAYOUT.frost.x+x,0,z]}>
          <sphereGeometry args={[2+i*0.4,8,5]} /><meshStandardMaterial color="#e8f4fa" roughness={0.95} />
        </mesh>
      ))}
      {/* Mountains — stacked boxes */}
      {FROST_MOUNTAINS.map((m,i) => (
        <group key={i} position={[LAYOUT.frost.x+m.x,0,LAYOUT.frost.z+m.z]}>
          <mesh position={[0,m.h*0.3,0]}>
            <boxGeometry args={[m.w,m.h*0.6,m.w*0.85]} />
            <meshStandardMaterial color="#b0cdd8" roughness={0.85} />
          </mesh>
          <mesh position={[0,m.h*0.72,0]}>
            <boxGeometry args={[m.w*0.62,m.h*0.5,m.w*0.55]} />
            <meshStandardMaterial color="#c8dfe8" roughness={0.8} />
          </mesh>
          <mesh position={[0,m.h*1.02,0]}>
            <boxGeometry args={[m.w*0.38,m.h*0.22,m.w*0.34]} />
            <meshStandardMaterial color="#eef6fa" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Ice patches */}
      {[[-10,LAYOUT.frost.z-9],[7,LAYOUT.frost.z-14],[-4,LAYOUT.frost.z-7]].map(([x,z],i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x,-0.48,z]}>
          <circleGeometry args={[2.5+i,10]} />
          <meshStandardMaterial color="#a8d8f0" metalness={0.4} roughness={0.1} transparent opacity={0.6} />
        </mesh>
      ))}
      {/* Ice crystals */}
      {Array.from({length:14},(_,i) => {
        const x=LAYOUT.frost.x+((i*8.3)%50)-25, z=LAYOUT.frost.z-2-(i*3.1%30)
        return (
          <mesh key={i} ref={el => crystalRefs.current[i] = el} position={[x,0.4,z]}>
            <boxGeometry args={[0.2,0.8+i%3*0.4,0.2]} />
            <meshStandardMaterial color="#8adaff" emissive="#40c0ff" emissiveIntensity={0.3} transparent opacity={0.8} />
          </mesh>
        )
      })}
      {/* CYAN stars — clearly distinct from white snow */}
      <points geometry={cyanGeo}>
        <pointsMaterial color="#80d0ff" size={0.12} transparent opacity={0.65} sizeAttenuation />
      </points>
      {/* LAVENDER stars */}
      <points geometry={lavGeo}>
        <pointsMaterial color="#d0aaff" size={0.10} transparent opacity={0.55} sizeAttenuation />
      </points>
      {FROST_STAR_DATA.map(s => (
        <Star key={s.name} position={s.position} name={s.name} biomeColor="#c0e8ff"
          collected={collectedStars.has(s.name)} onCollect={onStarCollect} />
      ))}
      {complete && <ConstellationLines stars={FROST_STAR_DATA} color={getConstellationColor('frost', '#c0e8ff')} />}
      {complete && <pointLight position={[LAYOUT.frost.x, 8, LAYOUT.frost.z - 15]} color="#c0e8ff" intensity={4} distance={30} />}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
//  BIOME 5: SAKURA REALM  (dawn / twilight)
// ═══════════════════════════════════════════════════════════
const SAKURA_STAR_DATA = [
  { position: [LAYOUT.sakura.x - 22, 7, LAYOUT.sakura.z - 10], name: 'Hanari' },
  { position: [LAYOUT.sakura.x + 10, 8, LAYOUT.sakura.z - 15], name: 'Selune' },
  { position: [LAYOUT.sakura.x - 12, 5, LAYOUT.sakura.z - 20], name: 'Kaede'  },
  { position: [LAYOUT.sakura.x + 4,  9, LAYOUT.sakura.z - 25], name: 'Mirai'  },
  { position: [LAYOUT.sakura.x + 22, 8, LAYOUT.sakura.z - 12], name: 'Komorebi' },
]

const SAKURA_TREES = (() => {
  const pts = [
    [-14,-3],[-8,-8],[-2,-5],[4,-9],[10,-4],[16,-8],
    [-12,-14],[-5,-18],[2,-15],[9,-19],[15,-13],
    [-16,-22],[-8,-25],[0,-22],[8,-26],[16,-21],
    [-10,-30],[-2,-33],[6,-29],[14,-32],
  ]
  return pts.map(([x,z]) => ({
    x, z,
    h: 4+Math.abs((x+z)%3)*1.2,
    pink: ['#ffb8d8','#ffc4dc','#ffa8d0','#ff9cc8','#ffd0e4'][Math.abs(x*z+1)%5],
  }))
})()

const SAKURA_PETALS = Array.from({length:80}, (_,i) => ({
  x: ((i*7.13)%60)-30, y: 2+((i*3.71)%18), 
  z: -1-(i*4.27%38),
  phase: (i*1.13)%6.28, drift: (i%2===0?1:-1)*(0.3+i%5*0.1),
}))

function SakuraBiome({ collectedStars, onStarCollect, complete }) {
  const petalRefs = useRef([])
  const starGeo = useMemo(() => {
    const pts = []
    for (let i=0;i<90;i++) pts.push(LAYOUT.sakura.x+(Math.random()-0.5)*75, 4+Math.random()*25, LAYOUT.sakura.z-Math.random()*50)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts),3))
    return g
  }, [])
  useFrame(({clock}) => {
    const t = clock.elapsedTime
    petalRefs.current.forEach((m,i) => {
      if (!m) return
      const p = SAKURA_PETALS[i]
      m.position.y = p.y - ((t*0.3+p.phase)%18)*0.12
      m.position.x = p.x + Math.sin(t*0.4+p.phase)*p.drift
      if (m.position.y < -0.5) m.position.y = 16
    })
  })
  return (
    <group>
      {/* Beige ground */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[LAYOUT.sakura.x,-0.6,LAYOUT.sakura.z-15]}>
        <planeGeometry args={[100,100]} /><meshStandardMaterial color="#f5f5dc" roughness={1} />
      </mesh>

      {/* Pathways */}
      {[[-15,0],[15,0],[-5,-25],[5,-25]].map(([x,z],i) => (
        <mesh key={`path-${i}`} rotation={[-Math.PI/2,0,0]} position={[LAYOUT.sakura.x+x,-0.48,LAYOUT.sakura.z+z-18]}>
          <planeGeometry args={[4,40]} /><meshStandardMaterial color="#8b7355" roughness={0.9} />
        </mesh>
      ))}

      {/* Pink patches near trees */}
      {SAKURA_TREES.map((t,i) => (
        <mesh key={`patch-${i}`} rotation={[-Math.PI/2,0,0]} position={[LAYOUT.sakura.x+t.x,-0.47,LAYOUT.sakura.z+t.z]}>
          <circleGeometry args={[3,8]} /><meshStandardMaterial color="#ffb8d8" transparent opacity={0.4} />
        </mesh>
      ))}

      {[-4,-1,2,5,8,11,14].map((z,i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[LAYOUT.sakura.x,-0.48,LAYOUT.sakura.z-z*3]}>
          <planeGeometry args={[2.5,1.8]} /><meshStandardMaterial color="#2a1a1e" roughness={0.9} />
        </mesh>
      ))}
      {SAKURA_TREES.map((t,i) => (
        <group key={i} position={[LAYOUT.sakura.x+t.x,0,LAYOUT.sakura.z+t.z]}>
          <mesh position={[0,t.h*0.32,0]}>
            <cylinderGeometry args={[0.14,0.18,t.h*0.65,7]} />
            <meshStandardMaterial color="#4a2828" roughness={0.9} />
          </mesh>
          <mesh position={[0,t.h*0.82,0]}>
            <sphereGeometry args={[t.h*0.38,9,7]} />
            <meshStandardMaterial color={t.pink} transparent opacity={0.9} roughness={0.7} />
          </mesh>
          <mesh position={[t.h*0.2,t.h*0.9,t.h*0.1]}>
            <sphereGeometry args={[t.h*0.26,8,6]} />
            <meshStandardMaterial color={t.pink} transparent opacity={0.85} roughness={0.7} />
          </mesh>
          <mesh position={[-t.h*0.15,t.h*0.95,-t.h*0.12]}>
            <sphereGeometry args={[t.h*0.22,7,5]} />
            <meshStandardMaterial color="#ffd0e4" transparent opacity={0.88} roughness={0.7} />
          </mesh>
        </group>
      ))}
      {SAKURA_PETALS.map((p,i) => (
        <mesh key={i} ref={el => petalRefs.current[i] = el} position={[LAYOUT.sakura.x+p.x,p.y,LAYOUT.sakura.z+p.z]}>
          <boxGeometry args={[0.12,0.08,0.12]} />
          <meshStandardMaterial color="#ffb8d8" emissive="#ff80b0" emissiveIntensity={0.3} transparent opacity={0.8} />
        </mesh>
      ))}
      <mesh position={[LAYOUT.sakura.x,15,LAYOUT.sakura.z-45]}>
        <planeGeometry args={[100,30]} />
        <meshBasicMaterial color="#ff7040" transparent opacity={0.05} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <points geometry={starGeo}>
        <pointsMaterial color="#ffd4a0" size={0.11} transparent opacity={0.50} sizeAttenuation />
      </points>
      {SAKURA_STAR_DATA.map(s => (
        <Star key={s.name} position={s.position} name={s.name} biomeColor="#ffb8d8"
          collected={collectedStars.has(s.name)} onCollect={onStarCollect} />
      ))}
      {complete && <ConstellationLines stars={SAKURA_STAR_DATA} color={getConstellationColor('sakura', '#ffb8d8')} />}
      {complete && <pointLight position={[LAYOUT.sakura.x, 8, LAYOUT.sakura.z - 15]} color="#ffb8d8" intensity={4} distance={30} />}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
//  BIOME 6: SPRING VALLEY  (day meadow)
// ═══════════════════════════════════════════════════════════
const SPRING_STAR_DATA = [
  { position: [LAYOUT.spring.x - 15, 6, LAYOUT.spring.z - 10], name: 'Verdan' },
  { position: [LAYOUT.spring.x + 5,  8, LAYOUT.spring.z - 20], name: 'Solis'  },
  { position: [LAYOUT.spring.x - 8,  9, LAYOUT.spring.z - 5],  name: 'Liora'  },
  { position: [LAYOUT.spring.x + 12, 7, LAYOUT.spring.z - 25], name: 'Thera'  },
  { position: [LAYOUT.spring.x - 2,  10, LAYOUT.spring.z - 15], name: 'Aethera' },
]

const SPRING_FLOWERS = Array.from({length:120}, (_,i) => ({
  x: (Math.random()-0.5)*70,
  z: -Math.random()*50,
  col: ['#ff6699','#ffcc00','#66ddff','#99ff66','#ff99cc','#ffdd88'][i%6],
  phase: Math.random()*6.28,
  h: 0.15+Math.random()*0.4
}))

function SpringBiome({ collectedStars, onStarCollect, complete }) {
  const flowerRefs = useRef([])
  const starGeo = useMemo(() => {
    const pts = []
    for (let i=0;i<30;i++) pts.push(LAYOUT.spring.x+(Math.random()-0.5)*70, 8+Math.random()*30, LAYOUT.spring.z-Math.random()*50)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts),3))
    return g
  }, [])
  useFrame(({clock}) => {
    const t = clock.elapsedTime
    flowerRefs.current.forEach((m,i) => {
      if (!m) return
      m.position.y = SPRING_FLOWERS[i].h + Math.sin(t*0.7+SPRING_FLOWERS[i].phase)*0.06
    })
  })
  return (
    <group>
      <mesh rotation={[-Math.PI/2,0,0]} position={[LAYOUT.spring.x,-0.65,LAYOUT.spring.z-15]}>
        <planeGeometry args={[100,100]} /><meshStandardMaterial color="#1a3a0a" roughness={0.95} />
      </mesh>
      {[[-14,LAYOUT.spring.z-8],[6,LAYOUT.spring.z-18],[-5,LAYOUT.spring.z-28],[18,LAYOUT.spring.z-14],[-20,LAYOUT.spring.z-22]].map(([x,z],i) => (
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x,-0.48,z]}>
          <circleGeometry args={[4+i*0.5,10]} /><meshStandardMaterial color="#224a0e" roughness={1} transparent opacity={0.6} />
        </mesh>
      ))}
      {SPRING_FLOWERS.map((f,i) => (
        <mesh key={i} ref={el => flowerRefs.current[i] = el} position={[LAYOUT.spring.x+f.x,f.h,LAYOUT.spring.z+f.z]}>
          <sphereGeometry args={[0.1,6,5]} />
          <meshStandardMaterial color={f.col} emissive={f.col} emissiveIntensity={0.6} />
        </mesh>
      ))}
      {Array.from({length:30},(_,i) => {
        const x=LAYOUT.spring.x+((i*9.7)%60)-30, z=LAYOUT.spring.z-2-(i*4.1%40)
        return (
          <mesh key={i} position={[x,0.4,z]}>
            <boxGeometry args={[0.08,0.8,0.08]} /><meshStandardMaterial color="#2a5a10" roughness={0.9} />
          </mesh>
        )
      })}
      {[[-20,LAYOUT.spring.z-35,3],[10,LAYOUT.spring.z-40,4],[-5,LAYOUT.spring.z-32,3.5]].map(([x,z,h],i) => (
        <mesh key={i} position={[LAYOUT.spring.x+x,h*0.3,z]}>
          <sphereGeometry args={[12,8,4]} /><meshStandardMaterial color="#1e4008" roughness={0.98} />
        </mesh>
      ))}
      {/* Minimal stars — daytime */}
      <points geometry={starGeo}>
        <pointsMaterial color="#ffffff" size={0.07} transparent opacity={0.15} sizeAttenuation />
      </points>
      {SPRING_STAR_DATA.map(s => (
        <Star key={s.name} position={s.position} name={s.name} biomeColor="#a8ff78"
          collected={collectedStars.has(s.name)} onCollect={onStarCollect} />
      ))}
      {complete && <ConstellationLines stars={SPRING_STAR_DATA} color={getConstellationColor('spring', '#a8ff78')} />}
      {complete && <pointLight position={[LAYOUT.spring.x, 8, LAYOUT.spring.z - 15]} color="#a8ff78" intensity={4} distance={30} />}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
//  BIOME 7: RAINBOW SKY ISLES
//  Vertically connected to Spring Valley — islands float above
// ═══════════════════════════════════════════════════════════
const RAINBOW_STAR_DATA = [
  { position: [LAYOUT.rainbow.x - 10, 18, LAYOUT.rainbow.z - 5],  name: 'Prismara' },
  { position: [LAYOUT.rainbow.x + 15, 22, LAYOUT.rainbow.z - 12], name: 'Aurex'    },
  { position: [LAYOUT.rainbow.x + 0,  25, LAYOUT.rainbow.z - 20], name: 'Luminel'  },
  { position: [LAYOUT.rainbow.x - 18, 20, LAYOUT.rainbow.z - 15], name: 'Vireon'   },
  { position: [LAYOUT.rainbow.x + 8,  28, LAYOUT.rainbow.z - 8],  name: 'Elara'    },
]

const RAINBOW_ISLANDS = [
  {x:-18,y:16,z:-4, w:9, d:5,  c:'#2a4a10',ec:'#60d020'},
  {x:8,  y:20,z:-9, w:11,d:6,  c:'#1a3a08',ec:'#40c010'},
  {x:-6, y:14,z:-15,w:7, d:4,  c:'#2a4a10',ec:'#60d020'},
  {x:18, y:18,z:-5, w:8, d:5,  c:'#1e3808',ec:'#50b818'},
  {x:-14,y:24,z:-12,w:10,d:5.5,c:'#2a4a10',ec:'#60d020'},
  {x:4,  y:28,z:-18,w:12,d:6,  c:'#1a3a08',ec:'#40c010'},
  {x:-22,y:22,z:-8, w:7, d:4,  c:'#2a4a10',ec:'#60d020'},
  {x:22, y:26,z:-14,w:9, d:5,  c:'#1e3808',ec:'#50b818'},
]
const RAINBOW_HUES = ['#ff4040','#ff9020','#ffee20','#40dd40','#2090ff','#8040ff']

function RainbowBiome({ collectedStars, onStarCollect, complete }) {
  const isleRefs   = useRef([])
  const arcRefs    = useRef([])
  const starGeo    = useMemo(() => {
    const pts = []
    for (let i=0;i<25;i++) pts.push(LAYOUT.rainbow.x+(Math.random()-0.5)*80, 10+Math.random()*30, LAYOUT.rainbow.z-Math.random()*50)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts),3))
    return g
  }, [])
  useFrame(({clock}) => {
    const t = clock.elapsedTime
    isleRefs.current.forEach((m,i) => {
      if (!m) return
      m.position.y = RAINBOW_ISLANDS[i].y + Math.sin(t*0.28+i*0.8)*0.6
    })
    arcRefs.current.forEach((m,i) => {
      if (!m?.material) return
      m.material.opacity = 0.06 + Math.sin(t*0.2+i*0.4)*0.02
    })
  })
  return (
    <group>
      {RAINBOW_ISLANDS.map((isle,i) => (
        <group key={i} ref={el => isleRefs.current[i] = el} position={[LAYOUT.rainbow.x+isle.x,isle.y,LAYOUT.rainbow.z+isle.z]}>
          <mesh>
            <boxGeometry args={[isle.w,0.55,isle.d]} />
            <meshStandardMaterial color={isle.c} emissive={isle.ec} emissiveIntensity={0.15} roughness={0.7} />
          </mesh>
          <mesh position={[0,-0.5,0]}>
            <boxGeometry args={[isle.w*0.85,0.7,isle.d*0.85]} />
            <meshStandardMaterial color="#3a3020" roughness={0.95} />
          </mesh>
          <mesh position={[0,-0.85,0]}>
            <boxGeometry args={[isle.w*0.6,0.08,isle.d*0.6]} />
            <meshBasicMaterial color={isle.ec} transparent opacity={0.12} depthWrite={false} />
          </mesh>
          {i%2===0 && (
            <group position={[0,0.55,0]}>
              <mesh position={[0,0.6,0]}>
                <cylinderGeometry args={[0.12,0.16,1.2,6]} />
                <meshStandardMaterial color="#3a2008" roughness={1} />
              </mesh>
              <mesh position={[0,1.4,0]}>
                <sphereGeometry args={[0.8,8,6]} />
                <meshStandardMaterial color="#2a6018" roughness={0.8} />
              </mesh>
            </group>
          )}
        </group>
      ))}
      {/* Rainbow arc bands — torus geometry */}
      {RAINBOW_HUES.map((col,ci) => (
        <mesh key={ci} ref={el => arcRefs.current[ci] = el}
          position={[LAYOUT.rainbow.x,20,LAYOUT.rainbow.z-22]} rotation={[Math.PI*0.08,0,0]}>
          <torusGeometry args={[28+ci*3,0.7,4,32,Math.PI]} />
          <meshBasicMaterial color={col} transparent opacity={0.07} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Vertical light pillars connecting to Spring Valley below */}
      {[-12,0,12].map((x,i) => (
        <mesh key={i} position={[LAYOUT.rainbow.x+x,4,LAYOUT.rainbow.z+5+i*3]}>
          <cylinderGeometry args={[0.3,0.8,20,6,1,true]} />
          <meshBasicMaterial color="#a0ff80" transparent opacity={0.04} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Cloud puffs */}
      {[[-10,22,-6],[8,26,-10],[-18,18,-14],[14,24,-8]].map(([x,y,z],i) => (
        <group key={i} position={[LAYOUT.rainbow.x+x,y,LAYOUT.rainbow.z+z]}>
          <mesh><sphereGeometry args={[2.2,8,6]}/><meshStandardMaterial color="#f0f8ff" transparent opacity={0.22}/></mesh>
          <mesh position={[1.8,0.3,0]}><sphereGeometry args={[1.6,7,5]}/><meshStandardMaterial color="#f0f8ff" transparent opacity={0.18}/></mesh>
          <mesh position={[-1.5,0.2,0]}><sphereGeometry args={[1.7,7,5]}/><meshStandardMaterial color="#f0f8ff" transparent opacity={0.18}/></mesh>
        </group>
      ))}
      {/* Very low density stars — daylight */}
      <points geometry={starGeo}>
        <pointsMaterial color="#ffffff" size={0.07} transparent opacity={0.12} sizeAttenuation />
      </points>
      {RAINBOW_STAR_DATA.map(s => (
        <Star key={s.name} position={s.position} name={s.name} biomeColor="#ffe06e"
          collected={collectedStars.has(s.name)} onCollect={onStarCollect} />
      ))}
      {complete && <ConstellationLines stars={RAINBOW_STAR_DATA} color={getConstellationColor('rainbow', '#ffe06e')} />}
      {complete && <pointLight position={[LAYOUT.rainbow.x, 22, LAYOUT.rainbow.z - 15]} color="#ffe06e" intensity={4} distance={30} />}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
//  BIOME 8: TWILIGHT ZONE  (sunset→night, high star density)
//  Triggers transcendence sequence
// ═══════════════════════════════════════════════════════════
const TWILIGHT_STAR_DATA = [
  { position: [LAYOUT.twilight.x - 12, 6, LAYOUT.twilight.z - 10], name: 'Solara' },
  { position: [LAYOUT.twilight.x + 10, 8, LAYOUT.twilight.z - 20], name: 'Noctis'  },
  { position: [LAYOUT.twilight.x - 2,  5, LAYOUT.twilight.z - 5],  name: 'Veyra'   },
  { position: [LAYOUT.twilight.x + 14, 9, LAYOUT.twilight.z - 15], name: 'Orien'   },
  { position: [LAYOUT.twilight.x - 8,  7, LAYOUT.twilight.z - 25], name: 'Kala'   },
]

function TwilightBiome({ collectedStars, onStarCollect, complete }) {
  const starRef1 = useRef()
  const starRef2 = useRef()
  const glowRef  = useRef()
  const elRef    = useRef(0)
  const starGeo1 = useMemo(() => {
    const pts = []
    for (let i=0;i<200;i++) pts.push(LAYOUT.twilight.x+(Math.random()-0.5)*85, 2+Math.random()*40, LAYOUT.twilight.z-Math.random()*55)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts),3))
    return g
  }, [])
  const starGeo2 = useMemo(() => {
    const pts = []
    for (let i=0;i<150;i++) pts.push(LAYOUT.twilight.x+(Math.random()-0.5)*85, 2+Math.random()*40, LAYOUT.twilight.z-Math.random()*55)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts),3))
    return g
  }, [])
  const clusterGeo = useMemo(() => {
    const pts = []
    for (let i=0;i<80;i++) pts.push(LAYOUT.twilight.x+(Math.random()-0.5)*30, 12+Math.random()*20, LAYOUT.twilight.z-20-Math.random()*25)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts),3))
    return g
  }, [])
  useFrame(({clock}) => {
    const t = clock.elapsedTime
    elRef.current = t
    // Star intensity increases over time — simulates night arriving
    const dens = Math.min(0.88, 0.2+(t%80)*0.010)
    if (starRef1.current?.material) starRef1.current.material.opacity = dens*0.85
    if (starRef2.current?.material) starRef2.current.material.opacity = dens
    if (glowRef.current?.material)  glowRef.current.material.opacity  = 0.07+Math.sin(t*0.14)*0.04
    // Debug log
    if (Math.round(t*2)%180===0) {
      console.log(`[Twilight] starDensity=${dens.toFixed(2)} t=${t.toFixed(0)}`)
    }
  })
  return (
    <group>
      <mesh rotation={[-Math.PI/2,0,0]} position={[LAYOUT.twilight.x,-0.7,LAYOUT.twilight.z-15]}>
        <planeGeometry args={[100,100]} /><meshStandardMaterial color="#4a3728" roughness={1} />
      </mesh>
      {/* Silhouette hills */}
      {[[-22,LAYOUT.twilight.z-30,5],[0,LAYOUT.twilight.z-35,7],[20,LAYOUT.twilight.z-28,4.5],[-10,LAYOUT.twilight.z-38,6]].map(([x,z,h],i) => (
        <mesh key={i} position={[LAYOUT.twilight.x+x,h*0.3,z]}>
          <sphereGeometry args={[10+i,8,4]} /><meshStandardMaterial color={['#1a3d12','#224a0e','#1e4008','#2e5a10'][i%4]} roughness={1} />
        </mesh>
      ))}
      {/* Horizon glow */}
      <mesh ref={glowRef} position={[LAYOUT.twilight.x,4,LAYOUT.twilight.z-50]}>
        <planeGeometry args={[110,22]} />
        <meshBasicMaterial color="#ff5010" transparent opacity={0.08} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[LAYOUT.twilight.x,12,LAYOUT.twilight.z-50]}>
        <planeGeometry args={[110,12]} />
        <meshBasicMaterial color="#8820a0" transparent opacity={0.04} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Monoliths */}
      {[-14,0,14].map((x,i) => (
        <mesh key={i} position={[LAYOUT.twilight.x+x,2.5,LAYOUT.twilight.z-12-i*5]}>
          <boxGeometry args={[1.2,5,0.9]} /><meshStandardMaterial color="#2a2030" roughness={0.95} />
        </mesh>
      ))}
      {/* Increasing star field */}
      <points ref={starRef1} geometry={starGeo1}>
        <pointsMaterial color="#ffffff" size={0.11} transparent opacity={0.3} sizeAttenuation />
      </points>
      <points ref={starRef2} geometry={starGeo2}>
        <pointsMaterial color="#e0c0ff" size={0.09} transparent opacity={0.2} sizeAttenuation />
      </points>
      {/* Constellation density cluster */}
      <points geometry={clusterGeo}>
        <pointsMaterial color="#c89cff" size={0.13} transparent opacity={0.55} sizeAttenuation />
      </points>
      {TWILIGHT_STAR_DATA.map(s => (
        <Star key={s.name} position={s.position} name={s.name} biomeColor="#ff9966"
          collected={collectedStars.has(s.name)} onCollect={onStarCollect} />
      ))}
      {complete && <ConstellationLines stars={TWILIGHT_STAR_DATA} color="#ff9966" />}
      {complete && <pointLight position={[LAYOUT.twilight.x, 8, LAYOUT.twilight.z - 15]} color="#ff9966" intensity={4} distance={30} />}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
//  MOTHER WHALE (transcendence)
// ═══════════════════════════════════════════════════════════
function MotherWhale({ visible }) {
  const g = useRef()
  const startTime = useRef(null)
  
  useFrame(({clock}) => {
    if (!g.current || !visible) return
    if (startTime.current === null) startTime.current = clock.elapsedTime
    
    const elapsed = clock.elapsedTime - startTime.current
    const approachSpeed = 1.8
    const startDist = -120
    const currentZ = Math.min(-22, startDist + elapsed * approachSpeed)
    const scale = 0.4 + Math.min(1.0, elapsed * 0.05) * 2.2 // More dramatic scale increase
    
    g.current.position.set(LAYOUT.sky.x, 24 + Math.sin(elapsed * 0.2) * 2, LAYOUT.sky.z + currentZ)
    g.current.rotation.y = Math.sin(elapsed * 0.1) * 0.15
    g.current.scale.setScalar(scale)
  })

  if (!visible) return null
  return (
    <group ref={g} position={[LAYOUT.sky.x,24,LAYOUT.sky.z-55]}>
      <mesh scale={[1,0.55,3.2]}>
        <sphereGeometry args={[5.8,16,12]} />
        <meshStandardMaterial color="#10092e" emissive="#4020a0" emissiveIntensity={0.65} transparent opacity={0.88} />
      </mesh>
      <mesh position={[0,0.5,8]} scale={[0.74,0.62,0.95]}>
        <sphereGeometry args={[4.2,14,10]} />
        <meshStandardMaterial color="#10092e" emissive="#4020a0" emissiveIntensity={0.65} transparent opacity={0.88} />
      </mesh>
      <mesh position={[0,0.3,-10.5]} rotation={[0,0,Math.PI/2]} scale={[0.17,4,1.1]}>
        <sphereGeometry args={[2.2,8,6]} />
        <meshStandardMaterial color="#0b0620" emissive="#301080" emissiveIntensity={0.4} transparent opacity={0.82} />
      </mesh>
      <mesh position={[0,6,-1.5]} scale={[0.17,1.5,0.9]}>
        <sphereGeometry args={[2.2,8,6]} />
        <meshStandardMaterial color="#10092e" emissive="#301080" emissiveIntensity={0.5} transparent opacity={0.84} />
      </mesh>
      {[-1,1].map((s,i) => (
        <mesh key={i} position={[s*7,-1.2,2.5]} rotation={[0,0,s*0.44]} scale={[0.9,0.27,0.55]}>
          <sphereGeometry args={[3,8,6]} />
          <meshStandardMaterial color="#10092e" emissive="#201060" emissiveIntensity={0.3} transparent opacity={0.8} />
        </mesh>
      ))}
      <pointLight color="#7040d0" intensity={14} distance={55} />
      <mesh scale={[1.15,0.6,3.3]}>
        <sphereGeometry args={[6.5,8,6]} />
        <meshBasicMaterial color="#4020a8" transparent opacity={0.07} depthWrite={false} />
      </mesh>
      {Array.from({length:14}).map((_,i) => {
        const a = (i/14)*Math.PI*2
        return (
          <mesh key={i} position={[Math.cos(a)*9,Math.sin(a*1.5)*3.5,Math.sin(a)*5]}>
            <sphereGeometry args={[0.18,4,4]} /><meshBasicMaterial color="#b090ff" />
          </mesh>
        )
      })}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
//  TRANSCENDENCE FIELD
// ═══════════════════════════════════════════════════════════
function TranscendenceField({ visible }) {
  const g = useRef()
  const particles = useMemo(() => {
    if (!visible) return []
    return Array.from({length:320}).map((_,i) => ({
      pos: [LAYOUT.sky.x+(Math.random()-0.5)*90, 2+Math.random()*45, LAYOUT.sky.z-15-Math.random()*65],
      size: 0.05+Math.random()*0.14,
      color: ['#fff','#c89cff','#7adcff','#7fff7a','#ffd700','#ffb0d0'][i%6],
      phase: Math.random()*6.28,
    }))
  }, [visible])
  useFrame(({clock}) => {
    if (!g.current) return
    const t = clock.elapsedTime
    g.current.children.forEach((c,i) => {
      if (!particles[i]||!c.material) return
      c.material.opacity = 0.2+Math.sin(t*1.2+particles[i].phase)*0.7
    })
  })
  if (!visible) return null
  return (
    <group ref={g}>
      {particles.map((p,i) => (
        <mesh key={i} position={p.pos}>
          <sphereGeometry args={[p.size,4,4]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ═══════════════════════════════════════════════════════════
//  WORLD LIGHTING MANAGER — lerp across all 8 biomes
// ═══════════════════════════════════════════════════════════
const LIGHT_CFG = {
  forest:        {ambColor:'#243a1a',ambInt:0.60,dirColor:'#c0e870',dirInt:1.60,dir2Color:'#5a8840',fogColor:'#0b1808',fogNear:38,fogFar:115, skyColor:'#a0d8ef'},
  ocean:         {ambColor:'#0a1e38',ambInt:0.44,dirColor:'#ffa050',dirInt:1.20,dir2Color:'#2050a0',fogColor:'#050d18',fogNear:35,fogFar:118, skyColor:'#ff7e5f'},
  sky:           {ambColor:'#180830',ambInt:0.38,dirColor:'#8060d0',dirInt:0.70,dir2Color:'#5838a8',fogColor:'#06040e',fogNear:40,fogFar:130, skyColor:'#050510'},
  frost:         {ambColor:'#0a1828',ambInt:0.50,dirColor:'#80c8f0',dirInt:0.90,dir2Color:'#4080c0',fogColor:'#0a1420',fogNear:30,fogFar:100, skyColor:'#02050a'},
  sakura:        {ambColor:'#2a1420',ambInt:0.55,dirColor:'#ff9060',dirInt:1.10,dir2Color:'#c06080',fogColor:'#160a10',fogNear:36,fogFar:112, skyColor:'#ff9a9e'},
  spring:        {ambColor:'#1e3a10',ambInt:0.65,dirColor:'#ffffff',dirInt:1.80,dir2Color:'#a0d060',fogColor:'#0e1c08',fogNear:40,fogFar:120, skyColor:'#87ceeb'},
  rainbow:       {ambColor:'#1a3a18',ambInt:0.62,dirColor:'#f0f0a0',dirInt:1.70,dir2Color:'#60d090',fogColor:'#101808',fogNear:42,fogFar:125, skyColor:'#95e1d3'},
  twilight:      {ambColor:'#180810',ambInt:0.35,dirColor:'#ff4010',dirInt:0.80,dir2Color:'#6010a0',fogColor:'#0a0408',fogNear:32,fogFar:105, skyColor:'#2c3e50'},
  transcendence: {ambColor:'#1a1040',ambInt:0.90,dirColor:'#ffffff',dirInt:1.80,dir2Color:'#a080ff',fogColor:'#080418',fogNear:50,fogFar:160, skyColor:'#080418'},
}

// Parse hex → THREE.Color once
const LIGHT_CFG_PARSED = Object.fromEntries(
  Object.entries(LIGHT_CFG).map(([k,v]) => [k, {
    ambColor:  new THREE.Color(v.ambColor),
    ambInt:    v.ambInt,
    dirColor:  new THREE.Color(v.dirColor),
    dirInt:    v.dirInt,
    dir2Color: new THREE.Color(v.dir2Color),
    fogColor:  new THREE.Color(v.fogColor),
    fogNear:   v.fogNear,
    fogFar:    v.fogFar,
    skyColor:  new THREE.Color(v.skyColor),
  }])
)

function lerpC(c, t, a) {
  c.r += (t.r-c.r)*a; c.g += (t.g-c.g)*a; c.b += (t.b-c.b)*a
}

function WorldLighting({ biome, transcendence }) {
  const ambRef  = useRef()
  const dir1Ref = useRef()
  const dir2Ref = useRef()
  const { scene } = useThree()
  const w = useRef({
    ambColor:  new THREE.Color('#243a1a'), ambInt:  0.60,
    dirColor:  new THREE.Color('#c0e870'), dirInt:  1.60,
    dir2Color: new THREE.Color('#5a8840'),
    fogColor:  new THREE.Color('#0b1808'),
    skyColor:  new THREE.Color('#a0d8ef'),
  })
  const debugTick = useRef(0)

  useFrame((_s, delta) => {
    const key = transcendence ? 'transcendence' : (biome || 'forest')
    const cfg = LIGHT_CFG_PARSED[key] || LIGHT_CFG_PARSED.forest
    const ALPHA = Math.min(delta*0.8, 0.022)
    const wr = w.current

    lerpC(wr.ambColor, cfg.ambColor, ALPHA)
    wr.ambInt += (cfg.ambInt-wr.ambInt)*ALPHA
    if (ambRef.current) { ambRef.current.color.copy(wr.ambColor); ambRef.current.intensity = wr.ambInt }

    lerpC(wr.dirColor, cfg.dirColor, ALPHA)
    wr.dirInt += (cfg.dirInt-wr.dirInt)*ALPHA
    if (dir1Ref.current) { dir1Ref.current.color.copy(wr.dirColor); dir1Ref.current.intensity = wr.dirInt }

    lerpC(wr.dir2Color, cfg.dir2Color, ALPHA)
    if (dir2Ref.current) dir2Ref.current.color.copy(wr.dir2Color)

    if (scene.fog) {
      lerpC(wr.fogColor, cfg.fogColor, ALPHA)
      scene.fog.color.copy(wr.fogColor)
      scene.fog.near += (cfg.fogNear-scene.fog.near)*ALPHA
      scene.fog.far  += (cfg.fogFar -scene.fog.far )*ALPHA
    }

    // Update sky (background) color
    lerpC(wr.skyColor, cfg.skyColor, ALPHA)
    if (scene) {
      if (!scene.background) scene.background = new THREE.Color().copy(wr.skyColor)
      else scene.background.copy(wr.skyColor)
    }

    debugTick.current++
    if (debugTick.current%120===0) {
      console.log(
        `[Lighting] biome=${key} ambInt=${wr.ambInt.toFixed(2)} ` +
        `dirInt=${wr.dirInt.toFixed(2)} ` +
        `fog(${scene.fog?.near?.toFixed(0)},${scene.fog?.far?.toFixed(0)})`
      )
    }
  })

  return (
    <>
      <ambientLight     ref={ambRef}  intensity={0.60} color="#243a1a" />
      <directionalLight ref={dir1Ref} position={[8,16,5]}   intensity={1.60} color="#c0e870" />
      <directionalLight ref={dir2Ref} position={[-6,8,-14]} intensity={0.65} color="#5a8840" />
      <hemisphereLight skyColor="#0c0720" groundColor="#07090a" intensity={0.40} />
    </>
  )
}

// ═══════════════════════════════════════════════════════════
//  SCENE — all 8 biomes in one continuous world space
// ═══════════════════════════════════════════════════════════
function Scene({
  playerRef, collectedStars, onStarCollect,
  biomesComplete, transcendence, currentBiome,
  showDebugCube, onPositionUpdate, active, playerPosition, revelationActive
}) {
  const { camera } = useThree()
  const logged = useRef(false)
  
  // Smooth camera pan during revelation
  useFrame((state, delta) => {
    if (!logged.current) { console.log('[Scene] Render loop active'); logged.current = true }
    
    if (transcendence && playerRef.current) {
      const targetPos = new THREE.Vector3()
      const targetLookAt = new THREE.Vector3()
      
      if (revelationActive) {
        // Pan close to the player
        targetPos.set(playerRef.current.position.x, playerRef.current.position.y + 1, playerRef.current.position.z + 4)
        targetLookAt.copy(playerRef.current.position).add(new THREE.Vector3(0, 0.5, 0))
      } else {
        // Default transcendence view (showing the whale/horizon)
        targetPos.set(LAYOUT.sky.x, 20, LAYOUT.sky.z + 15)
        targetLookAt.set(LAYOUT.sky.x, 24, LAYOUT.sky.z - 55)
      }
      
      camera.position.lerp(targetPos, 0.03)
      state.camera.lookAt(targetLookAt)
    }
  })
  
  return (
    <>
      <WorldLighting biome={currentBiome} transcendence={transcendence} />
      <fog attach="fog" color="#0b1808" near={38} far={115} />
      <GlobalStarField />
      <DebugCube visible={showDebugCube} />

      {/* ── BIOME 1 — Enchanted Forest ── */}
      <ForestBiome collectedStars={collectedStars} onStarCollect={onStarCollect} complete={biomesComplete.forest} />
      {/* ── BIOME 2 — Ocean Realm ── */}
      <OceanBiome  collectedStars={collectedStars} onStarCollect={onStarCollect} complete={biomesComplete.ocean}  />
      {/* ── BIOME 3 — Sky Realm ── */}
      <SkyBiome    collectedStars={collectedStars} onStarCollect={onStarCollect} complete={biomesComplete.sky}    />
      {/* ── BIOME 4 — Frost Realm ── */}
      <FrostBiome  collectedStars={collectedStars} onStarCollect={onStarCollect} complete={biomesComplete.frost}  />
      {/* ── BIOME 5 — Sakura Realm ── */}
      <SakuraBiome collectedStars={collectedStars} onStarCollect={onStarCollect} complete={biomesComplete.sakura} />
      {/* ── BIOME 6 — Spring Valley ── */}
      <SpringBiome collectedStars={collectedStars} onStarCollect={onStarCollect} complete={biomesComplete.spring} />
      {/* ── BIOME 7 — Rainbow Sky Isles ── */}
      <RainbowBiome collectedStars={collectedStars} onStarCollect={onStarCollect} complete={biomesComplete.rainbow} />
      {/* ── BIOME 8 — Twilight Zone ── */}
      <TwilightBiome collectedStars={collectedStars} onStarCollect={onStarCollect} complete={biomesComplete.twilight} />

      <TranscendenceField visible={transcendence} />
      <MotherWhale        visible={transcendence} />

      <PlayerMesh playerRef={playerRef} transcendence={transcendence} revelationActive={revelationActive} />
      <PlayerController
        playerRef={playerRef}
        onPositionUpdate={onPositionUpdate}
        active={active && !transcendence}
      />
      <CameraController active={transcendence} playerPosition={playerPosition} />
    </>
  )
}

// ═══════════════════════════════════════════════════════════
//  STAR SETS (collectible — only 3 biomes have constellation stars)
// ═══════════════════════════════════════════════════════════
const FOREST_NAMES = new Set(FOREST_STAR_DATA.map(s => s.name))
const OCEAN_NAMES  = new Set(OCEAN_STAR_DATA.map(s => s.name))
const SKY_NAMES    = new Set(SKY_STAR_DATA.map(s => s.name))
const FROST_NAMES  = new Set(FROST_STAR_DATA.map(s => s.name))
const SAKURA_NAMES = new Set(SAKURA_STAR_DATA.map(s => s.name))
const SPRING_NAMES = new Set(SPRING_STAR_DATA.map(s => s.name))
const RAINBOW_NAMES = new Set(RAINBOW_STAR_DATA.map(s => s.name))
const TWILIGHT_NAMES = new Set(TWILIGHT_STAR_DATA.map(s => s.name))
const TOTAL_STARS  = FOREST_STAR_DATA.length + OCEAN_STAR_DATA.length + SKY_STAR_DATA.length + FROST_STAR_DATA.length + SAKURA_STAR_DATA.length + SPRING_STAR_DATA.length + RAINBOW_STAR_DATA.length + TWILIGHT_STAR_DATA.length

// ═══════════════════════════════════════════════════════════
//  AUDIO MANAGER
// ═══════════════════════════════════════════════════════════
const AUDIO_MAP = {
  prologue: '/audio/prologue.mp3', 
  forest:   '/audio/forest_bgm.mp3',   
  ocean:    '/audio/ocean_bgm.mp3',
  sky:      '/audio/sky_bgm.mp3',
  frost:    '/audio/frost_bgm.mp3',
  sakura:   '/audio/sakura_bgm.mp3',
  spring:   '/audio/spring_bgm.mp3',
  rainbow:  '/audio/rainbow_bgm.mp3',
  twilight: '/audio/twilight_bgm.mp3',
  ending:   '/audio/ending.mp3', 
}

function AudioManager({ currentBiome, prologueDone, transcendence }) {
  // Use a stable reference to a single Audio object
  const audioRef = useRef(null)
  if (!audioRef.current) audioRef.current = new Audio()
  
  const activeTrack = useRef(null)
  const fadeIntervalRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    const handleLoadStart = () => console.log(`[AudioManager] Loading file: ${audio.src}`)
    const handleCanPlay = () => console.log(`[AudioManager] Ready to play: ${audio.src}`)
    const handleError = () => {
      console.error(`[AudioManager] ERROR! Failed to load: ${audio.src}. Check if the filename/extension is exact (e.g., .mp3 vs .MP3)`);
    }
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplaythrough', handleCanPlay)
    audio.addEventListener('error', handleError)
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplaythrough', handleCanPlay)
      audio.removeEventListener('error', handleError)
    }
  }, [])

  // Handle browser autoplay policy by waiting for a user interaction
  const attemptPlay = useCallback((targetVolume = 0.4) => {
    const audio = audioRef.current
    if (!audio.src) return

    audio.play()
      .then(() => {
        console.log(`[AudioManager] Successfully playing: ${audio.src}`)
        // Start fade in ONLY after successful play
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
        audio.volume = 0
        fadeIntervalRef.current = setInterval(() => {
          if (audio.volume < targetVolume) {
            audio.volume = Math.min(targetVolume, audio.volume + 0.05)
          } else {
            clearInterval(fadeIntervalRef.current)
          }
        }, 150)
      })
      .catch((err) => {
      console.warn(`[AudioManager] Playback blocked by browser. Music will start on next click/keypress.`)
      
      const enableAudio = () => { 
        console.log("[AudioManager] User interaction detected, starting audio...")
        attemptPlay(targetVolume)
        cleanup()
      }

      const cleanup = () => {
        window.removeEventListener('click', enableAudio)
        window.removeEventListener('keydown', enableAudio)
        window.removeEventListener('mousedown', enableAudio)
        window.removeEventListener('touchstart', enableAudio)
      }

      window.addEventListener('click', enableAudio)
      window.addEventListener('keydown', enableAudio)
      window.addEventListener('mousedown', enableAudio)
      window.addEventListener('touchstart', enableAudio)
    })
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    audio.preload = 'auto'
    let nextTrack = null

    if (!prologueDone) nextTrack = AUDIO_MAP.prologue
    else if (transcendence) nextTrack = AUDIO_MAP.ending
    else nextTrack = AUDIO_MAP[currentBiome]

    if (nextTrack && nextTrack !== activeTrack.current) {
      const isFirstLoad = !activeTrack.current
      activeTrack.current = nextTrack
      
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
      console.log(`[AudioManager] Transitioning to: ${nextTrack}`)

      if (isFirstLoad) {
        audio.src = nextTrack
        audio.loop = (nextTrack !== AUDIO_MAP.ending)
        audio.load()
        attemptPlay()
      } else {
        // Fade out then switch
        fadeIntervalRef.current = setInterval(() => {
          if (audio.volume > 0.05) {
            audio.volume = Math.max(0, audio.volume - 0.05)
          } else {
            clearInterval(fadeIntervalRef.current)
            audio.pause()
            audio.src = nextTrack
            audio.load()
            audio.loop = (nextTrack !== AUDIO_MAP.ending)
            attemptPlay()
          }
        }, 50)
      }
    }

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
    }
  }, [currentBiome, prologueDone, transcendence, attemptPlay])

  return null
}

// ═══════════════════════════════════════════════════════════
//  APP ROOT
// ═══════════════════════════════════════════════════════════
export default function App() {
  useStringTune()

  const playerRef = useRef()
  const [prologueDone,   setPrologueDone]   = useState(false)
  const [showDebugCube,  setShowDebugCube]  = useState(true)
  const [collectedStars, setCollectedStars] = useState(new Set())
  const [biomesComplete, setBiomesComplete] = useState({ forest:false, ocean:false, sky:false, frost:false, sakura:false, spring:false, rainbow:false, twilight:false })
  const [transcendence,  setTranscendence]  = useState(false)
  const [revelationActive, setRevelationActive] = useState(false)
  const [flashMsg,       setFlashMsg]       = useState('')
  const [flashVisible,   setFlashVisible]   = useState(false)
  const [playerPos,      setPlayerPos]      = useState({ x:0, y:1.2, z:5 })
  const [showHints,      setShowHints]      = useState(false)
  const [entryBiome,     setEntryBiome]     = useState(null)
  const lastEntryBiome = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => { setShowDebugCube(false); console.log('[PHASE 1] Render confirmed') }, 950)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!prologueDone) return
    const a = setTimeout(() => setShowHints(true), 1000)
    const b = setTimeout(() => setShowHints(false), 11000)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [prologueDone])

  const currentBiome = useMemo(
    () => detectBiome(playerPos, transcendence),
    [playerPos, transcendence]
  )

  useEffect(() => {
    console.log(`[Biome] Active: ${currentBiome} | playerZ=${playerPos.z.toFixed(1)}`)
  }, [currentBiome])

  useEffect(() => {
    if (!prologueDone) return
    if (currentBiome !== lastEntryBiome.current) {
      lastEntryBiome.current = currentBiome
      setEntryBiome(currentBiome)
    }
  }, [currentBiome, prologueDone])

  const onPositionUpdate = useCallback((pos) => setPlayerPos(pos), [])

  const handleSelectBiome = useCallback((id, targetX, targetZ) => {
    if (!playerRef.current) return
    console.log(`[BiomeSelectorPanel] Teleporting to ${id} at x=${targetX}, z=${targetZ}`)
    playerRef.current.position.set(targetX, 2, targetZ + 5)
    setPlayerPos({ x: targetX, y: 2, z: targetZ + 5 })
  }, [])

  const handleStarCollect = useCallback((name) => {
    setCollectedStars(prev => {
      if (prev.has(name)) return prev
      const next = new Set(prev)
      next.add(name)
      console.log(`[Star] ${name} collected — ${next.size}/${TOTAL_STARS}`)
      return next
    })
  }, [])

  const triggerFlash = useCallback((msg) => {
    setFlashMsg(msg); setFlashVisible(true)
    setTimeout(() => setFlashVisible(false), 3200)
  }, [])

  useEffect(() => {
    const fd = [...FOREST_NAMES].every(n => collectedStars.has(n))
    const od = [...OCEAN_NAMES].every(n => collectedStars.has(n))
    const sd = [...SKY_NAMES].every(n => collectedStars.has(n))
    const frostD = [...FROST_NAMES].every(n => collectedStars.has(n))
    const sakuraD = [...SAKURA_NAMES].every(n => collectedStars.has(n))
    const springD = [...SPRING_NAMES].every(n => collectedStars.has(n))
    const rainbowD = [...RAINBOW_NAMES].every(n => collectedStars.has(n))
    const twilightD = [...TWILIGHT_NAMES].every(n => collectedStars.has(n))
    setBiomesComplete(prev => {
      const next = { ...prev }
      if (fd && !prev.forest) { next.forest=true; console.log('[Biome] Forest COMPLETE ✦'); triggerFlash('Viridan — Forest Constellation Restored ✦') }
      if (od && !prev.ocean)  { next.ocean =true; console.log('[Biome] Ocean COMPLETE ✦');  triggerFlash('Pelagis — Ocean Constellation Restored ✦')  }
      if (sd && !prev.sky)    { next.sky   =true; console.log('[Biome] Sky COMPLETE ✦');    triggerFlash('Aethon — Sky Constellation Restored ✦')    }
      if (frostD && !prev.frost) { next.frost=true; triggerFlash('The Silent Crown Restored ✦') }
      if (sakuraD && !prev.sakura) { next.sakura=true; triggerFlash('The Blooming Memory Restored ✦') }
      if (springD && !prev.spring) { next.spring=true; triggerFlash('The Awakening Field Restored ✦') }
      if (rainbowD && !prev.rainbow) { next.rainbow=true; triggerFlash('The Bridge of Light Restored ✦') }
      if (twilightD && !prev.twilight) { next.twilight=true; triggerFlash('The Final Horizon Restored ✦') }
      return next
    })
  }, [collectedStars])

  useEffect(() => {
    const allDone = Object.values(biomesComplete).every(v => v === true)
    if (allDone && !transcendence) {
      console.log('[Transcendence] Beginning final restoration')
      if (playerRef.current) {
        playerRef.current.position.set(LAYOUT.sky.x, 15, LAYOUT.sky.z)
        setPlayerPos({ x: LAYOUT.sky.x, y: 15, z: LAYOUT.sky.z })
      }
      setTimeout(() => setTranscendence(true), 2000)
    }
  }, [biomesComplete, transcendence])

  // Wraps handleSelectBiome — accepts (id, x, z) from BiomeSelectorPanel.
  // If z is undefined (new biomes not yet in panel data), falls back to BZ map.
  const handleSelectBiomeFull = useCallback((id, x, z) => {
    const targetX = (x !== undefined && x !== null) ? x : (LAYOUT[id]?.x ?? 0)
    const targetZ = (z !== undefined && z !== null) ? z : (LAYOUT[id]?.z ?? 0)
    handleSelectBiome(id, targetX, targetZ)
  }, [handleSelectBiome])

  return (
    <>
      <AudioManager 
        currentBiome={currentBiome} 
        prologueDone={prologueDone} 
        transcendence={transcendence} 
      />

      <div className="canvas-wrapper">
        <Canvas
          camera={{ position: [0, 3, 12], fov: 68, near: 0.1, far: 250 }}
          gl={{ antialias: true, alpha: false }}
          onCreated={() => console.log('[Canvas] Created and ready')}
        >
          <Scene
            playerRef={playerRef}
            collectedStars={collectedStars}
            onStarCollect={handleStarCollect}
            biomesComplete={biomesComplete}
            transcendence={transcendence}
            currentBiome={currentBiome}
            showDebugCube={showDebugCube}
            onPositionUpdate={onPositionUpdate}
            active={prologueDone}
            playerPosition={playerPos}
            revelationActive={revelationActive}
          />
        </Canvas>
      </div>

      {!prologueDone && (
        <Prologue onDismiss={() => {
          setPrologueDone(true)
          console.log('[Prologue] Complete — entering 3D world')
        }} />
      )}

      {prologueDone && <BiomeEntryOverlay biome={entryBiome} />}

      <BiomeSelectorPanel
        currentBiome={currentBiome}
        onSelectBiome={handleSelectBiomeFull}
        disabled={!prologueDone || transcendence}
      />

      <ConstellationPanel
        currentBiome={currentBiome}
        collectedStars={collectedStars}
        disabled={!prologueDone}
      />

      <FinalSequence active={transcendence} onRevelationChange={setRevelationActive} />

      {prologueDone && !transcendence && (
        <div className="hud">
          <div className="hud-biome">{BIOME_LABELS[currentBiome] || currentBiome}</div>
          <div className="hud-stars">{collectedStars.size} / {TOTAL_STARS} stars restored</div>
        </div>
      )}

      {showHints && (
        <div className="controls-hint">
          <div className="controls-hint-inner">
            <span>WASD / Arrows — move</span>
            <span>Space — ascend · Shift — descend</span>
            <span>Click + drag — look around</span>
            <span>Click glowing stars to collect</span>
          </div>
        </div>
      )}

      <div className={`biome-flash ${flashVisible ? 'visible' : ''}`}>
        <div className="biome-flash-text">{flashMsg}</div>
      </div>
    </>
  )
}
