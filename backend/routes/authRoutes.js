const express = require('express');
const { login, getCurrentUser } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.get('/me', auth, getCurrentUser);

module.exports = router;
