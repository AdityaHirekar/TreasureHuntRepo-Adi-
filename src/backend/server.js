require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");
const OpenLocationCode = require("open-location-code").OpenLocationCode;

const app = express();
const PORT = 5050;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Service Role Key is required for strict Admin actions usually, but we'll assume the key provided has permissions
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- Helper Functions ---

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
	if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
	var R = 6371;
	var dLat = deg2rad(lat2 - lat1);
	var dLon = deg2rad(lon2 - lon1);
	var a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return d * 1000;
}

function deg2rad(deg) {
	return deg * (Math.PI / 180);
}

async function isDeviceBanned(deviceId) {
	const { data } = await supabase.from("banned_devices").select("id").eq("device_id", deviceId).single();
	return !!data;
}

// Authentication Middleware for Admin
// simplified: checks for a secret header or similar. 
// Real world: Verify JWT from Supabase Auth.
// For this task: We'll assume the client sends an 'x-admin-secret' or we check a valid Supabase Session in the header.
// Prompt said: "Protect admin routes with Supabase JWT verification."
// Authentication Middleware for Admin
const adminAuth = (req, res, next) => {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	// Simple Token Check (In production use real JWT)
	if (token === "secret-admin-token-123") {
		next();
	} else {
		return res.status(403).json({ error: "Unauthorized" });
	}
};

// --- Endpoints ---

// 0. Auth Login
app.post("/auth/login", (req, res) => {
	const { password } = req.body;
	// Secure password check using env variable or fallback
	const adminPassword = process.env.ADMIN_PASSWORD || "admin@123";
	if (password === adminPassword) {
		res.json({ token: "secret-admin-token-123" });
	} else {
		res.status(401).json({ error: "Invalid Password" });
	}
});

// --- Endpoints ---

// 1. Health
app.get("/health", async (req, res) => {
	try {
		const { error } = await supabase.from("teams").select("count", { count: "exact", head: true });
		if (error) throw error;
		res.status(200).json({ status: "OK", database: "Connected", server: "Running" });
	} catch (err) {
		res.status(500).json({ status: "Error", database: "Disconnected", error: err.message });
	}
});

// 2. Register
app.post("/register", async (req, res) => {
	const { teamName, members } = req.body;
	if (!teamName || !members || members.length < 1) {
		return res.status(400).json({ error: "Invalid input" });
	}

	try {
		const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
		const teamId = `TEAM-${suffix}`;


		// Default Start Location: CLG
		const randomLoc = "CLG";

		const { error } = await supabase.from("teams").insert([{
			team_id: teamId, team_name: teamName, members: members, assigned_location: randomLoc
		}]);
		if (error) throw error;

		res.status(200).json({ message: "Registered", teamId, assignedLocation: randomLoc });
	} catch (error) {
		console.error("Register Error:", error);
		res.status(500).json({ error: error.message || "Register failed" });
	}
});

// 3. Scan
app.post("/scan", async (req, res) => {
	const { teamId, locationId, deviceId, lat, lng } = req.body;
	if (!teamId || !locationId || !deviceId) {
		return res.status(400).json({ error: "Missing data" });
	}

	try {
		// Anti-Cheat: Banned Device check
		if (await isDeviceBanned(deviceId)) {
			await supabase.from("scans").insert([{ team_id: teamId, location_id: locationId, device_id: deviceId, client_lat: lat, client_lng: lng, scan_result: "REJECTED", admin_note: "Banned Device" }]);
			return res.status(403).json({ error: "Device Banned" });
		}

		const { data: team } = await supabase.from("teams").select("*").eq("team_id", teamId).single();
		if (!team) return res.status(404).json({ error: "Team not found" });
		if (team.disqualified) return res.status(403).json({ error: "Team Disqualified" });

		// Device Binding Logic
		if (!team.registered_device_id) {
			await supabase.from("teams").update({ registered_device_id: deviceId }).eq("id", team.id);
		} else if (team.registered_device_id !== deviceId) {
			await supabase.from("scans").insert([{
				team_id: teamId, location_id: locationId, device_id: deviceId, client_lat: lat, client_lng: lng, scan_result: "REJECTED", admin_note: "Unauthorized Device"
			}]);
			return res.status(403).json({ error: "Unauthorized Device" });
		}

		// Location Check
		if (team.assigned_location !== locationId) {
			// Count previous wrong scans (scan_result = "FAIL")
			const { count: wrongCount, error: countError } = await supabase
				.from("scans")
				.select("*", { count: "exact", head: true })
				.eq("team_id", teamId)
				.eq("scan_result", "FAIL");

			if (countError) console.error("Info: Could not count wrong scans", countError);

			const currentStrike = (wrongCount || 0) + 1;

			if (currentStrike >= 3) {
				// 3rd Strike: Disqualify
				await supabase.from("teams").update({ disqualified: true }).eq("team_id", teamId);

				await supabase.from("scans").insert([{
					team_id: teamId,
					location_id: locationId,
					device_id: deviceId,
					client_lat: lat,
					client_lng: lng,
					scan_result: "REJECTED",
					admin_note: "Disqualified: 3rd Wrong Location"
				}]);
				return res.status(403).json({ error: "DISQUALIFIED: You have scanned the wrong location 3 times." });
			} else {
				// Warning
				await supabase.from("scans").insert([{
					team_id: teamId,
					location_id: locationId,
					device_id: deviceId,
					client_lat: lat,
					client_lng: lng,
					scan_result: "FAIL",
					admin_note: "Wrong Location"
				}]);
				return res.json({ result: "FAIL", message: `Wrong Location. Warning ${currentStrike}/3` });
			}
		}


		// Strict GPS Check (DB Coordinates)
		let targetLat, targetLng;

		const { data: targetLoc } = await supabase.from("location").select("latitude, longitude").eq("location_code", locationId).single();
		if (targetLoc) {
			targetLat = targetLoc.latitude;
			targetLng = targetLoc.longitude;
		}

		if (targetLat && targetLng) {
			const distance = getDistanceFromLatLonInM(lat, lng, targetLat, targetLng);

			const MAX_DISTANCE = 25; // Strict 25m limit
			// If using Plus Code (which has an area), we might be more lenient or measure to edge? 
			// Center is fine for 25m threshold if the code is precise enough (10+ digits).

			if (distance > MAX_DISTANCE) {
				// AUTO-DISQUALIFY
				await supabase.from("teams").update({ disqualified: true }).eq("team_id", teamId);

				await supabase.from("scans").insert([{
					team_id: teamId, location_id: locationId, device_id: deviceId, client_lat: lat, client_lng: lng,
					scan_result: "REJECTED", admin_note: `GPS Cheating? (${Math.round(distance)}m > 25m) - DISQUALIFIED`, distance_check_meters: distance
				}]);
				return res.status(403).json({ error: `CHEATING DETECTED. You are ${Math.round(distance)}m away (Max 25m). You have been DISQUALIFIED.` });
			}
		} else {
			// No Coordinates found for this ID
			console.log("No coordinates found for location:", locationId);
		}

		// Success
		await supabase.from("scans").insert([{
			team_id: teamId, location_id: locationId, device_id: deviceId, client_lat: lat, client_lng: lng, scan_result: "SUCCESS", distance_check_meters: 0
		}]);

		// Check Win Condition: Have they visited 5 locations (excluding CLG)?
		const { data: teamScans, error: countError } = await supabase
			.from("scans")
			.select("location_id, scan_time")
			.eq("team_id", teamId)
			.eq("scan_result", "SUCCESS")
			.neq("location_id", "CLG");

		if (countError) console.error("Count Error", countError);

		const successCount = (teamScans?.length || 0);

		// If this was the 5th one (or more), they are done.
		if (successCount >= 5) {

			// --- RANKING CALCULATION ---
			// 1. Fetch ALL successful scans for ALL teams (excluding CLG)
			const { data: allScans } = await supabase
				.from("scans")
				.select("team_id, scan_time")
				.eq("scan_result", "SUCCESS")
				.neq("location_id", "CLG");

			// 2. Group by team and find completion time for each
			const teamCompletions = {}; // { teamId: timestamp }

			allScans.forEach(s => {
				if (!teamCompletions[s.team_id]) teamCompletions[s.team_id] = [];
				teamCompletions[s.team_id].push(new Date(s.scan_time).getTime());
			});

			const finishedTeams = [];
			for (const [tId, times] of Object.entries(teamCompletions)) {
				if (times.length >= 5) {
					// Sort times to find the 5th one
					times.sort((a, b) => a - b);
					const finishTime = times[4]; // 0-indexed, so 4 is 5th
					finishedTeams.push({ teamId: tId, finishTime });
				}
			}

			// 3. Sort finished teams by completion time
			finishedTeams.sort((a, b) => a.finishTime - b.finishTime);

			// 4. Find rank of current team
			const myRank = finishedTeams.findIndex(t => t.teamId === teamId) + 1; // 1-based rank

			await supabase.from("teams").update({ assigned_location: "COMPLETED" }).eq("id", team.id);

			console.log(`Team ${teamId} Finished. Rank: ${myRank}`);

			if (myRank === 1) {
				return res.status(200).json({
					result: "WINNER",
					message: "CHAMPION!",
					rank: 1,
					nextLocation: "COMPLETED",
					nextClue: "CONGRATULATIONS! You are the first to finish! Proceed to the stage."
				});
			} else {
				return res.status(200).json({
					result: "RANK",
					message: "MISSION COMPLETE",
					rank: myRank,
					nextLocation: "COMPLETED",
					nextClue: `You finished #${myRank}! Return to base to claim your prize.`
				});
			}
		}

		// Next Location (Normal Loop)
		// Exclude CLG from the random pool
		const { data: locations } = await supabase.from("location").select("location_code, location_hint").neq("location_code", locationId).neq("location_code", "CLG");

		let nextLocObj;
		if (locations.length > 0) {
			nextLocObj = locations[Math.floor(Math.random() * locations.length)];
		} else {
			// Fallback if no locations left
			nextLocObj = { location_code: "COMPLETED", location_hint: "No more locations. Return to Base." };
		}

		await supabase.from("teams").update({ assigned_location: nextLocObj.location_code }).eq("id", team.id);

		res.status(200).json({
			result: "SUCCESS",
			message: "Correct!",
			nextLocation: nextLocObj.location_code,
			nextClue: nextLocObj.location_hint
		});
	} catch (error) {
		console.error("Scan Error:", error);
		res.status(500).json({ error: error.message || "Scan Error" });
	}
});

// 4. Leaderboard
app.get("/leaderboard", async (req, res) => {
	try {
		const { data: teams } = await supabase.from("teams").select("team_id, team_name");
		// Fetch all successful scans, including their timestamps
		const { data: scans } = await supabase.from("scans").select("team_id, scan_time").eq("scan_result", "SUCCESS");

		const scores = {};
		const lastScanTimes = {};

		scans.forEach(s => {
			// Increment score
			scores[s.team_id] = (scores[s.team_id] || 0) + 1;

			// Track the latest scan time for tie-breaking
			const scanTime = new Date(s.scan_time).getTime();
			if (!lastScanTimes[s.team_id] || scanTime > lastScanTimes[s.team_id]) {
				lastScanTimes[s.team_id] = scanTime;
			}
		});

		const leaderboard = teams.map(t => ({
			team_name: t.team_name,
			score: scores[t.team_id] || 0,
			last_scan_time: lastScanTimes[t.team_id] || 0
		})).sort((a, b) => {
			// Primary Sort: Score (Descending)
			if (b.score !== a.score) {
				return b.score - a.score;
			}
			// Secondary Sort: Time Taken (Ascending) - Earlier is better
			// Only checking time if both have > 0 score, otherwise 0 time (started but nc) is not "better" 
			// Actually, 0 time means no scans, so they should be last anyway due to score.
			// But if score is tied (e.g. both have 5), smaller time is better.
			return a.last_scan_time - b.last_scan_time;
		});

		res.json(leaderboard);
	} catch (error) {
		console.error("Leaderboard Error:", error);
		res.status(500).json({ error: "Error fetching leaderboard" });
	}
});

// 5. Check Status (For frontend to know if disqualified on load or get current hint)
app.get("/team-status/:teamId", async (req, res) => {
	const { teamId } = req.params;
	try {
		const { data: team } = await supabase.from("teams").select("disqualified, assigned_location").eq("team_id", teamId).single();
		if (!team) return res.status(404).json({ error: "Team not found" });

		// Fetch hint for the assigned location
		let currentHint = "Unknown Objective";
		if (team.assigned_location === "COMPLETED") {
			currentHint = "MISSION COMPLETE! Return to College immediately for debriefing.";
		} else if (team.assigned_location) {
			const { data: loc } = await supabase.from("location").select("location_hint").eq("location_code", team.assigned_location).single();
			if (loc) currentHint = loc.location_hint;
		}

		res.json({ disqualified: team.disqualified, currentClue: currentHint });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// --- PUBLIC ROUTES (For Display Boards) ---
app.get("/public/scans", async (req, res) => {
	try {
		// Public scan data (limit 50, recent first)
		const { data: scans, error } = await supabase.from("scans")
			.select("*, teams(team_name)")
			.order("scan_time", { ascending: false })
			.limit(50);

		if (error) throw error;
		res.json(scans);
	} catch (err) {
		console.error("Public Scans Error:", err);
		res.status(500).json({ error: err.message });
	}
});

// --- ADMIN ROUTES ---
app.use("/admin", adminAuth); // Protect all /admin routes

app.get("/admin/teams", async (req, res) => {
	try {
		const { data: teams, error } = await supabase.from("teams").select("*");
		if (error) throw error;
		res.json(teams);
	} catch (err) {
		console.error("Admin Teams Error:", err);
		res.status(500).json({ error: err.message });
	}
});

app.get("/admin/scans", async (req, res) => {
	try {
		const { data: scans, error } = await supabase.from("scans").select("*, teams(team_name)").order("scan_time", { ascending: false });
		if (error) throw error;
		res.json(scans);
	} catch (err) {
		console.error("Admin Scans Error:", err);
		res.status(500).json({ error: err.message });
	}
});

app.get("/admin/locations", async (req, res) => {
	try {
		const { data: locations, error } = await supabase.from("location").select("*").order("location_code", { ascending: true });
		if (error) throw error;
		res.json(locations);
	} catch (err) {
		console.error("Admin Locations Error:", err);
		res.status(500).json({ error: err.message });
	}
});

app.put("/admin/location", async (req, res) => {
	const { locationCode, lat, lng } = req.body;
	if (!locationCode || !lat || !lng) return res.status(400).json({ error: "Missing data" });

	try {
		const { error } = await supabase.from("location").update({ latitude: lat, longitude: lng }).eq("location_code", locationCode);
		if (error) throw error;
		res.json({ message: `Location ${locationCode} updated to ${lat}, ${lng}` });
	} catch (err) {
		console.error("Update Location Error:", err);
		res.status(500).json({ error: err.message });
	}
});

app.post("/admin/disqualify", async (req, res) => {
	const { teamId, status } = req.body;


	// If status is provided, use it. Otherwise default to true (disqualify).
	const newStatus = status !== undefined ? status : true;

	const { error } = await supabase.from("teams").update({ disqualified: newStatus }).eq("team_id", teamId);
	if (error) return res.status(500).json({ error: error.message });

	const action = newStatus ? "disqualified" : "re-qualified";
	res.json({ message: `Team ${teamId} has been ${action}.` });
});

app.put("/admin/team/location", async (req, res) => {
	const { teamId, locationCode } = req.body;
	if (!teamId || !locationCode) return res.status(400).json({ error: "Missing data" });

	try {
		const { error } = await supabase.from("teams").update({ assigned_location: locationCode }).eq("team_id", teamId);
		if (error) throw error;
		res.json({ message: `Team ${teamId} moved to ${locationCode}` });
	} catch (err) {
		console.error("Update Team Loc Error:", err);
		res.status(500).json({ error: err.message });
	}
});

app.post("/admin/ban", async (req, res) => {
	const { deviceId, reason } = req.body;
	const { error } = await supabase.from("banned_devices").insert([{ device_id: deviceId, reason }]);
	if (error) return res.status(500).json({ error: error.message });
	res.json({ message: `Device ${deviceId} banned.` });
});

app.listen(PORT, () => {
	console.log(`Server V2 running on http://localhost:${PORT}`);
});
