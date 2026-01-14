# Treasure Hunt Game

A geolocation-based Treasure Hunt application built with React, Node.js (Express), and Supabase. Players form teams, scan QR codes at real-world locations, solve clues, and race to finish the course.

## 🚀 Features

*   **Real-time Geolocation Checks:** Verifies player position against target coordinates.
*   **QR Code Scanning:** Players scan codes to "check in" at locations.
*   **Team Management:** Register teams and track progress.
*   **Dynamic Clues:** Clues are served based on the team's current status.
*   **Admin Dashboard:** Monitor teams, manage locations, and disqualify cheaters.
*   **Leaderboard:** Live ranking of teams based on completion time and score.

## 🛠 Technology Stack

*   **Frontend:** React (Create React App), `react-router-dom`, `framer-motion` (animations).
*   **Backend:** Node.js, Express.js.
*   **Database:** Supabase (PostgreSQL).
*   **Libraries:** `jsqr`, `react-qr-reader` (QR scanning), `open-location-code`.

## ⚙️ Setup and Installation

### Prerequisites

*   Node.js (v14 or higher)
*   npm
*   A Supabase project

### Environment Variables

Create a `.env` file in the root directory (or `src/backend/.env` for the server if running separately, though the project root is common for monorepo-lite setups).

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5050
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (src/backend/.env)**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
ADMIN_PASSWORD=your_admin_password
```

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/treasure-hunt.git
    cd treasure-hunt
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## 🏃 Usage

### Running the Application

1.  **Start the Backend Server:**
    The backend allows the frontend to interact with the database securely.
    ```bash
    node src/backend/server.js
    ```
    *Server runs on port 5050 by default.*

2.  **Start the React Frontend:**
    In a new terminal:
    ```bash
    npm start
    ```
    *App runs on http://localhost:3000.*

### How to Play

1.  **Register:** Admin registers a team on the default page or `/register`.
2.  **Start:** The team receives their first Clue.
3.  **Hunt:** Go to the location described by the clue.
4.  **Scan:** Find the QR code at the location and scan it using the app.
5.  **Progress:** If correct, get the next clue. If wrong, get a warning (3 strikes = Disqualified).
6.  **Win:** Complete 5 locations to finish.

## 📚 Documentation

*   **[Backend API](BACKEND.md):** Detailed API documentation.
*   **[Contributing](CONTRIBUTING.md):** Guidelines for developers.
