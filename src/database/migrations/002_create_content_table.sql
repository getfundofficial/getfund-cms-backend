-- Create content table
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('news', 'hero_slide')),

  -- Common fields
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,

  -- News-specific fields
  excerpt TEXT,
  body TEXT,
  author VARCHAR(255),
  category VARCHAR(100),
  featured_image_url TEXT,

  -- Hero slide-specific fields (stored in meta_data)
  meta_data JSONB,

  -- Workflow
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_review', 'changes_requested', 'approved', 'published')),

  -- Tracking
  created_by UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  published_by UUID REFERENCES users(id),

  -- Notes
  review_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  submitted_for_review_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  approved_at TIMESTAMP,
  published_at TIMESTAMP,

  -- Soft delete
  deleted_at TIMESTAMP
);
