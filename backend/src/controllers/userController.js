const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Register user (with file fallback)
exports.registerUser = async (req, res) => {
  try {
  const { name, email, password, phone, contacts, role } = req.body;
  // basic validation
  const missing = [];
  if (!name) missing.push('name');
  if (!email) missing.push('email');
  if (!password) missing.push('password');
  if (missing.length) return res.status(400).json({ message: 'Missing required fields', fields: missing });
    const hashedPassword = await bcrypt.hash(password, 10);

    // Try MongoDB first
    let user = null;
    let mongoOk = false;
    try {
      if (User.db && User.db.readyState === 1) {
        user = await User.create({ name, email, phone, password: hashedPassword, contacts, role: role || 'user' });
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
      const userObj = { _id: id, name, email, phone, password: hashedPassword, contacts, createdAt: new Date().toISOString(), role: role || 'user' };
      arr.push(userObj);
      fs.writeFileSync(dbFile, JSON.stringify(arr, null, 2), 'utf8');
      user = userObj;
    }

    const token = jwt.sign({ id: user._id || user._id, role: user.role || 'user' }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '1d' });
    return res.status(201).json({ message: 'User registered', user, token });
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

// Get current logged-in user's profile
exports.getProfile = async (req, res) => {
  try {
    const id = req.user && req.user.id;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });
    // Try Mongo
    try {
      if (User.db && User.db.readyState === 1) {
        const doc = await User.findById(id).select('-password');
        if (!doc) return res.status(404).json({ message: 'Not found' });
        return res.json({ user: doc });
      }
    } catch (e) {}

    // File fallback
    const dataDir = path.join(__dirname, '..', '..', 'data');
    const dbFile = path.join(dataDir, 'users.json');
    if (!fs.existsSync(dbFile)) return res.status(404).json({ message: 'Not found' });
    const raw = fs.readFileSync(dbFile, 'utf8');
    const arr = JSON.parse(raw || '[]');
    const u = arr.find(x => String(x._id) === String(id));
    if (!u) return res.status(404).json({ message: 'Not found' });
    const copy = { ...u };
    delete copy.password;
    res.json({ user: copy });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Update logged-in user's profile (multipart not required here)
exports.updateProfile = async (req, res) => {
  try {
    const id = req.user && req.user.id;
    if (!id) return res.status(401).json({ message: 'Unauthorized' });
  const { name, phone, address, contacts } = req.body;
  // profilePic may be present as uploaded file
  const profilePicPath = req.file ? req.file.path : null;
    // Try Mongo
    try {
      if (User.db && User.db.readyState === 1) {
        const doc = await User.findById(id);
        if (!doc) return res.status(404).json({ message: 'Not found' });
        if (name) doc.name = name;
        if (phone) doc.phone = phone;
        if (address) doc.address = address;
        if (contacts) doc.contacts = Array.isArray(contacts) ? contacts : [contacts];
    if (profilePicPath) doc.profilePic = profilePicPath;
        await doc.save();
        const out = doc.toObject(); delete out.password;
        return res.json({ user: out });
      }
    } catch (e) {}

    // File fallback
    const dataDir = path.join(__dirname, '..', '..', 'data');
    const dbFile = path.join(dataDir, 'users.json');
    if (!fs.existsSync(dbFile)) return res.status(404).json({ message: 'Not found' });
    const raw = fs.readFileSync(dbFile, 'utf8');
    const arr = JSON.parse(raw || '[]');
    const idx = arr.findIndex(x => String(x._id) === String(id));
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
  if (name) arr[idx].name = name;
  if (phone) arr[idx].phone = phone;
  if (address) arr[idx].address = address;
  if (contacts) arr[idx].contacts = Array.isArray(contacts) ? contacts : [contacts];
  if (profilePicPath) arr[idx].profilePic = profilePicPath;
    fs.writeFileSync(dbFile, JSON.stringify(arr, null, 2), 'utf8');
    const out = { ...arr[idx] }; delete out.password;
    res.json({ user: out });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
