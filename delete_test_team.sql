-- Delete scans for the team first (to prevent Foreign Key error)
-- You can change 'Team 1' to the actual name of the team if it's different.
-- Or use the team_id if you know it (e.g. 'TEAM-X5Y2')

DELETE FROM scans WHERE team_id IN (SELECT team_id FROM teams WHERE team_name = 'Team 1');

-- Now delete the team itself
DELETE FROM teams WHERE team_name = 'Team 1';

-- OPTIONAL: If you want to wipe ALL data to start fresh for the event:
-- DELETE FROM scans;
-- DELETE FROM teams;
