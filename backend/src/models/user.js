const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	phone: { type: String },
	password: { type: String, required: true },
	role: { type: String, enum: ['user', 'driver', 'admin'], default: 'user' },
	profilePic: { type: String },
	address: { type: String },
	contacts: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
