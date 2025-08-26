const bcrypt = require('bcrypt');
const { saveDriver, getDriverById: storeGetDriver } = require('../db/store');
const { signPayload, verifyPayload } = require('../utils/sign');

exports.registerDriver = async (req, res) => {
  try {
    const {
      name, email, phone, password, age, gender, address,
      licenseNumber, aadharNumber, experienceYears,
      vehicleNumber, vehicleType, model, color,
      registrationNumber, insuranceNumber, route
    } = req.body;

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
    const token = signPayload({ id: driverId }, QR_SECRET, 60 * 60 * 24 * 30); // 30 days
    const qrLink = `${frontendBase}/driver-qr/${driverId}?tk=${token}`;

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

    res.status(201).json({ message: 'Driver registered successfully', driverId, qrLink, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const tokenParam = req.query.tk;
    if (!tokenParam) return res.status(403).json({ message: 'Missing QR token' });

    const QR_SECRET = process.env.QR_SECRET || 'dev-secret-change-me';
    const verified = verifyPayload(tokenParam, QR_SECRET);
    if (!verified.valid) return res.status(403).json({ message: `Invalid token: ${verified.reason}` });
    if (String(verified.payload.id) !== String(id)) return res.status(403).json({ message: 'Token does not match driver' });

    const driver = await storeGetDriver(id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    if (driver.password) delete driver.password;
    res.json({ driver });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
