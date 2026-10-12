const express = require('express');
const router = express.Router();
const {
  getStudentTranscript,
  getDashboardStats
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/transcript/:studentId', getStudentTranscript);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;
