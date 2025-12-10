import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./Scan.css"; // Use the main theme

const Admin = () => {
	const navigate = useNavigate();
	const [view, setView] = useState("teams"); // 'teams' or 'scans'
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);

	// Security Check: Redirect if no token
	useEffect(() => {
		const token = localStorage.getItem("admin_token");
		if (!token) {
			navigate("/admin-login");
		}
	}, [navigate]);

	// Auto-fetch on load/view switch (only if authenticated)
	useEffect(() => {
		if (localStorage.getItem("admin_token")) {
			// Default view is teams, but we can check view state if needed
			if (view === 'teams') fetchTeams();
			else fetchScans();
		}
	}, [view]);

	// Helper to get headers
	const getHeaders = () => {
		const token = localStorage.getItem("admin_token");
		return {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${token}`
		};
	};

	const fetchTeams = async () => {
		setLoading(true);
		try {
			const res = await fetch(`${API_BASE_URL}/admin/teams`, { headers: getHeaders() });
			if (res.ok) {
				setData(await res.json());
			} else {
				if (res.status === 401 || res.status === 403) navigate("/admin-login");
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
				if (res.status === 401 || res.status === 403) navigate("/admin-login");
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
				if (res.status === 401 || res.status === 403) navigate("/admin-login");
				alert("Error updating team status.");
			}
		} catch (e) {
			alert("Network Error");
		}
	};

	return (
		<div className="main-wrapper">
			<h1 className="page-title">Admin Dashboard</h1>
			<div className="container" style={{ maxWidth: '800px' }}>
				<div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
					<button
						className="scan-button"
						onClick={() => setView('teams')}
						style={view === 'teams' ? { border: '2px solid white' } : {}}
					>
						Teams
					</button>
					<button
						className="scan-button"
						onClick={() => setView('scans')}
						style={view === 'scans' ? { border: '2px solid white' } : {}}
					>
						Scans
					</button>
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

						{view === 'teams' && data.map(t => (
							<div key={t.id} style={{
								background: 'rgba(255,255,255,0.1)',
								padding: '15px',
								marginBottom: '10px',
								borderRadius: '8px',
								border: '1px solid rgba(255,255,255,0.1)',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center'
							}}>
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
									<button
										onClick={() => handleDisqualify(t.team_id, true)}
										style={{
											background: 'red', fontSize: '0.8rem', padding: '5px 10px', width: 'auto', margin: 0
										}}
									>
										Disqualify
									</button>
								) : (
									<button
										onClick={() => handleDisqualify(t.team_id, false)}
										style={{
											background: '#00cc00', fontSize: '0.8rem', padding: '5px 10px', width: 'auto', margin: 0
										}}
									>
										Re-qualify
									</button>
								)}
							</div>
						))}

						{view === 'scans' && data.map(s => (
							<div key={s.id} style={{
								background: 'rgba(255,255,255,0.1)',
								padding: '15px',
								marginBottom: '10px',
								borderRadius: '8px',
								border: '1px solid rgba(255,255,255,0.1)'
							}}>
								<strong style={{ color: '#ffaa00' }}>{s.team_id}</strong> @ {s.location_id} <br />
								Result: <span style={{ fontWeight: 'bold', color: s.scan_result === 'SUCCESS' ? '#99ff99' : '#ff4444' }}>{s.scan_result}</span>
								{s.admin_note && <span style={{ fontStyle: 'italic', marginLeft: '5px' }}>({s.admin_note})</span>} <br />
								<small style={{ opacity: 0.6 }}>{new Date(s.scan_time).toLocaleString()}</small>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Admin;
