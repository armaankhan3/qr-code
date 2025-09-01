const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const auth = require('../middleware/auth');
const { registerDriver, getDriverById, getDriverProfile, updateDriverProfile, generateQrForDriver } = require("../controllers/driverController");

// Multiple file fields
const cpUpload = upload.fields([
  { name: "licensePhoto", maxCount: 1 },
  { name: "aadharPhoto", maxCount: 1 },
  { name: "driverPhoto", maxCount: 1 },
  { name: "registrationPhoto", maxCount: 1 },
  { name: "insurancePhoto", maxCount: 1 },
  { name: "fitnessCertificatePhoto", maxCount: 1 }
]);

router.post("/register", cpUpload, registerDriver);

// Public: QR access (requires token tk query param)
router.get('/:id', getDriverById);

// Owner-facing profile endpoints (protected)
router.get('/:id/profile', auth, getDriverProfile);
router.put('/:id/profile', auth, cpUpload, updateDriverProfile);

// Generate a fresh QR for driver (owner action)
router.post('/:id/generate-qr', auth, generateQrForDriver);

module.exports = router;
