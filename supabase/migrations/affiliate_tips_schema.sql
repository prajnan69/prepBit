CREATE TABLE affiliate_tips (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    description TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id)
);

ALTER TABLE affiliate_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON affiliate_tips
FOR SELECT
USING (true);
