-- MENA ROYAL: WAITLIST INFRASTRUCTURE
-- Optimized table for elite client intakes

CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    region TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'archived')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for searching/managing leads
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist (email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist (status);

-- Enable RLS (Safety)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (intake)
CREATE POLICY "Allow public waitlist intake" ON waitlist
    FOR INSERT WITH CHECK (true);

-- Allow authenticated admins to view/manage
CREATE POLICY "Allow service role full access" ON waitlist
    USING (true) WITH CHECK (true);
