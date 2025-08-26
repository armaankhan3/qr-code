const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  // Personal Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  address: { type: String, required: true },
  
  // Identity Proof
  licenseNumber: { type: String, required: true, unique: true },
  licensePhoto: { type: String, required: true }, // URL/path to uploaded license image
  aadharNumber: { type: String, required: true, unique: true },
  aadharPhoto: { type: String, required: true }, // URL/path to uploaded ID photo
  driverPhoto: { type: String, required: true }, // Selfie of driver
  
  experienceYears: { type: Number, default: 0 },

  // Vehicle Info
  vehicle: {
    vehicleNumber: { type: String, required: true, unique: true },
    vehicleType: { type: String, enum: ["Bus", "Cab", "Auto", "Metro"], required: true },
    model: { type: String, required: true },
    color: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    registrationPhoto: { type: String, required: true }, // RC photo
    insuranceNumber: { type: String, required: true, unique: true },
    insurancePhoto: { type: String, required: true }, // Insurance proof
    fitnessCertificatePhoto: { type: String }, // Optional, but recommended
    route: { type: String },
    qrCode: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
