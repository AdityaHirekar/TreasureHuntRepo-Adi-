import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./Scan.css"; // Reuse existing styles for consistency

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
            <div className="main-wrapper">
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
        );
    }

    return (
        <div className="main-wrapper">
            <h1 className="page-title">Team Registration</h1>
            <div className="container">
                <form onSubmit={handleRegister}>
                    <label>Team Name:</label>
                    <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                        placeholder="Enter Team Name"
                    />

                    <label>Members:</label>
                    {members.map((member, index) => (
                        <input
                            key={index}
                            type="text"
                            value={member}
                            onChange={(e) => handleMemberChange(index, e.target.value)}
                            placeholder={`Member ${index + 1}`}
                            style={{ marginBottom: '10px' }}
                        />
                    ))}

                    {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

                    <button className="send-button" type="submit">
                        Register Team
                    </button>

                </form>
            </div>
        </div>
    );
};

export default Register;
