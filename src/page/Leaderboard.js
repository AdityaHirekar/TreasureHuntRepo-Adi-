import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config";
import "./Leaderboard.css";
import AnimatedPage from "../components/AnimatedPage";

const Leaderboard = ({ isEmbedded = false }) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/leaderboard`);
            if (!res.ok) throw new Error("Failed to fetch leaderboard");
            const data = await res.json();
            setTeams(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 3000); // Auto-refresh every 3s for live updates
        return () => clearInterval(interval);
    }, []);

    // Helper to format duration if we wanted to show it, or just scan time
    // For now, sorting is done backend, we just display relative order.

    const content = (
        <div className={`leaderboard-container ${isEmbedded ? 'leaderboard-embedded' : ''}`}>
            {!isEmbedded && (
                <motion.h1
                    className="leaderboard-title"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    Leaderboard
                </motion.h1>
            )}

            {loading && <div className="loading-spinner">Loading rankings...</div>}
            {error && <div className="error-msg">{error}</div>}

            {!loading && !error && (
                <div className="leaderboard-list">
                    <div className="leaderboard-header">
                        <span>Rank</span>
                        <span>Team</span>
                        <span>Locations</span>
                        <span>Status</span>
                    </div>

                    {teams.map((team, index) => (
                        <motion.div
                            layout
                            key={team.team_id} // Key must be unique ID for layout animation
                            className={`leaderboard-row ${index === 0 ? "first-place" : ""} ${index === 1 ? "second-place" : ""} ${index === 2 ? "third-place" : ""}`}
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                                layout: { type: "spring", stiffness: 45, damping: 15 },
                                opacity: { duration: 0.2 }
                            }}
                        >
                            <span className="rank">
                                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                            </span>
                            <span className="team-name">{team.team_name}</span>
                            <span className="score">{team.score} / 5</span>
                            <span className="status">
                                {team.score >= 5 ? "COMPLETED" : "In Progress"}
                            </span>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );

    if (isEmbedded) {
        return content;
    }

    return (
        <AnimatedPage>
            <div className="leaderboard-page">
                {content}
            </div>
        </AnimatedPage>
    );
};

export default Leaderboard;
