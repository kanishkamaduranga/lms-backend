const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  suspendUser,
  deleteUser,
  getCurrentUser,
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post('/', [authMiddleware, adminMiddleware], createUser);
router.get('/', [authMiddleware, adminMiddleware], getAllUsers);
router.get('/me', authMiddleware, getCurrentUser); 
router.get('/:id', [authMiddleware, adminMiddleware], getUserById);
router.put('/:id', [authMiddleware, adminMiddleware], updateUser);
router.patch('/:id/suspend', [authMiddleware, adminMiddleware], suspendUser);
router.delete('/:id', [authMiddleware, adminMiddleware], deleteUser);

module.exports = router;
