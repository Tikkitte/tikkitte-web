import type { Payout } from '@/lib/types'

type Props = {
  grossCollected: number
  platformFeePercent: number
  platformFeeAmount: number
  estimatedPayout: number
  payouts: Payout[]
}

function formatMoney(value: number) {
  return `GHS ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function PayoutSummary({
  grossCollected,
  platformFeePercent,
  platformFeeAmount,
  estimatedPayout,
  payouts,
}: Props) {
  if (grossCollected <= 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-semibold text-gray-900 mb-4 text-sm">Payout breakdown</h2>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Gross collected</span>
          <span className="font-semibold text-gray-900">{formatMoney(grossCollected)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Platform fee ({platformFeePercent}%)</span>
          <span className="font-semibold text-gray-900">-{formatMoney(platformFeeAmount)}</span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-4">
          <span className="font-semibold text-gray-900">Estimated payout</span>
          <span className="text-base font-extrabold text-gray-900">{formatMoney(estimatedPayout)}</span>
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-xs text-[#3d3d3d]">
        Payouts are processed by Tikkitte within 3-5 business days after the event.
      </p>

      {payouts.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Payout history</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 pr-4 text-left font-medium text-gray-500">Date</th>
                  <th className="px-4 py-2 text-right font-medium text-gray-500">Amount</th>
                  <th className="py-2 pl-4 text-right font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 text-gray-600">
                      {payout.status === 'paid' ? formatDate(payout.paid_at) : formatDate(payout.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatMoney(Number(payout.amount))}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <span
                        className={
                          payout.status === 'paid'
                            ? 'inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700'
                            : 'inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600'
                        }
                      >
                        {payout.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
