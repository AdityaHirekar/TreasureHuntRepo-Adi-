import React, { useState, useEffect } from "react";
import Scanner from "./Scanner";
import { API_BASE_URL } from "../config";
import "./Scan.css"; // Import the CSS file

const Scan = () => {
	const [scannedData, setScannedData] = useState("LOC01");
	const [teamId, setTeamId] = useState(localStorage.getItem("teamId") || "");
	const [isScannerOpen, setIsScannerOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [deviceId, setDeviceId] = useState("");

	const [disqualified, setDisqualified] = useState(false);

	// Initialize Device ID and Geolocation
	useEffect(() => {
		// 1. Device ID
		let storedDeviceId = localStorage.getItem("device_id");
		if (!storedDeviceId) {
			storedDeviceId = crypto.randomUUID();
			localStorage.setItem("device_id", storedDeviceId);
		}
		setDeviceId(storedDeviceId);

		// 2. Geolocation (Just prompting permission early)
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => console.log("Lat:", position.coords.latitude, "Lng:", position.coords.longitude),
				(err) => console.error("Geo Error:", err)
			);
		}

		// 3. Check Status on Load
		if (teamId) {
			fetch(`${API_BASE_URL}/team-status/${teamId}`)
				.then(res => res.json())
				.then(data => {
					if (data.disqualified) setDisqualified(true);
				})
				.catch(err => console.error(err));
		}
	}, [teamId]);

	// Mouse parallax effect
	useEffect(() => {
		const handleMouseMove = (e) => {
			const { clientX, clientY } = e;
			const { innerWidth, innerHeight } = window;
			const xPercent = (clientX / innerWidth - 0.5) * 2;
			const yPercent = (clientY / innerHeight - 0.5) * 2;
			const moveX = xPercent * 5;
			const moveY = yPercent * 5;
			document.body.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;
		};
		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	}, []);

	const handleScanData = (data) => {
		setScannedData(data);
		setIsScannerOpen(false);
	};

	const handleError = (error) => {
		console.error("Error:", error);
	};

	const openScanner = () => setIsScannerOpen(true);
	const closeScanner = () => setIsScannerOpen(false);

	const handleSendData = async (e) => {
		e.preventDefault();
		setMessage("Processing...");

		if (scannedData === "No result" || !teamId) {
			alert("Please provide both scanned data and Team ID.");
			return;
		}

		// Capture Geolocation NOW
		if (!("geolocation" in navigator)) {
			alert("Geolocation is required!");
			return;
		}

		navigator.geolocation.getCurrentPosition(async (position) => {
			const lat = position.coords.latitude;
			const lng = position.coords.longitude;

			try {
				const response = await fetch(`${API_BASE_URL}/scan`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						teamId: teamId,
						locationId: scannedData,
						deviceId: deviceId,
						lat: lat,
						lng: lng
					}),
				});
				const result = await response.json();

				if (response.ok) {
					if (result.result === "SUCCESS") {
						alert("🎉 Correct! " + result.message + "\nNext Location: " + result.nextLocation);
						setMessage("Success! Next: " + result.nextLocation);
					} else {
						alert("❌ " + result.message);
						setMessage(result.message);
					}
				} else {
					if (response.status === 403 && result.error.includes("Disqualified")) {
						setDisqualified(true); // TRIGGER RED SCREEN
					}
					alert("Error: " + result.error);
					setMessage("Error: " + result.error);
				}
			} catch (error) {
				console.error("Error sending data:", error);
				alert("Network Error");
			}
		}, (err) => {
			alert("Geolocation failed. Please allow location access.");
			console.error(err);
		});
	};

	const handleTeamIdChange = (e) => {
		setTeamId(e.target.value);
		localStorage.setItem("teamId", e.target.value);
	}

	if (disqualified) {
		return (
			<div className="main-wrapper" style={{ background: '#330000' }}>
				<div className="container" style={{ borderColor: 'red' }}>
					<h1 style={{ color: 'red', fontSize: '3rem' }}>DISQUALIFIED</h1>
					<p style={{ color: 'white', fontSize: '1.2rem' }}>
						Your team has been disqualified by the admin. <br />
						Please report to the control desk.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="main-wrapper">
			<h1 className="page-title">Track Run - Scan</h1>
			<div className="container">
				<form onSubmit={handleSendData}>
					{scannedData !== "No result" ? (
						<div className="success-message">
							Scanned: {scannedData} <br />
							<button type="button" onClick={openScanner} style={{ fontSize: '0.8rem', marginTop: '5px' }}>Rescan</button>
						</div>
					) : (
						<button className="scan-button" type="button" onClick={openScanner}>
							Scan QR
						</button>
					)}
					<br />
					<label>Team ID:</label>
					<input
						type="text"
						value={teamId}
						onChange={handleTeamIdChange}
						required
						placeholder="TEAM-XXXX"
					/>
					<br />
					<button className="send-button" type="submit">
						Submit
					</button>
				</form>
				{message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}
			</div>
			{isScannerOpen && (
				<div className="modal">
					<div className="modal-content">
						<button className="close-button" onClick={closeScanner}>
							Close
						</button>
						<Scanner onScanData={handleScanData} onError={handleError} />
					</div>
				</div>
			)}
		</div>
	);
};

export default Scan;


