const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getStudentAttendance,
  getClassAttendance
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/mark', authorize('admin', 'teacher'), markAttendance);
router.get('/student/:studentId', getStudentAttendance);
router.get('/class/:gradeId/:sectionId', authorize('admin', 'teacher'), getClassAttendance);

module.exports = router;
