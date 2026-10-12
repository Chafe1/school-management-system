const Exam = require('../models/Exam');
const ExamSchedule = require('../models/ExamSchedule');

// --- EXAMS ---
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate('academicYearId', 'name').sort({ startDate: -1 });
    res.json({ success: true, count: exams.length, exams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createExam = async (req, res) => {
  try {
    const { name, academicYearId, termId, startDate, endDate } = req.body;
    const exam = await Exam.create({ name, academicYearId, termId, startDate, endDate });
    res.status(201).json({ success: true, exam });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteExam = async (req, res) => {
  try {
    await ExamSchedule.deleteMany({ examId: req.params.id });
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Exam and associated schedules deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- EXAM SCHEDULES ---
const getExamSchedules = async (req, res) => {
  try {
    const { examId, gradeId, subjectId } = req.query;
    const query = {};
    if (examId) query.examId = examId;
    if (gradeId) query.gradeId = gradeId;
    if (subjectId) query.subjectId = subjectId;

    const schedules = await ExamSchedule.find(query)
      .populate('examId', 'name startDate endDate')
      .populate('subjectId', 'name code')
      .populate('gradeId', 'level name')
      .populate('sectionId', 'name')
      .sort({ date: 1, startTime: 1 });

    res.json({ success: true, count: schedules.length, schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createExamSchedule = async (req, res) => {
  try {
    const { examId, subjectId, gradeId, sectionId, date, startTime, endTime, classroom } = req.body;

    // Check room conflict
    const conflict = await ExamSchedule.findOne({
      date: new Date(date),
      startTime,
      classroom: classroom.trim()
    }).populate('subjectId gradeId');

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: `Classroom conflict: ${classroom} is already scheduled for ${conflict.subjectId?.name} (${conflict.gradeId?.name}) at this time.`
      });
    }

    const schedule = await ExamSchedule.create({
      examId,
      subjectId,
      gradeId,
      sectionId,
      date,
      startTime,
      endTime,
      classroom
    });

    const populated = await ExamSchedule.findById(schedule._id)
      .populate('examId', 'name')
      .populate('subjectId', 'name code')
      .populate('gradeId', 'level name');

    res.status(201).json({ success: true, schedule: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteExamSchedule = async (req, res) => {
  try {
    await ExamSchedule.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Exam schedule deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getExams,
  createExam,
  deleteExam,
  getExamSchedules,
  createExamSchedule,
  deleteExamSchedule
};
