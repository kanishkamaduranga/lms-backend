const express = require('express');
const router = express.Router();
const { createCourse, addContent, listCourses, getCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const authMiddleware = require('../middlewares/authMiddleware');
const instructorOrAdmin = require('../middlewares/instructorOrAdminMiddleware');

router.post('/', [authMiddleware, instructorOrAdmin], createCourse);
router.get('/', [authMiddleware], listCourses);
router.get('/:id', [authMiddleware], getCourse);
router.put('/:id', [authMiddleware, instructorOrAdmin], updateCourse);
router.delete('/:id', [authMiddleware, instructorOrAdmin], deleteCourse);
router.post('/:course_id/contents', [authMiddleware, instructorOrAdmin], addContent);

module.exports = router;
