const Vehicle = require('../models/vehicle');
const generateQR = require('../utils/generateQR');

// Register a vehicle
exports.addVehicle = async (req, res) => {
  try {
    const { driverName, vehicleNumber, route } = req.body;
    const qrCode = await generateQR(vehicleNumber);

    const vehicle = await Vehicle.create({ driverName, vehicleNumber, route, qrCode });
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get vehicle by ID or number
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ vehicleNumber: req.params.vehicleNumber });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
