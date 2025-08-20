const express = require('express');
const router = express.Router();
const { createCategory, renameCategory, deleteCategory, reorderCategory, listCategories, updateCategory } = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post('/', [authMiddleware, adminMiddleware], createCategory);
router.get('/', [authMiddleware], listCategories);
router.patch('/:id/rename', [authMiddleware, adminMiddleware], renameCategory);
router.patch('/:id/reorder', [authMiddleware, adminMiddleware], reorderCategory);
router.put('/:id', [authMiddleware, adminMiddleware], updateCategory);
router.delete('/:id', [authMiddleware, adminMiddleware], deleteCategory);

module.exports = router;
