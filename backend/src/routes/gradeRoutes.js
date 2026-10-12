const express = require('express');
const router = express.Router();
const {
  recordGrade,
  getStudentGrades,
  getGradeSummary
} = require('../controllers/gradeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/record', authorize('admin', 'teacher'), recordGrade);
router.get('/student/:studentId', getStudentGrades);
router.get('/summary', getGradeSummary);

module.exports = router;
