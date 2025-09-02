CREATE TABLE affiliate_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    instagram_handle TEXT NOT NULL UNIQUE,
    promo_code TEXT NOT NULL UNIQUE,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
