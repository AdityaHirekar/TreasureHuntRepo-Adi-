-- Seed data for team testing
-- 1. Create a Team
INSERT INTO team_no (team, member1, member2) VALUES
('Team1', 'Alice', 'Bob');

-- 2. Assign a Path (Using locations we already seeded)
-- Note: 'CLG' is the starting point code hardcoded in your app
INSERT INTO setlocation (team, start, location1, location2, location3, location4, location5, "end") VALUES
('Team1', 'CLG', 'LOC001', 'LOC002', 'LOC003', 'LOC004', 'LOC005', 'CLG');

-- 3. Initialize Verification Status
INSERT INTO verifylocation (team, start, start_time) VALUES
('Team1', NULL, NULL); 
-- Note: start is NULL initially until they scan the first code, or 'CLG' if they have started.
-- Based on your code logic: if (!verifylocationData.start) -> it checks if qrData === setlocationData.start ('CLG')
-- But wait, your code says: if (qrData === setlocationData.start)
-- setlocationData.start is 'CLG'.
-- So if we want to test the FIRST location (LOC001), they must have already verified 'start' (CLG).

-- Let's set it up so they have already "started" at College (CLG) and are looking for location1 (LOC001)
UPDATE verifylocation 
SET start = 'CLG', start_time = NOW() 
WHERE team = 'Team1';
