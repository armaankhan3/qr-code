const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  contacts: [{ type: String, validate: v => v.length <= 5 }] // Max 5 contacts
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
