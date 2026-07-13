-- Refund tracking on payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS refund_status text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS refund_reference text;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS refunded_at timestamptz;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS refund_error text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'payments_refund_status_check'
      AND conrelid = 'public.payments'::regclass
  ) THEN
    ALTER TABLE public.payments
      ADD CONSTRAINT payments_refund_status_check
      CHECK (refund_status IS NULL OR refund_status IN ('pending', 'success', 'failed'));
  END IF;
END $$;

-- refund_status is NULL for payments that were never refunded (the normal case).
-- 'pending'  = Paystack accepted the refund request, awaiting refund.processed webhook
-- 'success'  = Paystack confirmed the refund completed (via webhook)
-- 'failed'   = Paystack rejected the request, or refund.failed webhook received

-- Trigger: when an event is cancelled, call the refund-cancelled-event edge function.
CREATE OR REPLACE FUNCTION public.refund_cancelled_event_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  service_role_key text;
begin
  select decrypted_secret into service_role_key
  from vault.decrypted_secrets
  where name = 'service_role_key'
  limit 1;

  if service_role_key is null or service_role_key = '' then
    raise warning 'refund_cancelled_event_webhook: service_role_key not found in vault, skipping';
    return NEW;
  end if;

  perform net.http_post(
    url     := 'https://eqlewbjeyfkhnlrkvjjx.supabase.co/functions/v1/refund-cancelled-event',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body    := jsonb_build_object('event_id', NEW.id)
  );

  return NEW;
end;
$function$;

DROP TRIGGER IF EXISTS on_event_cancel ON public.event;

CREATE TRIGGER on_event_cancel
AFTER UPDATE ON public.event
FOR EACH ROW
WHEN (old.cancelled IS DISTINCT FROM new.cancelled AND new.cancelled = true)
EXECUTE FUNCTION public.refund_cancelled_event_webhook();
