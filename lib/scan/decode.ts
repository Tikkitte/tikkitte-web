export type FrameDecoder = {
  /** Called once per frame after the current video frame has been drawn to the canvas. */
  detect: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => Promise<string | null>
  /** Return a fatal unsupported-browser message, or null when scanning may start. */
  checkUnsupported?: () => string | null
}

type BarcodeDetectorInstance = {
  detect(source: HTMLCanvasElement | HTMLVideoElement): Promise<Array<{ rawValue: string }>>
}

type BarcodeDetectorConstructor = new (options: { formats: string[] }) => BarcodeDetectorInstance

function getBarcodeDetector(): BarcodeDetectorConstructor | undefined {
  return (globalThis as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector
}

export const nativeDecoder: FrameDecoder = {
  checkUnsupported: () => {
    return getBarcodeDetector()
      ? null
      : 'QR scanning requires Chrome on Android. This browser is not supported.'
  },
  detect: async (canvas) => {
    const Detector = getBarcodeDetector()
    if (!Detector) return null
    const detector = new Detector({ formats: ['qr_code'] })
    const codes = await detector.detect(canvas)
    return codes.length > 0 ? codes[0].rawValue : null
  },
}

export const jsQrDecoder: FrameDecoder = {
  detect: async (canvas, ctx) => {
    const Detector = getBarcodeDetector()
    if (Detector) {
      const detector = new Detector({ formats: ['qr_code'] })
      const codes = await detector.detect(canvas)
      return codes.length > 0 ? codes[0].rawValue : null
    }

    const jsQR = (await import('jsqr')).default
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const result = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })
    return result ? result.data : null
  },
}
