const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getMenuItems } = require('../controllers/menuController');

// Both authenticated and unauthenticated users can access the menu
// but the response will differ based on authentication status
router.get('/menu', authMiddleware.optional, getMenuItems);

module.exports = router;