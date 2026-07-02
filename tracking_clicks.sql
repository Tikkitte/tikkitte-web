CREATE OR REPLACE FUNCTION public.increment_tracking_clicks(link_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE tracking_link
  SET clicks = clicks + 1
  WHERE id = link_id;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_tracking_clicks(uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_tracking_clicks(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.record_tracking_click(p_event_id text, p_slug text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE tracking_link
  SET clicks = clicks + 1
  WHERE event_id = p_event_id
    AND slug = lower(trim(p_slug));
$$;

REVOKE EXECUTE ON FUNCTION public.record_tracking_click(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.record_tracking_click(text, text) TO anon, authenticated;
