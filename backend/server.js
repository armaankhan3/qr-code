const express = require('express');
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
	process.env.FRONTEND_URL || 'https://qr-code-amber-mu.vercel.app',
	'http://localhost:5173',
	'http://localhost:5174',
	'http://localhost:5175',
	'http://localhost:3000'
];
app.use(cors({ origin: (origin, cb) => {
	if (!origin) return cb(null, true); // allow server-to-server or curl
	if (allowedOrigins.includes(origin)) return cb(null, true);
	return cb(new Error('CORS not allowed by policy'));
}, credentials: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/drivers', require('./src/routes/driverRoutes'));
app.use('/api/vehicles', require('./src/routes/vehicleRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
