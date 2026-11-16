// TEMPORARY: remove once LTL New Year @Enzo (2027-01-01) is over, along with
// lib/display-price.ts. To remove: delete this file and undo its call sites
// (grep -rn "checkout-acknowledgement").
//
// Added 2026-11-16 at LTL's request: buyers must tick a box agreeing that all
// sales are final before they can pay, on both the ticket and the table
// checkout. Keyed by event ID.
//
// Browser-only on purpose: the payment functions don't check it. As evidence
// for disputes, the agreed text and the time are saved to the buyer's auth
// user metadata (checkout_acknowledgement, checkout_acknowledged_at). The
// payment row's user_id links an order back to that user.
type CheckoutAcknowledgement = {
  terms: string
  // Shown in bold after the terms.
  emphasis: string
}

const ACKNOWLEDGEMENTS: Record<string, CheckoutAcknowledgement> = {
  // LTL New Year @Enzo. LTL's own wording, in sentence case instead of caps.
  'b4a51829-398b-4c32-9c16-1b0c7a3dacb0': {
    terms:
      'I acknowledge that all purchases are final and non-refundable. By completing this purchase I waive any right to dispute this charge on the basis of refund eligibility.',
    emphasis: 'Doors close at 12AM. Late arrivals will not be granted entry into the venue.',
  },
}

export const ACKNOWLEDGEMENT_REQUIRED_MESSAGE = 'Please tick the box to agree before paying.'

export function checkoutAcknowledgement(eventId: string): CheckoutAcknowledgement | null {
  return ACKNOWLEDGEMENTS[eventId] ?? null
}

// Extra fields for the checkout's auth.updateUser({ data }) call. Empty for
// events without an acknowledgement.
export function acknowledgementMetadata(acknowledgement: CheckoutAcknowledgement | null) {
  if (!acknowledgement) return {}
  return {
    checkout_acknowledgement: `${acknowledgement.terms} ${acknowledgement.emphasis}`,
    checkout_acknowledged_at: new Date().toISOString(),
  }
}
