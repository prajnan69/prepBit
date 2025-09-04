DROP FUNCTION IF EXISTS get_affiliate_earnings(p_user_id UUID);
CREATE OR REPLACE FUNCTION get_affiliate_earnings(p_user_id UUID)
RETURNS TABLE (
  total_earnings NUMERIC,
  trial_count BIGINT,
  monthly_subs_count BIGINT,
  yearly_subs_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promo_code_id BIGINT;
  v_completed_payouts NUMERIC;
  v_reel_earnings NUMERIC;
  v_initial_bonus NUMERIC;
BEGIN
  -- Get the initial bonus for the given user
  SELECT COALESCE(initial_bonus, 0) INTO v_initial_bonus
  FROM public.affiliate_participants
  WHERE user_id = p_user_id;

  -- Get the promo_code_id for the given user
  SELECT pc.id INTO v_promo_code_id
  FROM public.promo_codes pc
  JOIN public.affiliate_participants ap ON pc.code = ap.promo_code
  WHERE ap.user_id = p_user_id;

  -- Calculate the sum of completed payouts
  SELECT COALESCE(SUM(amount), 0) INTO v_completed_payouts
  FROM public.affiliate_payouts
  WHERE affiliate_id = (SELECT id FROM public.affiliate_participants WHERE user_id = p_user_id) AND status = 'completed';

  -- Calculate the sum of reel earnings
  SELECT COALESCE(SUM((views / 100) * 3.8), 0) INTO v_reel_earnings
  FROM public.redeemed_reels
  WHERE affiliate_id = (SELECT id FROM public.affiliate_participants WHERE user_id = p_user_id) AND is_approved = TRUE AND is_redeemed = FALSE;

  -- Calculate earnings and subscription counts
  RETURN QUERY
  WITH promo_users AS (
    SELECT user_id
    FROM public.user_promo_codes
    WHERE promo_code_id = v_promo_code_id
  )
  SELECT
    (COALESCE(SUM(
      CASE
        WHEN us.product_plan_identifier LIKE '%prepbit-monthly-promo-base%' THEN 250 * 0.1
        WHEN us.product_plan_identifier LIKE '%prepbit-yearly-promo-base%' THEN 2500 * 0.1
        ELSE 0
      END
    ), 0) + v_reel_earnings + v_initial_bonus - v_completed_payouts)::NUMERIC AS total_earnings,
    COALESCE(SUM(CASE WHEN us.product_plan_identifier LIKE '%trial%' THEN 1 ELSE 0 END), 0)::BIGINT AS trial_count,
    COALESCE(SUM(CASE WHEN us.product_plan_identifier LIKE '%prepbit-monthly-promo-base%' THEN 1 ELSE 0 END), 0)::BIGINT AS monthly_subs_count,
    COALESCE(SUM(CASE WHEN us.product_plan_identifier LIKE '%prepbit-yearly-promo-base%' THEN 1 ELSE 0 END), 0)::BIGINT AS yearly_subs_count
  FROM public.user_subscriptions us
  WHERE us.user_id IN (SELECT user_id FROM promo_users);
END;
$$;
