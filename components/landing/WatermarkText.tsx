type Props = {
  text: string
}

export default function WatermarkText({ text }: Props) {
  return (
    <span
      className="watermark-text select-none"
      style={{ fontFamily: 'var(--font-poppins)' }}
    >
      {text}
    </span>
  )
}
