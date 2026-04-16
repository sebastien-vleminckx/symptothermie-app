-- Symptothermie Tracking App - PostgreSQL Schema for Supabase
-- Created: 2026-04-16

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE mucus_type_enum AS ENUM ('dry', 'sticky', 'creamy', 'watery', 'egg_white');
CREATE TYPE mucus_quantity_enum AS ENUM ('none', 'light', 'moderate', 'heavy');
CREATE TYPE cervix_position_enum AS ENUM ('low', 'medium', 'high');
CREATE TYPE cervix_firmness_enum AS ENUM ('firm', 'soft');
CREATE TYPE cervix_openness_enum AS ENUM ('closed', 'medium', 'open');
CREATE TYPE menstruation_flow_enum AS ENUM ('none', 'spotting', 'light', 'medium', 'heavy');
CREATE TYPE fertility_status_enum AS ENUM ('fertile', 'possibly_fertile', 'infertile');

-- ============================================
-- TABLES
-- ============================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cycles table
CREATE TABLE cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    cycle_length INTEGER,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily entries table
CREATE TABLE daily_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cycle_id UUID REFERENCES cycles(id) ON DELETE SET NULL,
    entry_date DATE NOT NULL,
    basal_temp DECIMAL(4,2),
    mucus_type mucus_type_enum,
    mucus_quantity mucus_quantity_enum,
    cervix_position cervix_position_enum,
    cervix_firmness cervix_firmness_enum,
    cervix_openness cervix_openness_enum,
    sleep_hours DECIMAL(3,1),
    alcohol_consumed BOOLEAN DEFAULT FALSE,
    illness_notes TEXT,
    menstruation_flow menstruation_flow_enum DEFAULT 'none',
    sexual_activity BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, entry_date)
);

-- Fertility status table
CREATE TABLE fertility_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
    calculated_status fertility_status_enum NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Indexes on users table
CREATE INDEX idx_users_email ON users(email);

-- Indexes on cycles table
CREATE INDEX idx_cycles_user_id ON cycles(user_id);
CREATE INDEX idx_cycles_start_date ON cycles(start_date);
CREATE INDEX idx_cycles_is_current ON cycles(is_current);

-- Indexes on daily_entries table
CREATE INDEX idx_daily_entries_user_id ON daily_entries(user_id);
CREATE INDEX idx_daily_entries_cycle_id ON daily_entries(cycle_id);
CREATE INDEX idx_daily_entries_entry_date ON daily_entries(entry_date);
CREATE INDEX idx_daily_entries_user_date ON daily_entries(user_id, entry_date);

-- Indexes on fertility_status table
CREATE INDEX idx_fertility_status_entry_id ON fertility_status(entry_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fertility_status ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY users_delete_own ON users
    FOR DELETE USING (auth.uid() = id);

-- Allow insert during signup (handled by Supabase Auth trigger or service role)
CREATE POLICY users_insert ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Cycles table policies
CREATE POLICY cycles_select_own ON cycles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY cycles_insert_own ON cycles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY cycles_update_own ON cycles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY cycles_delete_own ON cycles
    FOR DELETE USING (auth.uid() = user_id);

-- Daily entries table policies
CREATE POLICY daily_entries_select_own ON daily_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY daily_entries_insert_own ON daily_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY daily_entries_update_own ON daily_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY daily_entries_delete_own ON daily_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Fertility status table policies
-- Fertility status is linked to entries, so we check via the entry's user_id
CREATE POLICY fertility_status_select_own ON fertility_status
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM daily_entries
            WHERE daily_entries.id = fertility_status.entry_id
            AND daily_entries.user_id = auth.uid()
        )
    );

CREATE POLICY fertility_status_insert_own ON fertility_status
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM daily_entries
            WHERE daily_entries.id = fertility_status.entry_id
            AND daily_entries.user_id = auth.uid()
        )
    );

CREATE POLICY fertility_status_update_own ON fertility_status
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM daily_entries
            WHERE daily_entries.id = fertility_status.entry_id
            AND daily_entries.user_id = auth.uid()
        )
    );

CREATE POLICY fertility_status_delete_own ON fertility_status
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM daily_entries
            WHERE daily_entries.id = fertility_status.entry_id
            AND daily_entries.user_id = auth.uid()
        )
    );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER cycles_updated_at BEFORE UPDATE ON cycles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER daily_entries_updated_at BEFORE UPDATE ON daily_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER fertility_status_updated_at BEFORE UPDATE ON fertility_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'Application users';
COMMENT ON TABLE cycles IS 'Menstrual cycles tracked by users';
COMMENT ON TABLE daily_entries IS 'Daily symptom and measurement entries';
COMMENT ON TABLE fertility_status IS 'Calculated fertility status for each daily entry';
