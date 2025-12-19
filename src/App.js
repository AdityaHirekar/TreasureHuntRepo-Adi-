import { Routes, Route, Navigate } from "react-router-dom";
import Scan from "./page/Scan";
import Register from "./page/Register";
import Admin from "./page/Admin";
import Check from "./page/Check";
import Status from "./page/Status";


function App() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/scan" />} />
			<Route path="/regi" element={<Register />} />
			<Route path="/scan" element={<Scan />} />
			<Route path="/admin" element={<Admin />} />
			<Route path="/check" element={<Check />} />
			<Route path="/status" element={<Status />} />

		</Routes>
	);
}

export default App;
