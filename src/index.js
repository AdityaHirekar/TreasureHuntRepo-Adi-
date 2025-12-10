import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Scan from "./page/Scan"; // Import the Scan component
// import Scanner from "./page/Scanner"; // Import the Scanner component
import Check from "./page/Check"
import Admin from "./page/Admin";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import routing components

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<Router>
			<App />
		</Router>
	</React.StrictMode>
);

// Measure performance (optional)
reportWebVitals();
