const express = require('express');
const router = express.Router();
const {
  getGrades,
  createGrade,
  deleteGrade,
  getSections,
  createSection,
  deleteSection,
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getAcademicYears,
  getCurrentAcademicYear,
  createAcademicYear,
  setCurrentAcademicYear
} = require('../controllers/academicController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Grades
router.get('/grades', protect, getGrades);
router.post('/grades', protect, authorize('admin'), createGrade);
router.delete('/grades/:id', protect, authorize('admin'), deleteGrade);

// Sections
router.get('/sections', protect, getSections);
router.post('/sections', protect, authorize('admin'), createSection);
router.delete('/sections/:id', protect, authorize('admin'), deleteSection);

// Subjects
router.get('/subjects', protect, getSubjects);
router.post('/subjects', protect, authorize('admin'), createSubject);
router.put('/subjects/:id', protect, authorize('admin'), updateSubject);
router.delete('/subjects/:id', protect, authorize('admin'), deleteSubject);

// Academic Years
router.get('/academic-years', protect, getAcademicYears);
router.get('/academic-years/current', protect, getCurrentAcademicYear);
router.post('/academic-years', protect, authorize('admin'), createAcademicYear);
router.put('/academic-years/:id/current', protect, authorize('admin'), setCurrentAcademicYear);

module.exports = router;
