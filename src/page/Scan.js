import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameModal from "../components/GameModal";
import Spinner from "../components/Spinner";
import Scanner from "./Scanner";
import { API_BASE_URL } from "../config";
import "./Scan.css"; // Import the CSS file
import AnimatedPage from "../components/AnimatedPage";
import { OpenLocationCode } from "open-location-code";
import { playSuccessSound, playErrorSound, vibrateSuccess, vibrateError } from "../utils/audio";


const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.2,
			delayChildren: 0.3
		}
	}
};

const itemVariants = {
	hidden: { y: 20, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: { type: "spring", stiffness: 100 }
	}
};

const Scan = () => {
	const ENABLE_COMPASS = false; // Set to true to enable Proximity Compass
	const [scannedData, setScannedData] = useState(null);
	const [teamId, setTeamId] = useState(localStorage.getItem("teamId") || "");
	const [isScannerOpen, setIsScannerOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [deviceId, setDeviceId] = useState("");

	const [disqualified, setDisqualified] = useState(false);
	const [banReason, setBanReason] = useState("");
	const [currentClue, setCurrentClue] = useState("");
	const [loading, setLoading] = useState(false);

	// Compass State
	const [targetCoords, setTargetCoords] = useState(null);
	const [heading, setHeading] = useState(0);
	const [myCoords, setMyCoords] = useState(null);
	const [distance, setDistance] = useState(null);
	const [showCompass, setShowCompass] = useState(false);

	const handleRequestPermission = () => {
		if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
			DeviceOrientationEvent.requestPermission()
				.then(permissionState => {
					if (permissionState === 'granted') {
						window.addEventListener('deviceorientation', handleOrientation);
					}
				})
				.catch(console.error);
		} else {
			window.addEventListener('deviceorientation', handleOrientation);
		}
	};

	const handleOrientation = (event) => {
		// webkitCompassHeading for iOS, alpha for Android
		let compass = event.webkitCompassHeading;
		if (!compass && event.alpha) {
			compass = Math.abs(event.alpha - 360);
		}
		setHeading(compass || 0);
	};

	useEffect(() => {
		// Watch setup if target exists and Feature is Enabled
		if (!ENABLE_COMPASS || !targetCoords) return;

		const watchId = navigator.geolocation.watchPosition(
			(pos) => {
				const { latitude, longitude } = pos.coords;
				setMyCoords({ lat: latitude, lng: longitude });

				const dist = getDistance(latitude, longitude, targetCoords.lat, targetCoords.lng);
				setDistance(dist);

				if (dist <= 15) { // 15m Range
					setShowCompass(true);
					// Auto-attach listener if possible
					if (!window.DeviceOrientationEvent?.requestPermission) {
						window.addEventListener('deviceorientation', handleOrientation);
					}
				} else {
					setShowCompass(false);
					window.removeEventListener('deviceorientation', handleOrientation);
				}
			},
			(err) => console.warn(err),
			{ enableHighAccuracy: true }
		);

		return () => {
			navigator.geolocation.clearWatch(watchId);
			window.removeEventListener('deviceorientation', handleOrientation);
		};
	}, [targetCoords, ENABLE_COMPASS]);


	const [secretTapCount, setSecretTapCount] = useState(0);

	// Modal State
	const [modalState, setModalState] = useState({
		isOpen: false,
		type: "SUCCESS", // SUCCESS, FAILURE, DISQUALIFIED, ERROR
		message: "",
		secondaryMessage: ""
	});

	// Fetch Team Status Helper
	const fetchTeamStatus = React.useCallback(() => {
		if (!teamId) return;
		fetch(`${API_BASE_URL}/team-status/${teamId}`)
			.then(res => res.json())
			.then(data => {
				if (data.disqualified) setDisqualified(true);
				if (data.currentClue) setCurrentClue(data.currentClue);
				if (data.targetCoords) setTargetCoords(data.targetCoords);
			})
			.catch(err => console.error(err));
	}, [teamId]);

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
				(err) => console.error("Geo Error:", err),
				{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
			);
		}

		// 3. Check Status on Load
		fetchTeamStatus();
	}, [teamId, fetchTeamStatus]);

	// Mouse parallax effect
	useEffect(() => {
		const handleMouseMove = (e) => {
			if (window.innerWidth < 768) return; // Disable parallax on mobile
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

	// GPS Pre-Check
	useEffect(() => {
		if (!("geolocation" in navigator)) {
			setModalState({
				isOpen: true,
				type: "ERROR",
				message: "GPS REQUIRED",
				secondaryMessage: "Your device does not support geolocation."
			});
			return;
		}

		navigator.geolocation.getCurrentPosition(
			() => { console.log("GPS Verified"); },
			(err) => {
				setModalState({
					isOpen: true,
					type: "FAILURE",
					message: "GPS DISABLED",
					secondaryMessage: "Please enable Location Services to play."
				});
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
		);
	}, []);

	const openScanner = () => setIsScannerOpen(true);
	const closeScanner = () => setIsScannerOpen(false);

	// Secret Logout: 10 taps on Team ID
	const handleSecretTap = () => {
		const newCount = secretTapCount + 1;
		setSecretTapCount(newCount);
		if (newCount >= 10) {
			if (window.confirm("DEBUG: Reset Session? (Device ID will be preserved)")) {
				const savedDeviceId = localStorage.getItem("device_id");
				localStorage.clear();
				if (savedDeviceId) {
					localStorage.setItem("device_id", savedDeviceId);
				}
				window.location.href = "/";
			} else {
				setSecretTapCount(0);
			}
		}
	};

	const handleSendData = async (e, dataOverride) => {
		if (e) e.preventDefault();
		const locCode = dataOverride || scannedData;
		// setMessage("Processing..."); // Removed text based message
		setLoading(true);

		if (!scannedData || !teamId) {
			setModalState({
				isOpen: true,
				type: "ERROR",
				message: "Scan Failed",
				secondaryMessage: "Missing data. Please rescan."
			});
			return;
		}

		// Capture Geolocation NOW
		if (!("geolocation" in navigator)) {
			setModalState({
				isOpen: true,
				type: "ERROR",
				message: "GPS Error",
				secondaryMessage: "Geolocation is required!"
			});
			return;
		}

		navigator.geolocation.getCurrentPosition(async (position) => {
			const lat = position.coords.latitude;
			const lng = position.coords.longitude;

			// Client-Side Plus Code Generation
			let userPlusCode = "";
			try {
				userPlusCode = OpenLocationCode.encode(lat, lng);
				console.log("User Plus Code:", userPlusCode);
			} catch (e) { console.error(e); }

			try {
				const response = await fetch(`${API_BASE_URL}/scan`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						teamId: teamId,
						locationId: scannedData,
						deviceId: deviceId,
						lat: lat,
						lng: lng,
						userPlusCode: userPlusCode // Send the code!
					}),
				});
				const result = await response.json();

				if (response.ok) {
					if (result.result === "SUCCESS" || result.result === "WINNER" || result.result === "RANK") {
						setModalState({
							isOpen: true,
							type: result.result === "WINNER" ? "WINNER" : result.result === "RANK" ? "RANK" : "SUCCESS",
							message: result.message,
							secondaryMessage: result.nextClue || "Clue Restricted. Contact HQ."
						});
						// Update persistent clue via server sync to ensure consistency
						if (result.nextClue) setCurrentClue(result.nextClue);
						fetchTeamStatus();
						setMessage(`Location Verified: ${userPlusCode}`);
						playSuccessSound();
						vibrateSuccess();
					} else {
						// Wrong Location / Failed Logic
						setModalState({
							isOpen: true,
							type: "FAILURE",
							message: result.message,
							secondaryMessage: "Target Mismatch. Check your clues."
						});
						setMessage(`Wrong Location: ${userPlusCode}`);
						playErrorSound();
						vibrateError();
					}
				} else {
					playErrorSound();
					vibrateError();
					if (response.status === 403 && result.error.includes("Disqualified")) {
						setDisqualified(true);
						setBanReason(result.error);
						setModalState({
							isOpen: true,
							type: "DISQUALIFIED",
							message: "CHEATING DETECTED",
							secondaryMessage: result.error
						});
					} else {
						setModalState({
							isOpen: true,
							type: "ERROR",
							message: "Error",
							secondaryMessage: result.error
						});
					}
					setMessage("Error: " + result.error);
				}
			} catch (error) {
				console.error("Error sending data:", error);
				playErrorSound();
				vibrateError();
				setModalState({
					isOpen: true,
					type: "ERROR",
					message: "Network Error",
					secondaryMessage: "Could not reach HQ server."
				});
			} finally {
				setLoading(false);
			}
		}, (err) => {
			setModalState({
				isOpen: true,
				type: "ERROR",
				message: "GPS Error",
				secondaryMessage: "Geolocation failed. Please allow location access."
			});
			console.error(err);
		}, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
	};

	// const handleTeamIdChange = (e) => {
	// 	setTeamId(e.target.value);
	// 	localStorage.setItem("teamId", e.target.value);
	// }

	const [inputTeamName, setInputTeamName] = useState("");

	const handleLoginSubmit = async (e) => {
		e.preventDefault();
		setMessage("");

		try {
			const response = await fetch(`${API_BASE_URL}/api/get-team-id`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ teamName: inputTeamName })
			});
			const data = await response.json();

			if (response.ok) {
				setTeamId(data.teamId);
				localStorage.setItem("teamId", data.teamId);
				localStorage.setItem("teamName", data.teamName);
				window.location.reload(); // Force reload to ensure UI updates correctly
			} else {
				setMessage("Login Error: " + (data.error || "Team not found"));
			}
		} catch (err) {
			setMessage("Network Error: Could not verify team name.");
		}
	};

	if (disqualified) {
		return (
			<div className="main-wrapper" style={{ background: '#330000' }}>
				<motion.div
					className="container"
					style={{ borderColor: 'red' }}
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ type: "spring", stiffness: 200, damping: 10 }}
				>
					<h1 style={{ color: 'red', fontSize: 'min(3rem, 10vw)', overflowWrap: 'break-word' }}>DISQUALIFIED</h1>
					<p style={{ color: 'white', fontSize: '1.2rem', margin: '20px 0', wordWrap: 'break-word', maxWidth: '100%' }}>
						{banReason || "Your team has been disqualified by the admin."}
						<br />
						<span style={{ fontSize: '0.9em', color: '#ffaaaa' }}>Please report to the control desk.</span>
					</p>
				</motion.div>
			</div>
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
					Track Run - Scan
				</motion.h1>
				<motion.div
					className="container"
					variants={containerVariants}
					initial="hidden"
					animate="visible"
				>
					{!teamId ? (
						<form onSubmit={handleLoginSubmit}>
							<AnimatePresence mode="wait">
								{/* Scan Button Hidden during Login Phase */}
							</AnimatePresence>
							<br />
							<motion.label
								variants={itemVariants}
								onClick={handleSecretTap}
								style={{ cursor: 'pointer', userSelect: 'none' }}
							>
								Enter Team Name:
							</motion.label>
							<motion.input
								variants={itemVariants}
								type="text"
								value={inputTeamName}
								onChange={(e) => setInputTeamName(e.target.value)}
								required
								placeholder="e.g. The Hunters"
								whileFocus={{ scale: 1.02, borderColor: "var(--mv-primary)", boxShadow: "0 0 15px var(--mv-primary)" }}
							/>
							<br />
							<motion.button
								className="send-button"
								type="submit"
								variants={itemVariants}
								whileHover={{ scale: 1.05, filter: "brightness(1.2)" }}
								whileTap={{ scale: 0.95 }}
							>
								Start Hunt
							</motion.button>
						</form>
					) : (
						<form onSubmit={handleSendData}>
							<AnimatePresence mode="wait">
								{scannedData ? (
									<motion.div
										key="success"
										className="success-message"
										initial={{ scale: 0.5, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0.5, opacity: 0 }}
									>
										<p style={{ fontSize: '0.9em', marginTop: '10px' }}>Code Scanned: <strong style={{ color: 'var(--mv-primary)' }}>{scannedData}</strong></p>
										<div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
											<motion.button
												type="button"
												onClick={openScanner}
												style={{
													flex: 1,
													background: 'rgba(255, 255, 255, 0.1)',
													border: '1px solid rgba(255, 255, 255, 0.3)',
													color: 'white',
													padding: '12px 20px',
													borderRadius: '12px',
													fontSize: '0.9rem',
													cursor: 'pointer',
													backdropFilter: 'blur(5px)'
												}}
												whileHover={{ scale: 1.05, background: 'rgba(255, 255, 255, 0.2)' }}
												whileTap={{ scale: 0.95 }}
											>
												Rescan
											</motion.button>
											<motion.button
												type="submit"
												style={{
													flex: 1,
													background: 'var(--mv-primary)',
													border: 'none',
													color: 'black',
													padding: '12px 20px',
													borderRadius: '12px',
													fontSize: '0.9rem',
													fontWeight: 'bold',
													cursor: 'pointer',
													boxShadow: '0 0 15px rgba(0, 217, 255, 0.4)'
												}}
												whileHover={{ scale: 1.05, boxShadow: '0 0 25px var(--mv-primary)' }}
												whileTap={{ scale: 0.95 }}
											>
												Verify
											</motion.button>
										</div>
									</motion.div>
								) : (
									<motion.button
										key="scan-btn"
										className="scan-button"
										type="button"
										onClick={openScanner}
										variants={itemVariants}
										animate={{
											boxShadow: ["0 0 10px rgba(0, 217, 255, 0.2)", "0 0 25px rgba(0, 217, 255, 0.6)", "0 0 10px rgba(0, 217, 255, 0.2)"],
											scale: [1, 1.02, 1]
										}}
										transition={{
											boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
											scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
										}}
										whileHover={{ scale: 1.05, boxShadow: "0 0 35px var(--mv-primary)" }}
										whileTap={{ scale: 0.95 }}
									>
										Scan QR
									</motion.button>
								)}
							</AnimatePresence>
							<br />
							<div
								style={{ marginTop: '20px', fontSize: '0.9em', color: '#aaa', userSelect: 'none', cursor: 'default' }}
								onClick={handleSecretTap}
							>
								Playing as: <strong style={{ color: 'var(--mv-primary)' }}>{localStorage.getItem("teamName") || teamId}</strong>
							</div>
						</form>
					)}
					{message && (
						<motion.p
							style={{ marginTop: '20px', fontWeight: 'bold' }}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
						>
							{message}
						</motion.p>
					)}

					{/* Loading Spinner */}
					{loading && <Spinner />}

					{/* Persistent Clue Dashboard */}
					{!loading && currentClue && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							style={{
								marginTop: '20px',
								background: 'rgba(0, 0, 0, 0.6)', // Darker background for readability
								border: '1px solid var(--mv-primary)',
								borderRadius: '15px',
								padding: '15px',
								width: '95%', // Wider on mobile
								maxWidth: '400px', // Cap on desktop
								marginLeft: 'auto',
								marginRight: 'auto',
								boxShadow: '0 0 15px rgba(0, 255, 136, 0.15)',
								backdropFilter: 'blur(5px)'
							}}
						>
							<h3 style={{ color: 'var(--mv-primary)', marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Current Objective</h3>
							<p style={{ color: '#fff', fontSize: '1rem', lineHeight: '1.4', wordWrap: 'break-word' }}>{currentClue}</p>
						</motion.div>
					)}

					{/* Proximity Compass (Backpocket: Enable via ENABLE_COMPASS flag) */}
					{ENABLE_COMPASS && showCompass && myCoords && targetCoords && (
						<motion.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							className="compass-wrapper"
							style={{ margin: "20px 0", textAlign: "center", position: "relative", zIndex: 10 }}
						>
							<div style={{ color: "#00fff2", fontWeight: "bold", marginBottom: "10px", textShadow: "0 0 10px #00fff2" }}>
								NEARBY: {Math.round(distance)}m
							</div>

							<div style={{
								fontSize: "4rem",
								color: "#00fff2",
								transform: `rotate(${getBearing(myCoords.lat, myCoords.lng, targetCoords.lat, targetCoords.lng) - heading}deg)`,
								transition: "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
								display: "inline-block",
								filter: "drop-shadow(0 0 15px #00fff2)"
							}}>
								➤
							</div>

							{typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function' && (
								<div style={{ marginTop: "10px" }}>
									<button type="button" onClick={handleRequestPermission} style={{
										background: "rgba(0,0,0,0.5)",
										border: "1px solid rgba(0, 255, 242, 0.3)",
										color: "#00fff2",
										fontSize: "0.7rem",
										padding: "4px 8px",
										borderRadius: "4px",
										cursor: "pointer"
									}}>
										Enable Compass
									</button>
								</div>
							)}
						</motion.div>
					)}
				</motion.div>
				<AnimatePresence>
					{isScannerOpen && (
						<motion.div
							className="modal"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							<motion.div
								className="modal-content"
								initial={{ scale: 0.5, y: 100, opacity: 0 }}
								animate={{ scale: 1, y: 0, opacity: 1 }}
								exit={{ scale: 0.5, y: 100, opacity: 0 }}
								transition={{
									type: window.innerWidth < 768 ? "tween" : "spring",
									stiffness: 300,
									damping: 25,
									ease: "easeOut",
									duration: window.innerWidth < 768 ? 0.3 : undefined
								}}
							>
								<motion.button
									className="close-button"
									onClick={closeScanner}
									whileHover={{ scale: 1.1, backgroundColor: "#ff4d4d", color: "white" }}
									whileTap={{ scale: 0.9 }}
								>
									Close
								</motion.button>
								<Scanner onScanData={handleScanData} onError={handleError} />
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<GameModal
				isOpen={modalState.isOpen}
				onClose={() => {
					setModalState({ ...modalState, isOpen: false });
					if (modalState.type === 'SUCCESS') setScannedData(null);
				}}
				type={modalState.type}
				message={modalState.message}
				secondaryMessage={modalState.secondaryMessage}
			/>
		</AnimatedPage >
	);
};

export default Scan;

// Helper for Bearing
function getBearing(startLat, startLng, destLat, destLng) {
	const toRad = (deg) => deg * Math.PI / 180;
	const toDeg = (rad) => rad * 180 / Math.PI;

	const y = Math.sin(toRad(destLng - startLng)) * Math.cos(toRad(destLat));
	const x = Math.cos(toRad(startLat)) * Math.sin(toRad(destLat)) -
		Math.sin(toRad(startLat)) * Math.cos(toRad(destLat)) * Math.cos(toRad(destLng - startLng));
	const brng = toDeg(Math.atan2(y, x));
	return (brng + 360) % 360;
}

// Helper for Distance
function getDistance(lat1, lon1, lat2, lon2) {
	const R = 6371e3; // metres
	const φ1 = lat1 * Math.PI / 180;
	const φ2 = lat2 * Math.PI / 180;
	const Δφ = (lat2 - lat1) * Math.PI / 180;
	const Δλ = (lon2 - lon1) * Math.PI / 180;

	const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
		Math.cos(φ1) * Math.cos(φ2) *
		Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
}


