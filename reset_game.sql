-- Reset Team1 to the beginning
UPDATE verifylocation
SET 
  start = 'CLG',
  start_time = NOW(),
  location1 = NULL, location1_time = NULL,
  location2 = NULL, location2_time = NULL,
  location3 = NULL, location3_time = NULL,
  location4 = NULL, location4_time = NULL,
  location5 = NULL, location5_time = NULL,
  "end" = NULL
WHERE team = 'Team1';
