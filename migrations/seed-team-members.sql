-- Seed initial team members data
-- Note: Replace image URLs with actual paths after uploading images

-- Board Chairman
INSERT INTO team_members (name, title, role, image_url, bio, display_order, status) VALUES
(
  'Hon. Emmanuel K. Bedzrah',
  'Board Chairman',
  'board_chairman',
  '/images/about/chairman.jpg',
  '<p class="mb-4">Hon. Emmanuel K. Bedzrah brings extensive experience in public service and educational policy to his role as Board Chairman of GETFund.</p>

<h3 class="text-xl font-bold text-gray-900 mb-3 mt-6">Background</h3>
<p class="mb-4">With a distinguished career in public administration and a deep commitment to educational development, Hon. Bedzrah has been instrumental in shaping GETFund''s strategic direction.</p>

<h3 class="text-xl font-bold text-gray-900 mb-3 mt-6">Vision</h3>
<p class="mb-4">Under his leadership, the Board continues to prioritize transparency, accountability, and innovative approaches to educational financing that ensure every Ghanaian child has access to quality education.</p>

<h3 class="text-xl font-bold text-gray-900 mb-3 mt-6">Key Achievements</h3>
<ul class="space-y-2 mb-4">
  <li class="flex items-start gap-2">
    <span class="text-getfund-primary font-bold">•</span>
    <span>Strengthened governance frameworks for increased accountability</span>
  </li>
  <li class="flex items-start gap-2">
    <span class="text-getfund-primary font-bold">•</span>
    <span>Expanded partnerships with educational institutions nationwide</span>
  </li>
  <li class="flex items-start gap-2">
    <span class="text-getfund-primary font-bold">•</span>
    <span>Championed initiatives for infrastructure development in underserved areas</span>
  </li>
</ul>',
  1,
  'active'
);

-- Management Team
INSERT INTO team_members (name, title, role, image_url, display_order, status) VALUES
('Mr. Paul Adjei', 'Administrator', 'management', '/images/about/paul-adjei.jpg', 1, 'active'),
('Hon. Alhassan S. Dandaawa', 'Deputy Administrator', 'management', '/images/about/alhassan-dandaawa.jpg', 2, 'active'),
('Mr. Alexis K. Asuinura', 'Financial Controller', 'management', '/images/about/alexis-asuinura.jpg', 3, 'active');

-- Historical Administrators
INSERT INTO team_members (name, title, role, image_url, date_range, display_order, status) VALUES
('Mr. Fosubua Banahene', 'Administrator', 'historical_admin', '/images/board/s8507362-member1.jpg', '2001-2009', 1, 'active'),
('Mr. Sam Garbah', 'Administrator', 'historical_admin', '/images/board/s8507358-member2.jpg', '2009-2017', 2, 'active'),
('Dr. Richard A Boadu', 'Administrator', 'historical_admin', '/images/board/s8507356-member3.jpg', '2017-2024', 3, 'active'),
('Mr. Paul Adjei', 'Administrator', 'historical_admin', '/images/board/s8507353-member4.jpg', '2025-Date', 4, 'active');
