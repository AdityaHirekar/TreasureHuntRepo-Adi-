import { Routes, Route, Navigate } from "react-router-dom";
import Scan from "./page/Scan";
import Register from "./page/Register";
import Admin from "./page/Admin";
import Check from "./page/Check";
import Status from "./page/Status";
import NotFound from "./page/NotFound";
import ParticlesBackground from "./components/ParticlesBackground";





// Route Guard that Forces Scan if Logged In
const ForceScanIfLoggedIn = ({ children }) => {
	const teamId = localStorage.getItem("teamId");
	if (teamId) return <Navigate to="/scan" replace />;
	return children;
};

function App() {
	return (
		<>
			<ParticlesBackground />
			<Routes>
				<Route path="/" element={<ForceScanIfLoggedIn><Navigate to="/scan" /></ForceScanIfLoggedIn>} />
				<Route path="/regi" element={<ForceScanIfLoggedIn><Register /></ForceScanIfLoggedIn>} />
				<Route path="/scan" element={<Scan />} />
				<Route path="/admin" element={<ForceScanIfLoggedIn><Admin /></ForceScanIfLoggedIn>} />
				<Route path="/check" element={<ForceScanIfLoggedIn><Check /></ForceScanIfLoggedIn>} />
				<Route path="/status" element={<ForceScanIfLoggedIn><Status /></ForceScanIfLoggedIn>} />
				<Route path="*" element={<ForceScanIfLoggedIn><NotFound /></ForceScanIfLoggedIn>} />
			</Routes>
		</>
	);
}

export default App;
