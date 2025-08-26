const express = require('express');
const router = express.Router();
const { addVehicle, getVehicle } = require('../controllers/vehicleController');

router.post('/', addVehicle);
router.get('/:vehicleNumber', getVehicle);

module.exports = router;
