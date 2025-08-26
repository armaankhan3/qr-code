const mongoose = require('mongoose');


const connectDB = async () => {
  const envUri = process.env.MONGO_URI;
  const fallback = 'mongodb://127.0.0.1:27017/qrproject';
  // If USE_LOCAL_DB=true we prefer the local fallback even if MONGO_URI is set.
  const useLocal = String(process.env.USE_LOCAL_DB || '').toLowerCase() === 'true';
  const uri = useLocal ? fallback : (envUri && envUri.trim() !== '' ? envUri : fallback);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    const which = uri === fallback ? 'local MongoDB' : 'remote MongoDB (MONGO_URI)';
    console.log(`MongoDB connected to ${which}`);
  } catch (err) {
    console.error('MongoDB connection failed:', err && err.message ? err.message : err);
    console.error('To persist data, either start a local MongoDB server or set MONGO_URI in backend/.env.');
    // continue without throwing to keep the app usable for frontend development
  }
};

module.exports = connectDB;
