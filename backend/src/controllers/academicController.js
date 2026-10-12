const Grade = require('../models/Grade');
const Section = require('../models/Section');
const Subject = require('../models/Subject');
const AcademicYear = require('../models/AcademicYear');

// --- GRADES ---
const getGrades = async (req, res) => {
  try {
    const grades = await Grade.find().sort({ level: 1 });
    res.json({ success: true, count: grades.length, grades });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createGrade = async (req, res) => {
  try {
    const { level, name } = req.body;
    const grade = await Grade.create({ level, name });
    res.status(201).json({ success: true, grade });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteGrade = async (req, res) => {
  try {
    await Grade.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Grade deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- SECTIONS ---
const getSections = async (req, res) => {
  try {
    const { gradeId } = req.query;
    const query = gradeId ? { gradeId } : {};
    const sections = await Section.find(query).populate('gradeId', 'level name').sort({ name: 1 });
    res.json({ success: true, count: sections.length, sections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createSection = async (req, res) => {
  try {
    const { name, gradeId, room } = req.body;
    const section = await Section.create({ name, gradeId, room });
    res.status(201).json({ success: true, section });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteSection = async (req, res) => {
  try {
    await Section.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Section deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- SUBJECTS ---
const getSubjects = async (req, res) => {
  try {
    const { gradeId } = req.query;
    const query = gradeId ? { gradeId } : {};
    const subjects = await Subject.find(query).populate('gradeId', 'level name').sort({ code: 1 });
    res.json({ success: true, count: subjects.length, subjects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createSubject = async (req, res) => {
  try {
    const { name, code, gradeId, isElective, credits } = req.body;
    const subject = await Subject.create({ name, code, gradeId, isElective, credits });
    res.status(201).json({ success: true, subject });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, subject });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- ACADEMIC YEARS ---
const getAcademicYears = async (req, res) => {
  try {
    const academicYears = await AcademicYear.find().sort({ startDate: -1 });
    res.json({ success: true, count: academicYears.length, academicYears });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCurrentAcademicYear = async (req, res) => {
  try {
    let current = await AcademicYear.findOne({ isCurrent: true });
    if (!current) {
      current = await AcademicYear.findOne().sort({ startDate: -1 });
    }
    res.json({ success: true, academicYear: current });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createAcademicYear = async (req, res) => {
  try {
    const { name, startDate, endDate, isCurrent, terms } = req.body;
    if (isCurrent) {
      await AcademicYear.updateMany({}, { isCurrent: false });
    }
    const year = await AcademicYear.create({ name, startDate, endDate, isCurrent, terms });
    res.status(201).json({ success: true, academicYear: year });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const setCurrentAcademicYear = async (req, res) => {
  try {
    await AcademicYear.updateMany({}, { isCurrent: false });
    const year = await AcademicYear.findByIdAndUpdate(req.params.id, { isCurrent: true }, { new: true });
    res.json({ success: true, academicYear: year });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
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
};
