import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config";
import "./Status.css";
import AnimatedPage from "../components/AnimatedPage";

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
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <AnimatedPage>
            <div className="status-page">
                <div className="status-container">
                    <motion.h1
                        className="status-title"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        System Status
                    </motion.h1>

                    <motion.div
                        className={`status-indicator ${status.toLowerCase()}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                    >
                        <div className="pulse-ring"></div>
                        <div className="status-icon">
                            {status === "ONLINE" ? "✔" : status === "OFFLINE" ? "✖" : "..."}
                        </div>
                    </motion.div>

                    <motion.h2
                        className={`status-text ${status.toLowerCase()}`}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {status === "CHECKING" ? "Checking Server..." :
                            status === "ONLINE" ? "ALL SYSTEMS OPERATIONAL" :
                                "SYSTEM CRITICAL"}
                    </motion.h2>

                    {details && (
                        <motion.div
                            className="status-details"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                        >
                            <p><strong>Database:</strong> {details.database || "Unknown"}</p>
                            <p><strong>Server:</strong> {details.server || "Unknown"}</p>
                            {details.error && <p className="error-msg">Error: {details.error}</p>}
                        </motion.div>
                    )}

                    <div className="last-checked">
                        Last Updated: {lastChecked ? lastChecked.toLocaleTimeString() : "Never"}
                    </div>

                    <motion.button
                        className="refresh-btn"
                        onClick={checkHealth}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        Refresh Now
                    </motion.button>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default Status;
