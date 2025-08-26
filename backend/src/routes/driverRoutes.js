const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { registerDriver, getDriverById } = require("../controllers/driverController");

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

router.get('/:id', getDriverById);

module.exports = router;
