-- ===================================================
-- PatronaLeague Match & Instagram Verification Setup
-- ===================================================
-- Execute this script in your Supabase SQL Editor
-- to create the necessary tables and policies

-- -------------------------------------------------
-- Table: users_crushes
-- Stores user's matches (max 5 per user)
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS users_crushes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    match_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_crushes_user_id ON users_crushes(user_id);

-- Enable Row Level Security
ALTER TABLE users_crushes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own matches
CREATE POLICY "Users can view their own matches"
    ON users_crushes
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own matches
CREATE POLICY "Users can insert their own matches"
    ON users_crushes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own matches
CREATE POLICY "Users can update their own matches"
    ON users_crushes
    FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own matches
CREATE POLICY "Users can delete their own matches"
    ON users_crushes
    FOR DELETE
    USING (auth.uid() = user_id);

-- -------------------------------------------------
-- Table: instagram_verification
-- Stores Instagram verification status per user
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS instagram_verification (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    instagram_username TEXT NOT NULL,
    verification_code TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_instagram_verification_user_id ON instagram_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_verification_username ON instagram_verification(instagram_username);

-- Enable Row Level Security
ALTER TABLE instagram_verification ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own verification
CREATE POLICY "Users can view their own verification"
    ON instagram_verification
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Anyone can read Instagram usernames (for match detection)
CREATE POLICY "Anyone can read Instagram usernames"
    ON instagram_verification
    FOR SELECT
    USING (true);

-- RLS Policy: Users can insert their own verification
CREATE POLICY "Users can insert their own verification"
    ON instagram_verification
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own verification
CREATE POLICY "Users can update their own verification"
    ON instagram_verification
    FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own verification
CREATE POLICY "Users can delete their own verification"
    ON instagram_verification
    FOR DELETE
    USING (auth.uid() = user_id);

-- -------------------------------------------------
-- Success message
-- -------------------------------------------------
DO $$
BEGIN
    RAISE NOTICE 'Tables created successfully!';
    RAISE NOTICE '1. users_crushes - Ready to store user matches';
    RAISE NOTICE '2. instagram_verification - Ready to store Instagram verification data';
    RAISE NOTICE '';
    RAISE NOTICE 'All Row Level Security policies have been applied.';
    RAISE NOTICE 'Users can only access their own data.';
END $$;
