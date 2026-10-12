const express = require('express');
const router = express.Router();
const {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');
const {
  getAssignmentSubmissions,
  getStudentSubmissions,
  submitWork,
  gradeSubmission
} = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .get(getAssignments)
  .post(authorize('admin', 'teacher'), createAssignment);

router.route('/:id')
  .put(authorize('admin', 'teacher'), updateAssignment)
  .delete(authorize('admin', 'teacher'), deleteAssignment);

// Submissions
router.get('/:assignmentId/submissions', getAssignmentSubmissions);
router.get('/student/:studentId/submissions', getStudentSubmissions);
router.post('/submit', authorize('student'), submitWork);
router.put('/submissions/:id/grade', authorize('admin', 'teacher'), gradeSubmission);

module.exports = router;
