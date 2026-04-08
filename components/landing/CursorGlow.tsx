'use client'

import { useEffect, useRef } from 'react'

/**
 * Renders a large radial-gradient orb that follows the cursor inside its
 * nearest positioned ancestor. Drop it as the first child of any
 * `position: relative; overflow: hidden` section.
 */
export default function CursorGlow() {
  const orbRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const orb = orbRef.current
    if (!orb) return
    const parent = orb.parentElement
    if (!parent) return

    let raf = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let visible = false

    // Smooth lerp so the orb lags slightly behind the cursor
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      currentX = lerp(currentX, targetX, 0.08)
      currentY = lerp(currentY, targetY, 0.08)
      orb.style.left = `${currentX}px`
      orb.style.top = `${currentY}px`
      raf = requestAnimationFrame(tick)
    }

    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect()
      targetX = e.clientX - rect.left
      targetY = e.clientY - rect.top

      if (!visible) {
        visible = true
        orb.style.opacity = '1'
        // Teleport on first entry so we don't animate from 0,0
        currentX = targetX
        currentY = targetY
      }
    }

    const onLeave = () => {
      visible = false
      orb.style.opacity = '0'
    }

    parent.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={orbRef}
      aria-hidden
      style={{
        position: 'absolute',
        width: '700px',
        height: '700px',
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.08) 40%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        opacity: 0,
        transition: 'opacity 0.4s ease',
        zIndex: 0,
        willChange: 'left, top',
      }}
    />
  )
}
