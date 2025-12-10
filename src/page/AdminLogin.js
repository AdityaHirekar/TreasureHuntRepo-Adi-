import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./AdminLogin.css";

const AdminLogin = () => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Save token
                localStorage.setItem("admin_token", data.token);
                // Redirect to Admin Dashboard
                navigate("/admin");
            } else {
                setError("Access Denied: " + data.error);
                setPassword("");
            }
        } catch (err) {
            setError("Server Connection Error");
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h1 className="login-title">Admin Access</h1>
                <p className="login-subtitle">Restricted Area // Security Clearance Required</p>

                <form onSubmit={handleLogin} className="login-form">
                    <input
                        type="password"
                        placeholder="Enter Access Key"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="login-input"
                        autoFocus
                    />
                    <button type="submit" className="login-button">
                        Authenticate
                    </button>
                </form>

                {error && <div className="error-message">⚠️ {error}</div>}
            </div>
        </div>
    );
};

export default AdminLogin;
