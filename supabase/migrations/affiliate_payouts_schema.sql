CREATE TABLE affiliate_monthly_earnings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    affiliate_id UUID REFERENCES affiliate_participants(id),
    month DATE NOT NULL,
    total_earnings NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE affiliate_payouts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    affiliate_id UUID REFERENCES affiliate_participants(id),
    amount NUMERIC NOT NULL,
    upi_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    requested_at TIMESTAMPTZ DEFAULT now(),
    processed_at TIMESTAMPTZ
);

ALTER TABLE affiliate_monthly_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view their own earnings"
ON affiliate_monthly_earnings
FOR SELECT
USING (auth.uid() = (SELECT user_id FROM affiliate_participants WHERE id = affiliate_id));

CREATE POLICY "Affiliates can manage their own payouts"
ON affiliate_payouts
FOR ALL
USING (auth.uid() = (SELECT user_id FROM affiliate_participants WHERE id = affiliate_id));
