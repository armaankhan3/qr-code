const path = require('path');
// load .env so MONGO_URI is available to the db helper
require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./src/db/db');

(async () => {
  console.log('Starting MongoDB connection test...');
  await connectDB();
  console.log('Test script finished (server may still be running without DB).');
})();
