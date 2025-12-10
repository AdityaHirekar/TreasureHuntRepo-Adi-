-- Add Geolocation columns to location table
ALTER TABLE location ADD COLUMN latitude FLOAT;
ALTER TABLE location ADD COLUMN longitude FLOAT;

-- Seed some dummy coordinates for testing (You should update these with real values later!)
-- Example: Using a generic coordinate (e.g., center of a campus)
-- LOC1
UPDATE location SET latitude = 12.9716, longitude = 77.5946 WHERE location_code = 'LOC1';
-- LOC2
UPDATE location SET latitude = 12.9717, longitude = 77.5947 WHERE location_code = 'LOC2';
-- LOC3
UPDATE location SET latitude = 12.9718, longitude = 77.5948 WHERE location_code = 'LOC3';
-- LOC4
UPDATE location SET latitude = 12.9719, longitude = 77.5949 WHERE location_code = 'LOC4';
-- LOC5
UPDATE location SET latitude = 12.9720, longitude = 77.5950 WHERE location_code = 'LOC5';

-- Add column to Scans to record distance logic result for debugging
ALTER TABLE scans ADD COLUMN distance_check_meters FLOAT;
