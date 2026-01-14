# Backend API Documentation

The backend is built with Express.js and handles game logic, validation, and database interactions with Supabase.

**Base URL:** `http://localhost:5050` (Development)

## Authentication

Admin routes are protected. Currently, a simple token check is implemented.
**Header:** `Authorization: Bearer secret-admin-token-123`

## Endpoints

### Public / Game Endpoints

#### `POST /register`
Register a new team.
*   **Body:** `{ "teamName": "Firebolts", "members": ["Alice", "Bob"] }`
*   **Response:** `{ "message": "Registered", "teamId": "TEAM-XY12", ... }`

#### `POST /auth/login`
Admin login to retrieve access token.
*   **Body:** `{ "password": "admin-password" }`
*   **Response:** `{ "token": "..." }`

#### `POST /scan`
Core game loop. Handles QR scans, location validation, and progression.
*   **Body:**
    ```json
    {
      "teamId": "TEAM-ID",
      "locationId": "LOC-CODE",
      "deviceId": "Browser-Fingerprint-ID",
      "lat": 12.34,
      "lng": 56.78
    }
    ```
*   **Response:** success/fail status, next clue, or disqualification message.

#### `GET /team-status/:teamId`
Get current status of a team (disqualified state, current clue).
*   **Response:** `{ "disqualified": false, "currentClue": "..." }`

#### `GET /leaderboard`
Returns the current rankings.
*   **Response:** Array of teams sorted by score and time.

### Admin Endpoints

*   `GET /admin/teams`: List all teams.
*   `GET /admin/scans`: List all scan logs.
*   `GET /admin/locations`: List all game locations.
*   `PUT /admin/location`: Update coordinates for a location.
*   `POST /admin/disqualify`: Disqualify or Re-qualify a team.
*   `POST /admin/ban`: Ban a specific device ID.

## Database Schema (Supabase)

*   **teams**: Stores team info, progress, and current assigned location.
*   **scans**: Audit log of every QR scan attempt (Success, Fail, Rejected).
*   **location**: Master list of locations, coordinates, and hints.
*   **banned_devices**: List of device IDs that are blocked from scanning.
