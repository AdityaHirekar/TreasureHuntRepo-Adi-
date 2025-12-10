-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE: teams
-- Replaces the old 'team_no' and 'setlocation' / 'verifylocation' logic with a unified table.
CREATE TABLE teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id TEXT UNIQUE NOT NULL, -- The user-facing ID (e.g. "TEAM-AX8")
    team_name TEXT NOT NULL,
    members TEXT[] NOT NULL, -- Array of member names
    assigned_location TEXT REFERENCES location(location_code), -- The target location they are looking for
    registered_device_id TEXT, -- The first device that scans successfully
    disqualified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE: scans
-- Logs every scan attempt for audit and scoring
CREATE TABLE scans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id TEXT REFERENCES teams(team_id),
    location_id TEXT, -- The location code scanned
    device_id TEXT NOT NULL,
    client_lat FLOAT,
    client_lng FLOAT,
    scan_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scan_result TEXT NOT NULL, -- 'SUCCESS', 'REJECTED', 'FAIL'
    flagged BOOLEAN DEFAULT FALSE,
    admin_note TEXT
);

-- TABLE: banned_devices
-- Blacklist for devices
CREATE TABLE banned_devices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_id TEXT UNIQUE NOT NULL,
    reason TEXT,
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_teams_device ON teams(registered_device_id);
CREATE INDEX idx_scans_team ON scans(team_id);
CREATE INDEX idx_scans_device ON scans(device_id);
