'use client'

import { useEffect, useState } from 'react'

const SAMPLE_SIZE = 32

export function usePosterAverageColor(src: string | null, fallback: string) {
  const [color, setColor] = useState(fallback)

  // Reset during render (not in the effect below) the instant src or
  // fallback changes, so a reused component never keeps showing a stale
  // color sampled from a different poster while the new one loads — or
  // forever, if it fails to load. This is React's documented pattern for
  // adjusting state in response to a prop change without an extra render.
  const [trackedInputs, setTrackedInputs] = useState([src, fallback])
  if (trackedInputs[0] !== src || trackedInputs[1] !== fallback) {
    setTrackedInputs([src, fallback])
    setColor(fallback)
  }

  useEffect(() => {
    if (!src) return
    let cancelled = false
    const img = new window.Image()
    img.onerror = () => {
      if (cancelled) return
      setColor(fallback)
    }
    img.onload = () => {
      if (cancelled) return
      try {
        const canvas = document.createElement('canvas')
        canvas.width = SAMPLE_SIZE
        canvas.height = SAMPLE_SIZE
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
        const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)

        let r = 0, g = 0, b = 0, count = 0
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 128) continue
          const pr = data[i], pg = data[i + 1], pb = data[i + 2]
          const max = Math.max(pr, pg, pb)
          const min = Math.min(pr, pg, pb)
          if (max > 240 && min > 225) continue // near-white, likely poster margin/background
          if (max < 20) continue // near-black
          r += pr
          g += pg
          b += pb
          count++
        }
        if (count === 0 || cancelled) return
        setColor(`rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`)
      } catch {
        // decoding failed — keep the fallback color
      }
    }
    img.src = `/_next/image?url=${encodeURIComponent(src)}&w=${SAMPLE_SIZE}&q=20`
    return () => {
      cancelled = true
    }
  }, [src, fallback])

  return color
}
