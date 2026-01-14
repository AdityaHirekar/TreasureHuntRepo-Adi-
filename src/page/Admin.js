import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config";
import "./Scan.css"; // Use the main theme
import "./AdminLogin.css"; // Import login styles
import "./Admin.css"; // Import admin specific styles
import AnimatedPage from "../components/AnimatedPage";
import { useToast } from "../components/ToastContext";
import Spinner from "../components/Spinner";
import { OpenLocationCode } from "open-location-code";
import Leaderboard from "./Leaderboard";

const Admin = () => {
	const { addToast } = useToast();
	const [token, setToken] = useState(localStorage.getItem("admin_token"));
	const [view, setView] = useState("teams"); // 'teams' or 'scans'
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);

	// Login State
	const [password, setPassword] = useState("");

	const [loginError, setLoginError] = useState("");

	// Edit Location State
	const [editingTeam, setEditingTeam] = useState(null);
	const [locationOptions, setLocationOptions] = useState([]);
	const [newLocationCode, setNewLocationCode] = useState("");

	// Auto-fetch on load/view switch (only if authenticated)
	useEffect(() => {
		if (token) {
			// Default view is teams, but we can check view state if needed
			if (view === 'teams') fetchTeams();
			else if (view === 'scans') fetchScans();
			else if (view === 'locations') fetchLocations();
		}
	}, [view, token]); // eslint-disable-line react-hooks/exhaustive-deps

	// Helper to get headers
	const getHeaders = () => {
		return {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token}`
		};
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoginError("");

		try {
			const res = await fetch(`${API_BASE_URL}/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password }),
			});

			const data = await res.json();

			if (res.ok) {
				localStorage.setItem("admin_token", data.token);
				setToken(data.token);
			} else {
				setLoginError("Access Denied: " + data.error);
				setPassword("");
			}
		} catch (err) {
			setLoginError("Server Connection Error");
		}
	};

	const fetchTeams = async () => {
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE_URL}/admin/teams`, { headers: getHeaders() });
			if (res.ok) {
				setData(await res.json());
			} else {
				if (res.status === 401 || res.status === 403) {
					localStorage.removeItem("admin_token");
					setToken(null);
				}
				const err = await res.json();
				addToast("Server Error: " + (err.error || res.status), 'error');
			}
		} catch (e) { addToast("Network Error: " + e.message, 'error'); }
		setLoading(false);
	};

	const fetchScans = async () => {
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE_URL}/admin/scans`, { headers: getHeaders() });
			if (res.ok) {
				setData(await res.json());
			} else {
				if (res.status === 401 || res.status === 403) {
					localStorage.removeItem("admin_token");
					setToken(null);
				}
				const err = await res.json();
				addToast("Server Error: " + (err.error || res.status), 'error');
			}
		} catch (e) { addToast("Network Error: " + e.message, 'error'); }
		setLoading(false);
	};

	const fetchLocations = async () => {
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE_URL}/admin/locations`, { headers: getHeaders() });
			if (res.ok) {
				setData(await res.json());
			} else {
				const err = await res.json();
				addToast("Error: " + (err.error || res.status), 'error');
			}
		} catch (e) { addToast("Network Error", 'error'); }
		setLoading(false);
	};

	const handleSetLocation = (locationCode) => {
		if (!navigator.geolocation) return addToast("GPS not supported", 'error');

		addToast("Acquiring high-accuracy GPS...", 'info');
		navigator.geolocation.getCurrentPosition(async (position) => {
			const lat = position.coords.latitude;
			const lng = position.coords.longitude;

			// Calculate Plus Code
			let plusCode = "";
			try {
				plusCode = OpenLocationCode.encode(lat, lng, 11); // 11 digits for high precision
				console.log("Calculated Plus Code:", plusCode);
			} catch (e) { console.error("Plus Code Error:", e); }

			try {
				const res = await fetch(`${API_BASE_URL}/admin/location`, {
					method: "PUT",
					headers: getHeaders(),
					body: JSON.stringify({ locationCode, lat, lng })
				});
				if (res.ok) {
					addToast(`Updated! Plus Code: ${plusCode}`, 'success');
					// Optional: We could try to update the location_code to be the plus code if the API supported it
					fetchLocations();
				} else {
					const err = await res.json();
					addToast("Update Failed: " + err.error, 'error');
				}
			} catch (e) { addToast("Network Error", 'error'); }
		}, (err) => {
			addToast("GPS Error: " + err.message, 'error');
		}, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
	};


	const loadLocationOptions = async () => {
		if (locationOptions.length > 0) return;
		try {
			const res = await fetch(`${API_BASE_URL}/admin/locations`, { headers: getHeaders() });
			if (res.ok) setLocationOptions(await res.json());
		} catch (e) { console.error(e); }
	};

	const startEditing = (team) => {
		setEditingTeam(team.team_id);
		setNewLocationCode(team.assigned_location);
		loadLocationOptions();
	};

	const saveLocation = async (teamId) => {
		try {
			const res = await fetch(`${API_BASE_URL}/admin/team/location`, {
				method: "PUT",
				headers: getHeaders(),
				body: JSON.stringify({ teamId, locationCode: newLocationCode })
			});
			if (res.ok) {
				addToast("Location Updated", 'success');
				setEditingTeam(null);
				fetchTeams();
			} else {
				const err = await res.json();
				addToast("Update Failed: " + err.error, 'error');
			}
		} catch (e) { addToast("Network Error", 'error'); }
	};

	const handleDisqualify = async (teamId, status) => {
		const action = status ? "DISQUALIFY" : "RE-QUALIFY";
		if (!window.confirm(`Are you sure you want to ${action} team ${teamId}?`)) return;
		try {
			const res = await fetch(`${API_BASE_URL}/admin/disqualify`, {
				method: "POST",
				headers: getHeaders(),
				body: JSON.stringify({ teamId, status })
			});
			if (res.ok) {
				addToast(`Team ${status ? "Disqualified" : "Re-qualified"}.`, 'success');
				fetchTeams(); // Refresh list
			} else {
				if (res.status === 401 || res.status === 403) {
					localStorage.removeItem("admin_token");
					setToken(null);
				}
				addToast("Error updating team status.", 'error');
			}
		} catch (e) {
			addToast("Network Error", 'error');
		}
	};

	if (!token) {
		return (
			<AnimatedPage>
				<div className="login-page">
					<motion.div
						className="login-container"
						initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
						animate={{ scale: 1, opacity: 1, rotateX: 0 }}
						transition={{ type: "spring", stiffness: 100, damping: 20 }}
					>
						<motion.h1
							className="login-title"
							initial={{ letterSpacing: "0px" }}
							animate={{ letterSpacing: "5px" }}
							transition={{ duration: 1, ease: "easeInOut" }}
						>
							Admin Access
						</motion.h1>
						<p className="login-subtitle">Restricted Area // Security Clearance Required</p>

						<form onSubmit={handleLogin} className="login-form">
							<motion.input
								type="password"
								placeholder="Enter Access Key"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="login-input"
								autoFocus
								whileFocus={{ scale: 1.05, boxShadow: "0 0 15px #ff006e" }}
							/>
							<motion.button
								type="submit"
								className="login-button"
								whileHover={{ scale: 1.05, backgroundColor: "#ff006e" }}
								whileTap={{ scale: 0.95 }}
							>
								Authenticate
							</motion.button>
						</form>

						{loginError && <motion.div className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>⚠️ {loginError}</motion.div>}
					</motion.div>
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
					style={{ marginBottom: '10px' }}
				>
					Admin Dashboard
				</motion.h1>
				<button
					onClick={() => { localStorage.removeItem("admin_token"); setToken(null); }}
					style={{
						background: 'transparent',
						border: '1px solid rgba(255,255,255,0.5)',
						color: 'white',
						padding: '5px 15px',
						cursor: 'pointer',
						margin: '0 auto 20px auto',
						display: 'block',
						borderRadius: '20px',
						fontSize: '0.9rem',
						opacity: 0.8
					}}
				>
					Logout
				</button>

				<div className="container" style={{ maxWidth: '800px', marginTop: '20px' }}>
					<div className="admin-nav-buttons">
						<motion.button
							className={`scan-button ${view === 'teams' ? 'active' : ''}`}
							onClick={() => setView('teams')}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							Teams
						</motion.button>
						<motion.button
							className={`scan-button ${view === 'scans' ? 'active' : ''}`}
							onClick={() => setView('scans')}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							Scans
						</motion.button>
						<motion.button
							className={`scan-button ${view === 'locations' ? 'active' : ''}`}
							onClick={() => setView('locations')}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							Locations
						</motion.button>
						<motion.button
							className={`scan-button ${view === 'leaderboard' ? 'active' : ''}`}
							onClick={() => setView('leaderboard')}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							Leaderboard
						</motion.button>
					</div>

					{view === 'leaderboard' ? (
						<Leaderboard isEmbedded={true} />
					) : loading ? <Spinner /> : (
						<div style={{
							textAlign: 'left',
							maxHeight: '600px',
							overflowY: 'auto',
							width: '100%',
							background: 'rgba(0,0,0,0.3)',
							padding: '10px',
							borderRadius: '10px'
						}}>
							{data.length === 0 && <p style={{ textAlign: 'center', opacity: 0.8, padding: '20px' }}>No records found.</p>}

							<AnimatePresence>
								{view === 'teams' && data.map((t, i) => (
									<motion.div
										key={t.id}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ delay: i * 0.05 }}
										style={{
											background: 'rgba(255,255,255,0.1)',
											padding: '15px',
											marginBottom: '10px',
											borderRadius: '8px',
											border: '1px solid rgba(255,255,255,0.1)',
										}}
										className="admin-list-item"
										whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
									>
										<div>
											<strong style={{ color: '#00ccff', fontSize: '1.2em' }}>{t.team_name}</strong>
											<span style={{ fontSize: '0.9em', opacity: 0.7, marginLeft: '10px' }}>({t.team_id})</span>
											<br />
											<div style={{ fontSize: '0.9em', marginTop: '5px', opacity: 0.9 }}>
												{editingTeam === t.team_id ? (
													<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
														<select
															value={newLocationCode}
															onChange={(e) => setNewLocationCode(e.target.value)}
															style={{ background: '#333', color: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '0.9em' }}
														>
															{locationOptions.map(l => (
																<option key={l.location_code} value={l.location_code}>{l.location_code}</option>
															))}
														</select>
														<button onClick={() => saveLocation(t.team_id)} style={{ background: 'transparent', border: '1px solid #00ff88', color: '#00ff88', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '0.8em' }}>💾</button>
														<button onClick={() => setEditingTeam(null)} style={{ background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', fontSize: '0.8em' }}>❌</button>
													</div>
												) : (
													<>
														Loc: <strong style={{ color: '#ffcc00' }}>{t.assigned_location}</strong>
														<button
															onClick={() => startEditing(t)}
															style={{
																background: 'transparent',
																border: 'none',
																color: '#ccc',
																marginLeft: '5px',
																cursor: 'pointer',
																fontSize: '1em',
																padding: '0 5px'
															}}
															title="Edit Location"
														>
															✏️
														</button> |
													</>
												)}
												Device: {t.registered_device_id ? <span style={{ color: '#99ff99' }}>Bound</span> : 'Unbound'} |
												Status: {t.disqualified ? <span style={{ color: '#ff4444' }}>DISQUALIFIED</span> : 'Active'}
											</div>
										</div>
										{!t.disqualified ? (
											<motion.button
												onClick={() => handleDisqualify(t.team_id, true)}
												className="action-button disconnect-btn"
												style={{
													fontSize: '0.8rem', padding: '5px 10px', width: 'auto', margin: 0
												}}
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
											>
												Disqualify
											</motion.button>
										) : (
											<motion.button
												onClick={() => handleDisqualify(t.team_id, false)}
												className="action-button connect-btn"
												style={{
													fontSize: '0.8rem', padding: '5px 10px', width: 'auto', margin: 0
												}}
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
											>
												Re-qualify
											</motion.button>
										)}
									</motion.div>
								))}

								{view === 'scans' && data.map((s, i) => (
									<motion.div
										key={s.id}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: i * 0.05 }}
										style={{
											background: 'rgba(255,255,255,0.1)',
											padding: '15px',
											marginBottom: '10px',
											borderRadius: '8px',
											border: '1px solid rgba(255,255,255,0.1)'
										}}
										whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
									>
										<strong style={{ color: '#ffaa00' }}>{s.team_id}</strong> @ {s.location_id} <br />
										Result: <span style={{ fontWeight: 'bold', color: s.scan_result === 'SUCCESS' ? '#99ff99' : '#ff4444' }}>{s.scan_result}</span>
										{s.admin_note && <span style={{ fontStyle: 'italic', marginLeft: '5px' }}>({s.admin_note})</span>} <br />
										<small style={{ opacity: 0.6 }}>{new Date(s.scan_time).toLocaleString()}</small>
									</motion.div>
								))}
								{view === 'locations' && data.map((l, i) => (
									<motion.div
										key={l.location_code}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: i * 0.05 }}
										style={{
											background: 'rgba(255,255,255,0.1)',
											padding: '15px',
											marginBottom: '10px',
											borderRadius: '8px',
											border: '1px solid rgba(255,255,255,0.1)',
											justifyContent: 'space-between',
											alignItems: 'center'
										}}
										className="admin-list-item"
									>
										<div>
											<strong style={{ color: '#ffcc00' }}>{l.location_name}</strong> <br />
											<span style={{ fontSize: '0.8em', fontFamily: 'monospace', opacity: 0.8 }}>{l.location_code}</span> <br />
											<div style={{ fontSize: '0.8em', marginTop: '5px' }}>
												{l.latitude ? (
													<span style={{ color: '#99ff99' }}>Coords Set: {parseFloat(l.latitude).toFixed(4)}, {parseFloat(l.longitude).toFixed(4)}</span>
												) : (
													<span style={{ color: '#ff4444' }}>Coords Not Set</span>
												)}
											</div>
										</div>
										<motion.button
											onClick={() => handleSetLocation(l.location_code)}
											style={{
												fontSize: '0.8rem', padding: '8px 12px', width: 'auto', margin: 0,
												color: '#000', fontWeight: 'bold'
											}}
											className="action-button set-location-btn"
											whileHover={{ scale: 1.1, boxShadow: '0 0 10px #00ccff' }}
											whileTap={{ scale: 0.9 }}
										>
											📍 Set Here
										</motion.button>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					)}
				</div>
			</div>
		</AnimatedPage >
	);
};

export default Admin;
