const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Register user (with file fallback)
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, contacts } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Try MongoDB first
    let user = null;
    let mongoOk = false;
    try {
      if (User.db && User.db.readyState === 1) {
        user = await User.create({ name, email, phone, password: hashedPassword, contacts });
        mongoOk = true;
      }
    } catch (e) {
      mongoOk = false;
    }

    if (!mongoOk) {
      // File fallback
      const dataDir = path.join(__dirname, '..', '..', 'data');
      const dbFile = path.join(dataDir, 'users.json');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '[]', 'utf8');
      const raw = fs.readFileSync(dbFile, 'utf8');
      const arr = JSON.parse(raw || '[]');
      if (arr.find(u => u.email === email)) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`;
      const userObj = { _id: id, name, email, phone, password: hashedPassword, contacts, createdAt: new Date().toISOString() };
      arr.push(userObj);
      fs.writeFileSync(dbFile, JSON.stringify(arr, null, 2), 'utf8');
      user = userObj;
    }

    res.status(201).json({ message: "User registered", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user (with file fallback)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = null;
    let mongoOk = false;
    try {
      if (User.db && User.db.readyState === 1) {
        user = await User.findOne({ email });
        mongoOk = !!user;
      }
    } catch (e) {
      mongoOk = false;
    }

    if (!mongoOk) {
      // File fallback
      const dataDir = path.join(__dirname, '..', '..', 'data');
      const dbFile = path.join(dataDir, 'users.json');
      if (!fs.existsSync(dbFile)) return res.status(400).json({ message: 'No users found' });
      const raw = fs.readFileSync(dbFile, 'utf8');
      const arr = JSON.parse(raw || '[]');
      user = arr.find(u => u.email === email);
      if (!user) return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: "1d" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
