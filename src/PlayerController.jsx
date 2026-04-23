// ═══════════════════════════════════════════════════════════
//  PlayerController.jsx
//  Phase 4 — WASD/Arrow keyboard movement
//  Phase 5 — Third-person camera with lerp
//  Phase 6 — Space/Shift flight system
// ═══════════════════════════════════════════════════════════

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ─── CONSTANTS ──────────────────────────────────────────────
const MOVE_SPEED = 6.0        // units/sec
const VERTICAL_SPEED = 4.0    // units/sec
const LERP_POSITION = 0.10    // player position smoothing
const LERP_CAMERA = 0.06      // camera follow smoothing (cinematic lag)
const CAMERA_OFFSET = new THREE.Vector3(0, 2.8, 7.0)  // behind + above player
const YAW_SENSITIVITY = 0.003 // mouse yaw speed
const YAW_CLAMP = Math.PI * 2 // full rotation allowed (yaw only)
const MIN_Y = 0.5             // minimum height (floor)
const MAX_Y = 40              // maximum height (sky)

export default function PlayerController({ playerRef, onPositionUpdate, active }) {
  const { camera, gl } = useThree()

  // ─── Input state ──────────────────────────────────────────
  const keys = useRef({
    forward: false, backward: false,
    left: false, right: false,
    up: false, down: false,
  })

  // ─── Yaw tracking (mouse horizontal) ─────────────────────
  const yaw = useRef(Math.PI) // start facing -Z (into world)
  const isDragging = useRef(false)
  const lastMouseX = useRef(0)

  // ─── Velocity vector for smooth movement ─────────────────
  const velocity = useRef(new THREE.Vector3())
  const targetPosition = useRef(new THREE.Vector3(0, 1.2, 5))

  // ─── Camera tracking ─────────────────────────────────────
  const cameraTarget = useRef(new THREE.Vector3(0, 2.5, 12))

  // ─── Keyboard listeners ───────────────────────────────────
  useEffect(() => {
    const onDown = (e) => {
      if (!active) return
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    keys.current.forward  = true; break
        case 'KeyS': case 'ArrowDown':  keys.current.backward = true; break
        case 'KeyA': case 'ArrowLeft':  keys.current.left     = true; break
        case 'KeyD': case 'ArrowRight': keys.current.right    = true; break
        case 'Space':                   keys.current.up       = true; e.preventDefault(); break
        case 'ShiftLeft': case 'ShiftRight': keys.current.down = true; break
      }
    }
    const onUp = (e) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    keys.current.forward  = false; break
        case 'KeyS': case 'ArrowDown':  keys.current.backward = false; break
        case 'KeyA': case 'ArrowLeft':  keys.current.left     = false; break
        case 'KeyD': case 'ArrowRight': keys.current.right    = false; break
        case 'Space':                   keys.current.up       = false; break
        case 'ShiftLeft': case 'ShiftRight': keys.current.down = false; break
      }
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [active])

  // ─── Mouse drag for yaw ───────────────────────────────────
  useEffect(() => {
    const canvas = gl.domElement
    const onMouseDown = (e) => {
      if (!active) return
      isDragging.current = true
      lastMouseX.current = e.clientX
    }
    const onMouseMove = (e) => {
      if (!isDragging.current || !active) return
      const dx = e.clientX - lastMouseX.current
      lastMouseX.current = e.clientX
      yaw.current -= dx * YAW_SENSITIVITY
    }
    const onMouseUp = () => { isDragging.current = false }

    // Touch support
    const onTouchStart = (e) => {
      if (!active) return
      isDragging.current = true
      lastMouseX.current = e.touches[0].clientX
    }
    const onTouchMove = (e) => {
      if (!isDragging.current || !active) return
      const dx = e.touches[0].clientX - lastMouseX.current
      lastMouseX.current = e.touches[0].clientX
      yaw.current -= dx * YAW_SENSITIVITY
    }
    const onTouchEnd = () => { isDragging.current = false }

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [active, gl.domElement])

  // ─── Frame loop ───────────────────────────────────────────
  const _fwd   = new THREE.Vector3()
  const _right = new THREE.Vector3()
  const _move  = new THREE.Vector3()
  const _camTarget = new THREE.Vector3()
  const _lookAt = new THREE.Vector3()

  useFrame((state, delta) => {
    if (!active || !playerRef.current) return

    // Guard against NaN delta (first frame, tab focus, etc.)
    const dt = Math.min(delta, 0.1)

    // SNAP CHECK: If the mesh was teleported externally (menu click), sync targetPosition
    if (playerRef.current.position.distanceTo(targetPosition.current) > 2.5) {
      targetPosition.current.copy(playerRef.current.position)
      return // skip one frame to stabilize
    }

    // ── 1. Build movement direction from yaw ──────────────
    _fwd.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current))
    _right.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current))

    _move.set(0, 0, 0)
    if (keys.current.forward)  _move.addScaledVector(_fwd, 1)
    if (keys.current.backward) _move.addScaledVector(_fwd, -1)
    if (keys.current.right)    _move.addScaledVector(_right, 1)
    if (keys.current.left)     _move.addScaledVector(_right, -1)

    // Normalize diagonal movement
    if (_move.length() > 0) _move.normalize()

    // ── 2. Apply velocity (frame-rate independent) ────────
    velocity.current.x = _move.x * MOVE_SPEED
    velocity.current.z = _move.z * MOVE_SPEED

    // Vertical (flight)
    if (keys.current.up)   velocity.current.y = VERTICAL_SPEED
    else if (keys.current.down) velocity.current.y = -VERTICAL_SPEED
    else velocity.current.y *= 0.85 // gentle deceleration

    // ── 3. Move target position ───────────────────────────
    targetPosition.current.x += velocity.current.x * dt
    targetPosition.current.y += velocity.current.y * dt
    targetPosition.current.z += velocity.current.z * dt

    // Clamp Y
    targetPosition.current.y = Math.max(MIN_Y, Math.min(MAX_Y, targetPosition.current.y))

    // ── 4. Lerp player mesh to target ─────────────────────
    playerRef.current.position.lerp(targetPosition.current, LERP_POSITION)

    // Validate — no NaN allowed
    if (isNaN(playerRef.current.position.x)) {
      console.warn('[PlayerController] NaN position detected — resetting')
      playerRef.current.position.set(0, 1.2, 5)
      targetPosition.current.set(0, 1.2, 5)
    }

    // Rotate player mesh to face movement direction
    if (_move.length() > 0.01) {
      const angle = Math.atan2(_move.x, _move.z)
      playerRef.current.rotation.y = THREE.MathUtils.lerp(
        playerRef.current.rotation.y,
        angle,
        0.12
      )
    }

    // ── 5. Camera: calculate offset behind/above player ───
    const camOffsetRotated = new THREE.Vector3(
      CAMERA_OFFSET.x * Math.cos(yaw.current) + CAMERA_OFFSET.z * Math.sin(yaw.current),
      CAMERA_OFFSET.y,
      -CAMERA_OFFSET.x * Math.sin(yaw.current) + CAMERA_OFFSET.z * Math.cos(yaw.current)
    )

    _camTarget.copy(playerRef.current.position).add(camOffsetRotated)

    // Clamp camera Y
    _camTarget.y = Math.max(1.0, _camTarget.y)

    // Smooth camera follow (cinematic lag)
    camera.position.lerp(_camTarget, LERP_CAMERA)

    // Look slightly ahead of player
    _lookAt.copy(playerRef.current.position)
    _lookAt.y += 0.8
    camera.lookAt(_lookAt)

    // ── 6. Notify parent of position for biome detection ──
    if (onPositionUpdate) {
      onPositionUpdate({
        x: playerRef.current.position.x,
        y: playerRef.current.position.y,
        z: playerRef.current.position.z,
      })
    }

    // Debug log (throttled)
    if (Math.round(state.clock.elapsedTime * 2) % 60 === 0) {
      const p = playerRef.current.position
      console.log(`[Movement] pos=(${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}) dt=${dt.toFixed(3)}`)
    }
  })

  return null
}
