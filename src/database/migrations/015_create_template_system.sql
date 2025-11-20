-- Migration 015: Create Template System
-- This migration creates the foundation for the page template system
-- allowing different page layouts and reusable section components

-- 1. Create page_layouts table
CREATE TABLE IF NOT EXISTS page_layouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  structure JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create section_templates table
CREATE TABLE IF NOT EXISTS section_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_type VARCHAR(50) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  schema JSONB NOT NULL,
  default_props JSONB DEFAULT '{}'::jsonb,
  preview_template TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Add template columns to pages table
ALTER TABLE pages
  ADD COLUMN IF NOT EXISTS layout_id UUID REFERENCES page_layouts(id),
  ADD COLUMN IF NOT EXISTS template_variables JSONB DEFAULT '{}'::jsonb;

-- 4. Add template columns to page_sections table
ALTER TABLE page_sections
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES section_templates(id),
  ADD COLUMN IF NOT EXISTS template_variables JSONB DEFAULT '{}'::jsonb;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_layout_id ON pages(layout_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_template_id ON page_sections(template_id);
CREATE INDEX IF NOT EXISTS idx_page_layouts_name ON page_layouts(name);
CREATE INDEX IF NOT EXISTS idx_page_layouts_is_active ON page_layouts(is_active);
CREATE INDEX IF NOT EXISTS idx_section_templates_component_type ON section_templates(component_type);
CREATE INDEX IF NOT EXISTS idx_section_templates_is_active ON section_templates(is_active);

-- 6. Add comments
COMMENT ON TABLE page_layouts IS 'Page layout templates defining overall page structure';
COMMENT ON TABLE section_templates IS 'Reusable section component templates';
COMMENT ON COLUMN page_layouts.structure IS 'JSONB defining section slots and constraints';
COMMENT ON COLUMN section_templates.schema IS 'JSONB schema defining expected data structure';
COMMENT ON COLUMN pages.layout_id IS 'Reference to page layout template';
COMMENT ON COLUMN pages.template_variables IS 'Page-level template variables';
COMMENT ON COLUMN page_sections.template_id IS 'Reference to section component template';
COMMENT ON COLUMN page_sections.template_variables IS 'Section-level template variables';

-- 7. Seed default page layouts
INSERT INTO page_layouts (name, display_name, description, structure) VALUES
(
  'default',
  'Default Layout',
  'Standard page layout with flexible content sections',
  '{
    "slots": [
      {"key": "hero", "required": false, "max": 1},
      {"key": "content", "required": true, "max": null},
      {"key": "cta", "required": false, "max": 2}
    ]
  }'::jsonb
)
ON CONFLICT (name) DO NOTHING;

INSERT INTO page_layouts (name, display_name, description, structure) VALUES
(
  'landing-page',
  'Landing Page',
  'Marketing-focused landing page with hero, features, testimonials, and pricing',
  '{
    "slots": [
      {"key": "hero", "required": true, "max": 1},
      {"key": "features", "required": false, "max": 3},
      {"key": "testimonials", "required": false, "max": 1},
      {"key": "pricing", "required": false, "max": 1},
      {"key": "cta", "required": true, "max": 1}
    ]
  }'::jsonb
)
ON CONFLICT (name) DO NOTHING;

INSERT INTO page_layouts (name, display_name, description, structure) VALUES
(
  'full-width',
  'Full Width',
  'Full-width layout for immersive content',
  '{
    "slots": [
      {"key": "banner", "required": true, "max": 1},
      {"key": "content", "required": true, "max": null}
    ]
  }'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- 8. Seed section component templates
INSERT INTO section_templates (component_type, display_name, description, schema, default_props) VALUES
(
  'hero',
  'Hero Slider',
  'Full-width hero carousel with slides',
  '{
    "type": "object",
    "properties": {
      "slides": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "title": {"type": "string", "required": true},
            "subtitle": {"type": "string"},
            "imageUrl": {"type": "string", "format": "url", "required": true},
            "buttonText": {"type": "string"},
            "buttonLink": {"type": "string"}
          }
        }
      },
      "autoplay": {"type": "boolean", "default": true},
      "interval": {"type": "number", "default": 5000}
    }
  }'::jsonb,
  '{
    "autoplay": true,
    "interval": 5000,
    "slides": []
  }'::jsonb
)
ON CONFLICT DO NOTHING;

INSERT INTO section_templates (component_type, display_name, description, schema, default_props) VALUES
(
  'text',
  'Rich Text Content',
  'Rich text editor content block',
  '{
    "type": "object",
    "properties": {
      "content": {"type": "string", "format": "html", "required": true},
      "alignment": {"type": "string", "enum": ["left", "center", "right"], "default": "left"}
    }
  }'::jsonb,
  '{
    "content": "",
    "alignment": "left"
  }'::jsonb
)
ON CONFLICT DO NOTHING;

INSERT INTO section_templates (component_type, display_name, description, schema, default_props) VALUES
(
  'stats',
  'Statistics Display',
  'Display key statistics and metrics',
  '{
    "type": "object",
    "properties": {
      "stats": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "label": {"type": "string", "required": true},
            "value": {"type": "string", "required": true},
            "suffix": {"type": "string"}
          }
        }
      },
      "layout": {"type": "string", "enum": ["horizontal", "grid"], "default": "grid"}
    }
  }'::jsonb,
  '{
    "stats": [],
    "layout": "grid"
  }'::jsonb
)
ON CONFLICT DO NOTHING;

INSERT INTO section_templates (component_type, display_name, description, schema, default_props) VALUES
(
  'features',
  'Feature Cards',
  'Display features or services in card format',
  '{
    "type": "object",
    "properties": {
      "features": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "title": {"type": "string", "required": true},
            "description": {"type": "string", "required": true},
            "icon": {"type": "string"},
            "imageUrl": {"type": "string", "format": "url"}
          }
        }
      },
      "columns": {"type": "number", "default": 3}
    }
  }'::jsonb,
  '{
    "features": [],
    "columns": 3
  }'::jsonb
)
ON CONFLICT DO NOTHING;

INSERT INTO section_templates (component_type, display_name, description, schema, default_props) VALUES
(
  'cta',
  'Call to Action',
  'Call-to-action section with button',
  '{
    "type": "object",
    "properties": {
      "title": {"type": "string", "required": true},
      "description": {"type": "string"},
      "buttonText": {"type": "string", "required": true},
      "buttonLink": {"type": "string", "required": true},
      "backgroundImageUrl": {"type": "string", "format": "url"}
    }
  }'::jsonb,
  '{
    "title": "",
    "description": "",
    "buttonText": "Learn More",
    "buttonLink": "#"
  }'::jsonb
)
ON CONFLICT DO NOTHING;

INSERT INTO section_templates (component_type, display_name, description, schema, default_props) VALUES
(
  'gallery',
  'Image Gallery',
  'Display images in grid or carousel format',
  '{
    "type": "object",
    "properties": {
      "images": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "url": {"type": "string", "format": "url", "required": true},
            "caption": {"type": "string"},
            "alt": {"type": "string", "required": true}
          }
        }
      },
      "layout": {"type": "string", "enum": ["grid", "carousel"], "default": "grid"},
      "columns": {"type": "number", "default": 3}
    }
  }'::jsonb,
  '{
    "images": [],
    "layout": "grid",
    "columns": 3
  }'::jsonb
)
ON CONFLICT DO NOTHING;

-- 9. Update existing home page to use default layout
UPDATE pages
SET layout_id = (SELECT id FROM page_layouts WHERE name = 'default' LIMIT 1)
WHERE slug = 'home' AND layout_id IS NULL;

-- 10. Update existing hero section to reference hero template
UPDATE page_sections
SET template_id = (SELECT id FROM section_templates WHERE component_type = 'hero' LIMIT 1)
WHERE section_type = 'hero' AND template_id IS NULL;
