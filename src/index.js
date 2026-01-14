import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import reportWebVitals from "./reportWebVitals";
import { BrowserRouter as Router } from "react-router-dom"; // Import routing components
import { ToastProvider } from "./components/ToastContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<ToastProvider>
			<Router>
				<App />
			</Router>
		</ToastProvider>
	</React.StrictMode>
);

// Measure performance (optional)
reportWebVitals();
