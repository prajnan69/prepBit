CREATE TABLE affiliate_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    instagram_handle TEXT NOT NULL,
    verification_code TEXT NOT NULL UNIQUE,
    is_approved BOOLEAN DEFAULT false,
    promo_code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id)
);

ALTER TABLE affiliate_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view their own data"
ON affiliate_participants
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Public can create affiliate applications"
ON affiliate_participants
FOR INSERT
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.handle_affiliate_approval()
RETURNS TRIGGER AS $$
DECLARE
  new_promo_code TEXT;
BEGIN
  -- Check if the user is being approved (and wasn't already)
  IF NEW.is_approved = true AND OLD.is_approved = false THEN
    -- Generate a 6-character uppercase alphanumeric promo code
    new_promo_code := upper(substr(md5(random()::text), 0, 7));
    NEW.promo_code := new_promo_code;

    -- Insert the new promo code into the promo_codes table
    INSERT INTO public.promo_codes (code, discount_percentage)
    VALUES (new_promo_code, 20);

    -- Update the corresponding profile's subscription status
    UPDATE public.profiles
    SET subscription_status = 'active'
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the old trigger if it exists
DROP TRIGGER IF EXISTS on_affiliate_approval ON public.affiliate_participants;

-- Create the new trigger
CREATE TRIGGER on_affiliate_approval
BEFORE UPDATE OF is_approved ON public.affiliate_participants
FOR EACH ROW
EXECUTE FUNCTION public.handle_affiliate_approval();
