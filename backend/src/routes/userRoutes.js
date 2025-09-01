const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { registerUser, loginUser, getProfile, updateProfile } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Authenticated profile endpoints for logged-in user
router.get('/profile', auth, getProfile);
// accept profilePic multipart upload
router.put('/profile', auth, upload.single('profilePic'), updateProfile);

module.exports = router;
