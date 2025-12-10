-- Ensure columns exist
ALTER TABLE location ADD COLUMN IF NOT EXISTS location_name TEXT;
ALTER TABLE location ADD COLUMN IF NOT EXISTS latitude FLOAT;
ALTER TABLE location ADD COLUMN IF NOT EXISTS longitude FLOAT;

-- Inserting Real Locations
-- Note: latitude and longitude are set to NULL initially. 
-- The strict GPS check will SKIP validation if these are null.
-- You must update them with real GPS coordinates later to enable anti-cheat for these spots.

INSERT INTO location (location_code, location_name, location_hint, latitude, longitude) VALUES
('LOC01', 'Museum', 'I guard the past with domes and halls,\nOld swords, coins, and painted walls.\nStep through my doors to travel time —\nWhere art and history meet in rhyme.', NULL, NULL),

('LOC02', 'Subway', 'Where travelers fuel up with petrol and haste,\nI stand nearby with a very different taste.\nLong loaves, stacked veggies, sauces lined neat —\nA pit stop where you refuel with something to eat.\nFind the door where bread rises while engines refill —\nTwo types of hunger satisfied at one downhill.', NULL, NULL),

('LOC03', 'Electric House', 'Where metal lines whisper and overhead wires glow,\nAnd buses wait in quiet rows before they go.\nOne sends power, one sends people on their way —\nFind the corner where light and travel share the same stay.\nHint: Power building beside a major bus point.', NULL, NULL),

('LOC04', 'Souled Store', 'Stories stitched in cotton threads,\nMemes, bands, dreams, and comic spreads.\nFind the store where fashion isn’t formal or plain —\nIt’s the place where your soul is printed again and again.', NULL, NULL),

('LOC05', 'Lion Gate', 'A roar guards this entry, where sailors once stride,\nA portside sentinel, proud with pride.\nBrass and might mark this naval domain,\nName the gate that bears a king of the plain.', NULL, NULL),

('LOC06', 'Westside', 'Trendy and bright with clothes to adore,\nStep inside and you’ll want more.\nA compass point, not left or right,\nFind this fashion store named after a direction bright.', NULL, NULL),

('LOC07', 'Mochi', 'Feet feel fancy after a walk here,\nFrom flats to heels, all styles appear.\nNot a sweet treat though it shares the same name,\nA shoe stop it is, not a dessert game.', NULL, NULL),

('LOC08', 'Lings Pavilion', 'Chinese flavours in a cozy hall,\nDumplings, noodles — you’ll want it all.\nAn Asian den with a family feel,\nA ‘pavilion’ where chopsticks seal the meal.', NULL, NULL),

('LOC09', 'Leopold Cafe', 'Founded by those from lands afar,\nNot for oil, yet once a bazaar.\nEchoes of conflict marked its walls,\nWhere resilience and spirit calls.\nIn a bustling street where cultures blend,\nTravelers and locals alike descend.\nA timeless refuge with vintage grace,\nGuess this café, a famous place.', NULL, NULL),

('LOC10', 'Study Centre', 'I’m measured in minutes, silent and true,\nMy hands chase down the time given to you.\nIn the centre I hang, steady and round,\nSolve fast — for minutes cannot be found.', NULL, NULL),

('LOC11', 'Taj Hotel', 'Born before India was free,\nMy arches whisper history.\nLuxury and legacy blend in my face —\nFind me where time stands still with grace.', NULL, NULL),

('LOC12', 'Radio Club', 'I stand at the edge where land meets tide,\nWatching yachts whisper as they glide.\nHistory behind me, waves ahead —\nFind the place where sea stories are read.', NULL, NULL),

('LOC13', 'Holy Name School', 'Behind quiet gates where the sea-winds sway,\nA century’s whisper walks through night and day.\nBlue and white stand tall in their rightful place,\nWhere countless children shaped their dreams with grace.\nA home of learning, honored by its own name —\nTell me, which school carries this sacred flame?', NULL, NULL)

ON CONFLICT (location_code) DO UPDATE 
SET location_hint = EXCLUDED.location_hint, 
    location_name = EXCLUDED.location_name;
