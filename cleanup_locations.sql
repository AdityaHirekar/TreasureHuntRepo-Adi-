-- Remove the old dummy entries (which had 3 digits like LOC001)
-- Only the new ones (LOC01, LOC02...) should remain.

-- Remove references from legacy tables first
DELETE FROM setlocation;
DELETE FROM verifylocation;

-- V2: Re-assign any teams currently on dummy locations to a valid one (LOC01)
-- so we don't have to delete the teams.
UPDATE teams SET assigned_location = 'LOC01' 
WHERE assigned_location IN ('LOC001', 'LOC002', 'LOC003', 'LOC004', 'LOC005', 'LOC1', 'LOC2', 'LOC3', 'LOC4', 'LOC5');

-- V2: Delete any scans that referenced the dummy locations
DELETE FROM scans 
WHERE location_id IN ('LOC001', 'LOC002', 'LOC003', 'LOC004', 'LOC005', 'LOC1', 'LOC2', 'LOC3', 'LOC4', 'LOC5');

-- Now safe to delete
DELETE FROM location WHERE location_code IN ('LOC001', 'LOC002', 'LOC003', 'LOC004', 'LOC005');

-- Also remove the single digit ones if they exist (from my very first dummy set)
DELETE FROM location WHERE location_code IN ('LOC1', 'LOC2', 'LOC3', 'LOC4', 'LOC5');
