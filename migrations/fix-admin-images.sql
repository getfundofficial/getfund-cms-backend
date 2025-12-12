-- Fix historical administrator image URLs to use correct paths
-- Run this script to update existing records in the database

UPDATE team_members
SET image_url = '/images/board/s8507362-member1.jpg'
WHERE name = 'Mr. Fosubua Banahene' AND role = 'historical_admin';

UPDATE team_members
SET image_url = '/images/board/s8507358-member2.jpg'
WHERE name = 'Mr. Sam Garbah' AND role = 'historical_admin';

UPDATE team_members
SET image_url = '/images/board/s8507356-member3.jpg'
WHERE name = 'Dr. Richard A Boadu' AND role = 'historical_admin';

UPDATE team_members
SET image_url = '/images/board/s8507353-member4.jpg'
WHERE name = 'Mr. Paul Adjei' AND role = 'historical_admin';
