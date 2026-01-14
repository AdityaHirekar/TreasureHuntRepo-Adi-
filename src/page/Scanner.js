import React, { useState } from "react";
import QrReader from "react-qr-scanner";

const QRScanner = ({ onScanData, onError, width = "80%", height = "80%" }) => {
	const [, setData] = useState("No result");

	const handleScan = (result) => {
		if (result) {
			console.log("Scanned: ", result);
			console.log("Text: ", result.text);
			setData(result.text);
			console.log("Updated Text: ", result.text);
			if (onScanData) {
				console.log("Understood: ", onScanData);
				onScanData(result.text);
			}
		}
	};

	const handleError = (err) => {
		console.error(err);
		if (onError) {
			onError(err);
		}
	};

	return (
		<div>
			<QrReader
				onError={handleError}
				onScan={handleScan}
				style={{ width, height }}
				constraints={{
					video: { facingMode: "environment" }, // Use environment mode without `exact`
				}} // Set to use the back camera
			/>
		</div>
	);
};

export default QRScanner;
