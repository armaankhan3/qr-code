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
app.use('/api/drivers', require('./src/routes/driverRoutes'));
app.use('/api/vehicles', require('./src/routes/vehicleRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
