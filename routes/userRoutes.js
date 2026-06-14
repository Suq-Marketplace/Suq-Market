const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isGuest } = require('../middleware/authMiddleware');

router.post('/register', isGuest, userController.register);
router.post('/login', isGuest, userController.login);
router.get('/logout', userController.logout);

module.exports = router;