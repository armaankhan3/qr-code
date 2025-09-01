const express = require('express');
// Debug helper: wrap path-to-regexp parse to log the path being parsed when an error occurs
try {
	const ptr = require('path-to-regexp');
	if (ptr && ptr.parse) {
		const originalParse = ptr.parse;
		ptr.parse = function(str, options) {
			try {
				return originalParse.call(this, str, options);
			} catch (e) {
				console.error('path-to-regexp parse failed for input:', String(str));
				throw e;
			}
		};
	}
} catch (e) {
	// ignore if not present
}
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDB = require('./src/db/db');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const app = express();
app.use(express.json());

// Enable CORS for development: allow all origins (fixes dev port mismatch issues)
// Allow requests from the deployed frontend and local dev origins
const allowedOrigins = [
	process.env.FRONTEND_URL || 'https://qr-code-amber-mu.vercel.app'
];

const corsOptions = {
	origin: (origin, cb) => {
		// allow server-to-server requests or tools without origin
		if (!origin) return cb(null, true);
		// allow explicit frontend host
		if (allowedOrigins.includes(origin)) return cb(null, true);
		// allow any localhost origin (development)
		if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return cb(null, true);
		// otherwise deny (no error thrown so preflight still returns 200/403 from downstream)
		return cb(null, false);
	},
	credentials: true,
	optionsSuccessStatus: 200,
	allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// Ensure preflight (OPTIONS) is handled
app.options('*', cors(corsOptions));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// Debug: require route modules and log their exported type to help diagnose path-to-regexp errors
try {
	const driversRoute = require('./src/routes/driverRoutes');
	console.log('driversRoute export type:', typeof driversRoute);
	console.log(Object.keys(driversRoute || {}).slice(0,10));
	app.use('/api/drivers', driversRoute); // enabled for debug
} catch (e) {
	console.error('Error loading driversRoute', e);
}
try {
	const vehiclesRoute = require('./src/routes/vehicleRoutes');
	console.log('vehiclesRoute export type:', typeof vehiclesRoute);
	console.log(Object.keys(vehiclesRoute || {}).slice(0,10));
	// app.use('/api/vehicles', vehiclesRoute); // temporarily disabled for debug
} catch (e) {
	console.error('Error loading vehiclesRoute', e);
}
try {
	const usersRoute = require('./src/routes/userRoutes');
	console.log('usersRoute export type:', typeof usersRoute);
	console.log(Object.keys(usersRoute || {}).slice(0,10));
	app.use('/api/users', usersRoute); // enabled
} catch (e) {
	console.error('Error loading usersRoute', e);
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
