const bcrypt = require('bcrypt');
const { saveDriver, getDriverById: storeGetDriver, updateDriver } = require('../db/store');
const { signPayload, verifyPayload } = require('../utils/sign');

const jwt = require('jsonwebtoken');

// Simple in-memory TTL caches to reduce repeated work on high-frequency scans
const TOKEN_CACHE = new Map(); // token -> { payload, expiresAt }
const DRIVER_CACHE = new Map(); // id -> { driver, expiresAt }
const TOKEN_CACHE_TTL = parseInt(process.env.TOKEN_CACHE_TTL || '300', 10); // seconds
const DRIVER_CACHE_TTL = parseInt(process.env.DRIVER_CACHE_TTL || '300', 10); // seconds

function setTokenCache(token, payload, ttlSec) {
  const expiresAt = Date.now() + ((ttlSec || TOKEN_CACHE_TTL) * 1000);
  TOKEN_CACHE.set(token, { payload, expiresAt });
}

function getTokenCache(token) {
  const entry = TOKEN_CACHE.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { TOKEN_CACHE.delete(token); return null; }
  return entry.payload;
}

function setDriverCache(id, driver) {
  const expiresAt = Date.now() + (DRIVER_CACHE_TTL * 1000);
  DRIVER_CACHE.set(String(id), { driver, expiresAt });
}

function getDriverCache(id) {
  const entry = DRIVER_CACHE.get(String(id));
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { DRIVER_CACHE.delete(String(id)); return null; }
  return entry.driver;
}

exports.registerDriver = async (req, res) => {
  try {
    const {
      name, email, phone, password, age, gender, address,
      licenseNumber, aadharNumber, experienceYears,
      vehicleNumber, vehicleType, model, color,
      registrationNumber, insuranceNumber, route
    } = req.body;

    const missing = [];
    ['name','email','password','age','gender','address','licenseNumber','vehicleNumber','vehicleType','model','registrationNumber','insuranceNumber'].forEach(k => {
      if (!req.body[k]) missing.push(k);
    });
    if (missing.length) return res.status(400).json({ message: 'Missing required fields', fields: missing });

    const hashedPassword = await bcrypt.hash(password, 10);

    const driverData = {
      name,
      email,
      phone,
      password: hashedPassword,
      age,
      gender,
      address,
      licenseNumber,
      licensePhoto: req.files?.licensePhoto ? req.files.licensePhoto[0].path : null,
      aadharNumber,
      aadharPhoto: req.files?.aadharPhoto ? req.files.aadharPhoto[0].path : null,
      driverPhoto: req.files?.driverPhoto ? req.files.driverPhoto[0].path : null,
      experienceYears,
      vehicle: {
        vehicleNumber,
        vehicleType,
        model,
        color,
        registrationNumber,
        registrationPhoto: req.files?.registrationPhoto ? req.files.registrationPhoto[0].path : null,
        insuranceNumber,
        insurancePhoto: req.files?.insurancePhoto ? req.files.insurancePhoto[0].path : null,
        fitnessCertificatePhoto: req.files?.fitnessCertificatePhoto ? req.files.fitnessCertificatePhoto[0].path : null,
        route,
      },
    };

    // Persist using store helper (prefers MongoDB if connected, otherwise file JSON fallback)
  const saved = await saveDriver(driverData);
  const driverId = saved._id || saved.id || saved._id || saved.id;

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5175';
    const QR_SECRET = process.env.QR_SECRET || 'dev-secret-change-me';
  const qrToken = signPayload({ id: driverId }, QR_SECRET, 60 * 60 * 24 * 30); // 30 days
  const qrLink = `${frontendBase}/driver-qr/${driverId}?tk=${qrToken}`;

  // also create an auth JWT for the driver so frontend can immediately login
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
  const authToken = jwt.sign({ id: driverId, role: 'driver' }, JWT_SECRET, { expiresIn: '7d' });

    // If saved is a mongoose document, update and save; otherwise write back to file store
  try {
      if (saved && typeof saved.save === 'function') {
        saved.vehicle = saved.vehicle || {};
        saved.vehicle.qrCode = qrLink;
        await saved.save();
      } else {
        // update file store
        const fs = require('fs');
        const path = require('path');
        const dataFile = path.join(__dirname, '..', '..', 'data', 'drivers.json');
        const raw = fs.readFileSync(dataFile, 'utf8');
        const arr = JSON.parse(raw || '[]');
        const idx = arr.findIndex(d => String(d._id) === String(driverId));
        if (idx !== -1) {
          arr[idx].vehicle = arr[idx].vehicle || {};
          arr[idx].vehicle.qrCode = qrLink;
          fs.writeFileSync(dataFile, JSON.stringify(arr, null, 2), 'utf8');
        }
      }
    } catch (e) {
      // non-fatal: continue
    }

  res.status(201).json({ message: 'Driver registered successfully', driverId, qrLink, qrToken, authToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
  const cachedDriver = getDriverCache(id);
    const tokenParam = req.query.tk;
    if (!tokenParam) return res.status(403).json({ message: 'Missing QR token' });

    const QR_SECRET = process.env.QR_SECRET || 'dev-secret-change-me';
    const verified = verifyPayload(tokenParam, QR_SECRET);
    if (!verified.valid) return res.status(403).json({ message: `Invalid token: ${verified.reason}` });
    if (String(verified.payload.id) !== String(id)) return res.status(403).json({ message: 'Token does not match driver' });

    const driver = await storeGetDriver(id);
  setDriverCache(id, driver);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    if (driver.password) delete driver.password;
    res.json({ driver });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Return driver's editable profile (no token required - intended for owner-facing UI)
exports.getDriverProfile = async (req, res) => {
  try {
    const { id } = req.params;
  // ownership check: only admin or owner may view this owner-facing profile
  const requester = req.user;
  if (!requester) return res.status(401).json({ message: 'Unauthorized' });
  if (requester.role !== 'admin' && String(requester.id) !== String(id)) return res.status(403).json({ message: 'Forbidden' });

  const driver = await storeGetDriver(id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    if (driver.password) delete driver.password;
    res.json({ driver });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update driver profile (accepts same multipart fields as registration)
exports.updateDriverProfile = async (req, res) => {
  try {
    const { id } = req.params;
  const cachedDriver = getDriverCache(id);
  // ownership check: only admin or owner may update
  const requester = req.user;
  if (!requester) return res.status(401).json({ message: 'Unauthorized' });
  if (requester.role !== 'admin' && String(requester.id) !== String(id)) return res.status(403).json({ message: 'Forbidden' });
    const {
      name, email, phone, age, gender, address,
      experienceYears, vehicleNumber, vehicleType, model, color, registrationNumber, insuranceNumber, route
    } = req.body;

    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (phone) update.phone = phone;
    if (age) update.age = age;
    if (gender) update.gender = gender;
    if (address) update.address = address;
    if (experienceYears) update.experienceYears = experienceYears;

    // files
  if (req.files?.driverPhoto) update.driverPhoto = req.files.driverPhoto[0].path;
  if (req.files?.profilePic) update.driverPhoto = req.files.profilePic[0].path; // accept profilePic as alias
    if (req.files?.licensePhoto) update.licensePhoto = req.files.licensePhoto[0].path;
    if (req.files?.aadharPhoto) update.aadharPhoto = req.files.aadharPhoto[0].path;

    // vehicle nested
    update.vehicle = update.vehicle || {};
    if (vehicleNumber) update.vehicle.vehicleNumber = vehicleNumber;
    if (vehicleType) update.vehicle.vehicleType = vehicleType;
    if (model) update.vehicle.model = model;
    if (color) update.vehicle.color = color;
    if (registrationNumber) update.vehicle.registrationNumber = registrationNumber;
    if (req.files?.registrationPhoto) update.vehicle.registrationPhoto = req.files.registrationPhoto[0].path;
    if (insuranceNumber) update.vehicle.insuranceNumber = insuranceNumber;
    if (req.files?.insurancePhoto) update.vehicle.insurancePhoto = req.files.insurancePhoto[0].path;
    if (req.files?.fitnessCertificatePhoto) update.vehicle.fitnessCertificatePhoto = req.files.fitnessCertificatePhoto[0].path;
    if (route) update.vehicle.route = route;

    const updated = await updateDriver(id, update);
  setDriverCache(id, updated);
    if (!updated) return res.status(404).json({ message: 'Driver not found' });
    if (updated.password) delete updated.password;
    res.json({ message: 'Profile updated', driver: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate and store a fresh signed QR link for a driver
exports.generateQrForDriver = async (req, res) => {
  try {
    const { id } = req.params;
  const cachedDriver = getDriverCache(id);
  // ownership check
  const requester = req.user;
  if (!requester) return res.status(401).json({ message: 'Unauthorized' });
  if (requester.role !== 'admin' && String(requester.id) !== String(id)) return res.status(403).json({ message: 'Forbidden' });
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5175';
    const QR_SECRET = process.env.QR_SECRET || 'dev-secret-change-me';
    const expiresSeconds = parseInt(process.env.QR_EXPIRES_SECONDS || String(60 * 60 * 24 * 30), 10);

    // Ensure driver exists
    const existing = await storeGetDriver(id);
  setDriverCache(id, existing);
    if (!existing) return res.status(404).json({ message: 'Driver not found' });

    const token = signPayload({ id }, QR_SECRET, expiresSeconds);
    const qrLink = `${frontendBase}/driver-qr/${id}?tk=${token}`;

    // persist qrLink
    const updated = await updateDriver(id, { vehicle: { ...(existing.vehicle || {}), qrCode: qrLink } });

    res.json({ message: 'QR generated', driverId: id, qrLink, token, driver: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
