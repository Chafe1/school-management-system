const GradeRecord = require('../models/GradeRecord');
const { calculateGrade, calculateCumulativeGpa } = require('../utils/gradeCalculator');

// @desc Record or update grade for a student in a subject & term
// @route POST /api/v1/grades/record
const recordGrade = async (req, res) => {
  try {
    const {
      studentId,
      academicYearId,
      termId,
      termName,
      subjectId,
      obtainedMarks,
      maxMarks,
      teacherRemarks
    } = req.body;

    const total = Number(maxMarks) || 100;
    const obtained = Number(obtainedMarks);
    const percentage = Number(((obtained / total) * 100).toFixed(1));
    const { letter, gpa } = calculateGrade(percentage);

    const record = await GradeRecord.findOneAndUpdate(
      { studentId, academicYearId, termId, subjectId },
      {
        studentId,
        academicYearId,
        termId,
        termName: termName || '',
        subjectId,
        obtainedMarks: obtained,
        maxMarks: total,
        percentage,
        letterGrade: letter,
        gpaPoint: gpa,
        teacherRemarks: teacherRemarks || '',
        isFinalized: true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const populated = await GradeRecord.findById(record._id)
      .populate('subjectId', 'name code credits')
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'firstName lastName email' }
      });

    res.json({
      success: true,
      message: 'Grade recorded successfully',
      gradeRecord: populated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get student grades with overall GPA calculation
// @route GET /api/v1/grades/student/:studentId
const getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { termId, academicYearId } = req.query;

    const query = { studentId };
    if (termId) query.termId = termId;
    if (academicYearId) query.academicYearId = academicYearId;

    const records = await GradeRecord.find(query)
      .populate('subjectId', 'name code credits isElective')
      .sort({ createdAt: -1 });

    const cumulativeGpa = calculateCumulativeGpa(records);

    res.json({
      success: true,
      cumulativeGpa,
      count: records.length,
      records
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get class grade summary / distribution
// @route GET /api/v1/grades/summary
const getGradeSummary = async (req, res) => {
  try {
    const records = await GradeRecord.find();
    const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };

    records.forEach((r) => {
      const letter = r.letterGrade?.charAt(0);
      if (distribution[letter] !== undefined) {
        distribution[letter]++;
      }
    });

    res.json({ success: true, totalRecords: records.length, distribution });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  recordGrade,
  getStudentGrades,
  getGradeSummary
};
