DROP TABLE IF EXISTS redeemed_reels;
CREATE TABLE redeemed_reels (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    affiliate_id UUID NOT NULL REFERENCES affiliate_participants(id),
    reel_url TEXT NOT NULL UNIQUE,
    instagram_user_id TEXT,
    views BIGINT NOT NULL,
    earnings NUMERIC NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    is_redeemed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
