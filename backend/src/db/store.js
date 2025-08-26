const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const dataDir = path.join(__dirname, '..', '..', 'data');
const dbFile = path.join(dataDir, 'drivers.json');

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '[]', 'utf8');
}

function makeId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`;
}

async function saveDriver(driverObj) {
  // If mongoose is connected, use Mongoose model to persist
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const Driver = require('../models/vehicle');
      const m = new Driver(driverObj);
      await m.save();
      return m.toObject();
    }
  } catch (e) {
    // fall through to file store
  }

  // File fallback
  ensureDataDir();
  const raw = fs.readFileSync(dbFile, 'utf8');
  const arr = JSON.parse(raw || '[]');
  const obj = { ...driverObj };
  if (!obj._id) obj._id = makeId();
  obj.createdAt = new Date().toISOString();
  arr.push(obj);
  fs.writeFileSync(dbFile, JSON.stringify(arr, null, 2), 'utf8');
  return obj;
}

async function getDriverById(id) {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const Driver = require('../models/vehicle');
      const doc = await Driver.findById(id).select('-password');
      if (!doc) return null;
      return doc.toObject();
    }
  } catch (e) {
    // fall through to file store
  }

  ensureDataDir();
  const raw = fs.readFileSync(dbFile, 'utf8');
  const arr = JSON.parse(raw || '[]');
  const found = arr.find(d => String(d._id) === String(id));
  return found || null;
}

module.exports = { saveDriver, getDriverById };
