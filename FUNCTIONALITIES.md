# Treasure Hunt Application Functionalities

## 1. Player Experience

### A. Registration
*   **Team Creation:** Users can register a new team with a unique name.
*   **Member Management:** Users can add multiple team members during registration.
*   **Device Binding:** The first device used to register/login is "bound" to the team. Other devices cannot play for that team (Anti-Cheating).

### B. Game Flow (The Hunt)
*   **Clue System:** Players receive cryptic clues hinting at the next real-world location.
*   **QR Scanning:** Players verify they have reached a location by scanning a specific QR code.
*   **Location Validation:**
    *   **GPS Check:** The system verifies the user's physical GPS coordinates match the target location (within 25 meters).
    *   **Proximity Pointer:** A compass arrow points to the target location when the user is within 15 meters (Feature hidden until enabled).
*   **Progress Tracking:** Checks if the scanned QR code corresponds to the *current* assigned target.

### C. Feedback & Warnings
*   **Distance Warnings:** If a player scans from too far away, they get a "Too far check your warnings" message instead of a success.
*   **Wrong Location Warnings:** Scanning the wrong QR code results in a "Wrong Location" warning. Attempt counts are tracked.
*   **Disqualification (Soft):** The system issues warnings for repeated failures or GPS anomalies but allows gameplay to continue (previously hard disqualification).

### D. Winning
*   **Final Destination:** Scanning the final "Treasure" QR code triggers the Win logic.
*   **Leaderboard Entry:** The team's total time is recorded and they are placed on the leaderboard.

---

## 2. Admin Dashboard

### A. Authentication
*   **Secure Login:** Admin interface requires a password to access.

### B. Live Monitoring
*   **Team Status:** View all registered teams, their current assigned location, device binding status, and active/disqualified status.
*   **Live Scans Feed:** Real-time log of every scan attempt (Success, Fail, or Warning) with timestamps and details.
*   **Location Management:** View all game locations and their secret codes.

### C. Team Management
*   **View Members:** Expandable dropdown to see the names of all members in a team.
*   **Edit Progress:** Manually change a team's current target location (e.g., to skip a buggy level).
*   **Delete Team:** Permanently remove a team and their scan history from the database.
*   **Disqualify/Re-qualify:** Manually toggle a team's status if they are caught cheating or need to be reinstated.

### D. Analytics
*   **Leaderboard:** Built-in view of the top finishing teams sorted by completion time.

---

## 3. Technical Features
*   **Anti-Spoofing:** Validates GPS accuracy and checks for unrealistic jumps (basic implementation).
*   **Device Fingerprinting:** Ensures strictly one phone per team to prevent splitting up.
*   **Glassmorphism UI:** Modern, responsive design with neon accents and transparency effects.
