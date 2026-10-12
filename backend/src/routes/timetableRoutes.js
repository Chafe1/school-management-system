const express = require('express');
const router = express.Router();
const {
  getSlots,
  createSlot,
  deleteSlot,
  getClassTimetable,
  getTeacherTimetable
} = require('../controllers/timetableController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/slots', getSlots);
router.post('/slots', authorize('admin'), createSlot);
router.delete('/slots/:id', authorize('admin'), deleteSlot);

router.get('/class/:gradeId/:sectionId', getClassTimetable);
router.get('/teacher/:teacherId', getTeacherTimetable);

module.exports = router;
