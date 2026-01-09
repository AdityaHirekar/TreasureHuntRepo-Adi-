import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config";
import "./Scan.css"; // Reuse existing styles for consistency
import AnimatedPage from "../components/AnimatedPage";

const Register = () => {
    const navigate = useNavigate();
    const [teamName, setTeamName] = useState("");
    const [members, setMembers] = useState(["", "", "", ""]);
    const [error, setError] = useState("");
    const [successData, setSuccessData] = useState(null);

    const handleMemberChange = (index, value) => {
        const newMembers = [...members];
        newMembers[index] = value;
        setMembers(newMembers);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        const validMembers = members.filter(m => m.trim() !== "");
        if (!teamName || validMembers.length < 1) {
            setError("Team Name and at least 1 member are required.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamName, members: validMembers }),
            });
            const data = await response.json();

            if (response.ok) {
                setSuccessData(data);
                // Optionally auto-save Team ID to local storage for convenience
                localStorage.setItem("teamId", data.teamId);
            } else {
                setError("Server Error: " + (data.error || "Registration failed."));
            }
        } catch (err) {
            setError("Network error: " + err.message + ". Check if backend is running.");
        }
    };

    if (successData) {
        return (
            <AnimatedPage>
                <div className="main-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <h1 className="page-title">Registration Complete</h1>
                    <div className="container">
                        <div className="success-message">
                            <h3>Team Registered!</h3>
                            <p><strong>Team ID:</strong> {successData.teamId}</p>
                            <p><strong>Assigned Location (Start):</strong> {successData.assignedLocation}</p>
                            <p className="note">Save your Team ID! You will need it to scan.</p>
                            <br />
                            <button className="scan-button" onClick={() => navigate("/scan")}>
                                Go to Scanner
                            </button>
                        </div>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="main-wrapper">
                <motion.h1
                    className="page-title"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    Team Registration
                </motion.h1>
                <motion.div
                    className="container"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <form onSubmit={handleRegister}>
                        <motion.label
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            Team Name:
                        </motion.label>
                        <motion.input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            required
                            placeholder="Enter Team Name"
                            whileFocus={{ scale: 1.02, borderColor: "var(--mv-primary)" }}
                            transition={{ type: "spring", stiffness: 300 }}
                        />

                        <motion.label
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Members:
                        </motion.label>
                        {members.map((member, index) => (
                            <motion.input
                                key={index}
                                type="text"
                                value={member}
                                onChange={(e) => handleMemberChange(index, e.target.value)}
                                placeholder={`Member ${index + 1}`}
                                style={{ marginBottom: '10px' }}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 + (index * 0.1) }}
                                whileFocus={{ scale: 1.02, borderColor: "var(--mv-primary)" }}
                            />
                        ))}

                        {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

                        <motion.button
                            className="send-button"
                            type="submit"
                            whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Register Team
                        </motion.button>

                    </form>
                </motion.div>
            </div>
        </AnimatedPage>
    );
};

export default Register;
