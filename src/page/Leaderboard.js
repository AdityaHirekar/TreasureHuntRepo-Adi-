import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config";
import "./Leaderboard.css";
import AnimatedPage from "../components/AnimatedPage";

const Leaderboard = () => {
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
        const interval = setInterval(fetchLeaderboard, 10000); // Auto-refresh every 10s
        return () => clearInterval(interval);
    }, []);

    // Helper to format duration if we wanted to show it, or just scan time
    // For now, sorting is done backend, we just display relative order.

    return (
        <AnimatedPage>
            <div className="leaderboard-page">
                <div className="leaderboard-container">
                    <motion.h1
                        className="leaderboard-title"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        🏆 Global Leaderboard 🏆
                    </motion.h1>

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
                                    key={index}
                                    className={`leaderboard-row ${index === 0 ? "first-place" : ""} ${index === 1 ? "second-place" : ""} ${index === 2 ? "third-place" : ""}`}
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
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
            </div>
        </AnimatedPage>
    );
};

export default Leaderboard;
