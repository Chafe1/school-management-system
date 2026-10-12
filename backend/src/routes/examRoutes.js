const express = require('express');
const router = express.Router();
const {
  getExams,
  createExam,
  deleteExam,
  getExamSchedules,
  createExamSchedule,
  deleteExamSchedule
} = require('../controllers/examController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(getExams)
  .post(authorize('admin'), createExam);

router.delete('/:id', authorize('admin'), deleteExam);

router.route('/schedules')
  .get(getExamSchedules)
  .post(authorize('admin'), createExamSchedule);

router.delete('/schedules/:id', authorize('admin'), deleteExamSchedule);

module.exports = router;
