// ═══════════════════════════════════════════════════════════
//  CameraController.jsx
//  Handles cinematic camera for transcendence sequence only.
//  During normal play, PlayerController drives the camera.
// ═══════════════════════════════════════════════════════════

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const _lookTarget = new THREE.Vector3()
const _camTarget  = new THREE.Vector3()

export default function CameraController({ active, playerPosition }) {
  const { camera } = useThree()
  const startTime = useRef(null)
  const startPos  = useRef(null)

  useEffect(() => {
    if (active) {
      startTime.current = null
      startPos.current  = camera.position.clone()
      console.log('[CameraController] Transcendence cinematic started')
    }
  }, [active])

  useFrame((state, delta) => {
    if (!active) return

    const dt = Math.min(delta, 0.1)
    if (!startTime.current) startTime.current = state.clock.elapsedTime
    const elapsed = state.clock.elapsedTime - startTime.current

    const sx = -75 // Sky Realm X
    const sz = 0   // Sky Realm Z

    if (elapsed < 18) {
      // Wide shot watching whale approach
      _camTarget.set(sx + 12, 18, sz + 25)
      _lookTarget.set(sx, 18, sz - 60)
    } else {
      // Face player with stars behind them (Looking towards -Z)
      _camTarget.set(sx, 16.5, sz + 8)
      _lookTarget.set(sx, 15.8, sz - 40)
    }

    camera.position.lerp(_camTarget, 0.02)
    camera.lookAt(_lookTarget)
  })

  return null
}
