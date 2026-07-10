type BarcodeDetectorInstance = {
  detect(source: HTMLCanvasElement | HTMLVideoElement): Promise<Array<{ rawValue: string }>>
}

type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance

function getBarcodeDetector(): BarcodeDetectorConstructor | undefined {
  return (globalThis as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector
}

const JSQR_MAX_DIMENSION = 640

export async function detectQRCode(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): Promise<string | null> {
  const Detector = getBarcodeDetector()
  if (Detector) {
    const detector = new Detector({ formats: ['qr_code'] })
    const codes = await detector.detect(canvas)
    return codes.length > 0 ? codes[0].rawValue : null
  }

  const jsQR = (await import('jsqr')).default

  const scale = Math.min(1, JSQR_MAX_DIMENSION / Math.max(canvas.width, canvas.height))
  if (scale < 1) {
    const scaledWidth = Math.round(canvas.width * scale)
    const scaledHeight = Math.round(canvas.height * scale)
    const scaledCanvas = document.createElement('canvas')
    scaledCanvas.width = scaledWidth
    scaledCanvas.height = scaledHeight
    const scaledCtx = scaledCanvas.getContext('2d', { willReadFrequently: true })

    if (scaledCtx) {
      scaledCtx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight)
      const imageData = scaledCtx.getImageData(0, 0, scaledWidth, scaledHeight)
      const result = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })
      return result ? result.data : null
    }
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const result = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'dontInvert',
  })
  return result ? result.data : null
}
