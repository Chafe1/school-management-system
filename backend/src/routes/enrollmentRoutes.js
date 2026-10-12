const express = require('express');
const router = express.Router();
const {
  getEnrollments,
  enrollStudent,
  getStudentEnrollment,
  rolloverStudent
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getEnrollments);
router.post('/', authorize('admin'), enrollStudent);
router.get('/student/:studentId', getStudentEnrollment);
router.put('/:id/rollover', authorize('admin'), rolloverStudent);

module.exports = router;
