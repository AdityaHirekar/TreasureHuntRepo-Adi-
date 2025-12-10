import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

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
	}, []);

	return (
		<div className="check-page">
			<h1>Location Visited with Time</h1>
			<button onClick={pingBackend} hidden>
				Ping Backend
			</button>
			<table className="check-table">
				<thead>
					<tr>
						<th>Team ID</th>
						<th>Team Name</th>
						<th>Location</th>
						<th>Time</th>
					</tr>
				</thead>
				<tbody>
					{data.map((row) => (
						<tr key={row.key_id}> {/* Use unique key */}
							<td>{row.team_id}</td>
							<td>{row.team_name}</td>
							<td>{row.location}</td>
							<td>{row.time}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default Check;
