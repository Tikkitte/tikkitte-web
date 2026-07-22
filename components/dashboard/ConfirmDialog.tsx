'use client'

type Props = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  confirmingLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmingLabel = 'Working…',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={loading ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition-colors ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-gray-800'
            }`}
          >
            {loading ? confirmingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
