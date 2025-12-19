import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../config";
import "./Check.css";
import AnimatedPage from "../components/AnimatedPage";

const Check = () => {
	const [data, setData] = useState([]);

	// Function to fetch registered data (Now fetching Public Scans)
	const fetchData = () => {
		fetch(`${API_BASE_URL}/public/scans`, {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => {
				// Map V2 scan data to the format Check.js expects
				const mappedData = data.map(scan => ({
					key_id: scan.id, // Internal unique ID for React key
					team_id: scan.team_id, // Display Team ID
					team_name: scan.teams?.team_name || "Unknown", // Use joined name
					location: scan.location_id,
					time: new Date(scan.scan_time).toLocaleTimeString()
				}));
				setData(mappedData);
			})
			.catch((error) => console.error("Error fetching data:", error));
	};

	// Function to ping the backend
	const pingBackend = () => {
		fetch(`${API_BASE_URL}/health`, {
			method: "GET",
		})
			.then((response) => response.json())
			.then((data) => {
				console.log("Ping successful:", data);
			})
			.catch((error) => console.error("Error pinging backend:", error));
	};

	useEffect(() => {
		// Fetch initial data
		fetchData();

		// Optional: Fetch data periodically as well (e.g., every 5 seconds)
		const dataIntervalId = setInterval(() => {
			fetchData();
		}, 5000);

		// Clean up intervals on component unmount
		return () => {
			clearInterval(dataIntervalId);
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<AnimatedPage>
			<div className="check-page">
				<motion.h1
					initial={{ y: -50, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					Location Visited with Time
				</motion.h1>
				<button onClick={pingBackend} hidden>
					Ping Backend
				</button>
				<motion.table
					className="check-table"
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.3, duration: 0.5 }}
				>
					<thead>
						<tr>
							<th>Team ID</th>
							<th>Team Name</th>
							<th>Location</th>
							<th>Time</th>
						</tr>
					</thead>
					<tbody>
						{data.map((row, index) => (
							<motion.tr
								key={row.key_id}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.1 * index }}
								whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
							>
								<td>{row.team_id}</td>
								<td>{row.team_name}</td>
								<td>{row.location}</td>
								<td>{row.time}</td>
							</motion.tr>
						))}
					</tbody>
				</motion.table>
			</div>
		</AnimatedPage>
	);
};

export default Check;
