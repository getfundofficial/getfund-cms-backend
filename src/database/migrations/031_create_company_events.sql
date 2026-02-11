-- Create company_events table for calendar feature
CREATE TABLE IF NOT EXISTS company_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_type VARCHAR(50) DEFAULT 'other',
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster date range queries
CREATE INDEX IF NOT EXISTS idx_company_events_date ON company_events(event_date);

-- Create index for event type filtering
CREATE INDEX IF NOT EXISTS idx_company_events_type ON company_events(event_type);

-- Add comment for documentation
COMMENT ON TABLE company_events IS 'Stores company-wide events for the CMS calendar';
COMMENT ON COLUMN company_events.event_type IS 'Event category: meeting, deadline, celebration, training, other';
