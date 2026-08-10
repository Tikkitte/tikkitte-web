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
    <div className="rounded-[18px] bg-[#191917] px-[22px] py-5 text-white">
      <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[#a7a59a]">Payout for this event</h2>

      <div className="text-[12.5px]">
        <div className="flex items-center justify-between gap-4 py-1 text-[#d8d6cc]">
          <span>Gross collected</span>
          <span className="tabular-nums">{formatMoney(grossCollected)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-1 text-[#d8d6cc]">
          <span>Platform fee ({platformFeePercent}%)</span>
          <span className="tabular-nums">−{formatMoney(platformFeeAmount)}</span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between gap-4 border-t border-white/15 pb-0.5 pt-2.5 text-white">
          <span className="font-semibold">You get</span>
          <span className="create-display text-[20px] text-white tabular-nums">{formatMoney(estimatedPayout)}</span>
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-5 text-[#a7a59a]">
        Included in your available balance. Payouts arrive within 3–5 business days of request.
      </p>

      {payouts.length > 0 && (
        <div className="mt-5 border-t border-[#49483f] pt-5">
          <h3 className="mb-3 text-sm font-semibold text-white">Payout history</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#49483f]">
                  <th className="py-2 pr-4 text-left font-medium text-[#aaa89f]">Date</th>
                  <th className="px-4 py-2 text-right font-medium text-[#aaa89f]">Amount</th>
                  <th className="py-2 pl-4 text-right font-medium text-[#aaa89f]">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-[#3c3b35] last:border-0">
                    <td className="py-3 pr-4 text-[#cbc9be]">
                      {payout.status === 'paid' ? formatDate(payout.paid_at) : formatDate(payout.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-white">
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
