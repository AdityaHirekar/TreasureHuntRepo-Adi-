import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config";
import "./Scan.css"; // Use the main theme
import "./AdminLogin.css"; // Import login styles
import AnimatedPage from "../components/AnimatedPage";

const Admin = () => {
	const [token, setToken] = useState(localStorage.getItem("admin_token"));
	const [view, setView] = useState("teams"); // 'teams' or 'scans'
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);

	// Login State
	const [password, setPassword] = useState("");
	const [loginError, setLoginError] = useState("");

	// Auto-fetch on load/view switch (only if authenticated)
	useEffect(() => {
		if (token) {
			// Default view is teams, but we can check view state if needed
			if (view === 'teams') fetchTeams();
			else fetchScans();
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
				alert("Server Error: " + (err.error || res.status));
			}
		} catch (e) { alert("Network Error: " + e.message); }
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
				alert("Server Error: " + (err.error || res.status));
			}
		} catch (e) { alert("Network Error: " + e.message); }
		setLoading(false);
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
				alert(`Team ${status ? "Disqualified" : "Re-qualified"}.`);
				fetchTeams(); // Refresh list
			} else {
				if (res.status === 401 || res.status === 403) {
					localStorage.removeItem("admin_token");
					setToken(null);
				}
				alert("Error updating team status.");
			}
		} catch (e) {
			alert("Network Error");
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
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
					<motion.h1
						className="page-title"
						initial={{ y: -50, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						style={{ marginBottom: 0 }}
					>
						Admin Dashboard
					</motion.h1>
					<button
						onClick={() => { localStorage.removeItem("admin_token"); setToken(null); }}
						style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 10px', cursor: 'pointer' }}
					>
						Logout
					</button>
				</div>

				<div className="container" style={{ maxWidth: '800px', marginTop: '20px' }}>
					<div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
						<motion.button
							className="scan-button"
							onClick={() => setView('teams')}
							style={view === 'teams' ? { border: '2px solid white' } : {}}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							Teams
						</motion.button>
						<motion.button
							className="scan-button"
							onClick={() => setView('scans')}
							style={view === 'scans' ? { border: '2px solid white' } : {}}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							Scans
						</motion.button>
					</div>

					{loading ? <p>Loading...</p> : (
						<div style={{
							textAlign: 'left',
							maxHeight: '400px',
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
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center'
										}}
									>
										<div>
											<strong style={{ color: '#00ccff', fontSize: '1.2em' }}>{t.team_name}</strong>
											<span style={{ fontSize: '0.9em', opacity: 0.7, marginLeft: '10px' }}>({t.team_id})</span>
											<br />
											<div style={{ fontSize: '0.9em', marginTop: '5px', opacity: 0.9 }}>
												Loc: {t.assigned_location} |
												Device: {t.registered_device_id ? <span style={{ color: '#99ff99' }}>Bound</span> : 'Unbound'} |
												Status: {t.disqualified ? <span style={{ color: '#ff4444' }}>DISQUALIFIED</span> : 'Active'}
											</div>
										</div>
										{!t.disqualified ? (
											<motion.button
												onClick={() => handleDisqualify(t.team_id, true)}
												style={{
													background: 'red', fontSize: '0.8rem', padding: '5px 10px', width: 'auto', margin: 0
												}}
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.9 }}
											>
												Disqualify
											</motion.button>
										) : (
											<motion.button
												onClick={() => handleDisqualify(t.team_id, false)}
												style={{
													background: '#00cc00', fontSize: '0.8rem', padding: '5px 10px', width: 'auto', margin: 0
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
									>
										<strong style={{ color: '#ffaa00' }}>{s.team_id}</strong> @ {s.location_id} <br />
										Result: <span style={{ fontWeight: 'bold', color: s.scan_result === 'SUCCESS' ? '#99ff99' : '#ff4444' }}>{s.scan_result}</span>
										{s.admin_note && <span style={{ fontStyle: 'italic', marginLeft: '5px' }}>({s.admin_note})</span>} <br />
										<small style={{ opacity: 0.6 }}>{new Date(s.scan_time).toLocaleString()}</small>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					)}
				</div>
			</div>
		</AnimatedPage>
	);
};

export default Admin;
