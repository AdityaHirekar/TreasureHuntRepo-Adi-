import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import "./Status.css";

const Status = () => {
    const [status, setStatus] = useState("CHECKING"); // CHECKING, ONLINE, OFFLINE
    const [details, setDetails] = useState(null);
    const [lastChecked, setLastChecked] = useState(null);

    const checkHealth = async () => {
        setStatus("CHECKING");
        try {
            const res = await fetch(`${API_BASE_URL}/health`);
            if (res.ok) {
                const data = await res.json();
                setStatus("ONLINE");
                setDetails(data);
            } else {
                setStatus("OFFLINE");
                setDetails({ error: `Status: ${res.status}` });
            }
        } catch (e) {
            setStatus("OFFLINE");
            setDetails({ error: e.message });
        }
        setLastChecked(new Date());
    };

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 5000); // Check every 5s
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="status-page">
            <div className="status-container">
                <h1 className="status-title">System Status</h1>

                <div className={`status-indicator ${status.toLowerCase()}`}>
                    <div className="pulse-ring"></div>
                    <div className="status-icon">
                        {status === "ONLINE" ? "✔" : status === "OFFLINE" ? "✖" : "..."}
                    </div>
                </div>

                <h2 className={`status-text ${status.toLowerCase()}`}>
                    {status === "CHECKING" ? "Checking Server..." :
                        status === "ONLINE" ? "ALL SYSTEMS OPERATIONAL" :
                            "SYSTEM CRITICAL"}
                </h2>

                {details && (
                    <div className="status-details">
                        <p><strong>Database:</strong> {details.database || "Unknown"}</p>
                        <p><strong>Server:</strong> {details.server || "Unknown"}</p>
                        {details.error && <p className="error-msg">Error: {details.error}</p>}
                    </div>
                )}

                <div className="last-checked">
                    Last Updated: {lastChecked ? lastChecked.toLocaleTimeString() : "Never"}
                </div>

                <button className="refresh-btn" onClick={checkHealth}>
                    Refresh Now
                </button>
            </div>
        </div>
    );
};

export default Status;
