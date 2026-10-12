const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Grade = require('../models/Grade');

// @desc Get enrollments
// @route GET /api/v1/enrollments
const getEnrollments = async (req, res) => {
  try {
    const { gradeId, sectionId, academicYearId } = req.query;
    const query = { isActive: true };
    if (gradeId) query.gradeId = gradeId;
    if (sectionId) query.sectionId = sectionId;
    if (academicYearId) query.academicYearId = academicYearId;

    const enrollments = await Enrollment.find(query)
      .populate({
        path: 'studentId',
        populate: [
          { path: 'userId', select: 'firstName lastName email contact profilePicture' },
          { path: 'parentIds', select: 'firstName lastName email contact' }
        ]
      })
      .populate('gradeId', 'level name')
      .populate('sectionId', 'name room')
      .populate('academicYearId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: enrollments.length, enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Enroll a student
// @route POST /api/v1/enrollments
const enrollStudent = async (req, res) => {
  try {
    const { studentId, academicYearId, gradeId, sectionId } = req.body;

    // Check if already enrolled in this academic year
    const existing = await Enrollment.findOne({ studentId, academicYearId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this academic year'
      });
    }

    const enrollment = await Enrollment.create({
      studentId,
      academicYearId,
      gradeId,
      sectionId
    });

    const populated = await Enrollment.findById(enrollment._id)
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'firstName lastName email' }
      })
      .populate('gradeId', 'level name')
      .populate('sectionId', 'name');

    res.status(201).json({ success: true, enrollment: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc Get student's current enrollment
// @route GET /api/v1/enrollments/student/:studentId
const getStudentEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      studentId: req.params.studentId,
      isActive: true
    })
      .populate('gradeId', 'level name')
      .populate('sectionId', 'name room')
      .populate('academicYearId', 'name terms')
      .sort({ createdAt: -1 });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Active enrollment not found' });
    }

    res.json({ success: true, enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Promote / rollover student to next grade
// @route PUT /api/v1/enrollments/:id/rollover
const rolloverStudent = async (req, res) => {
  try {
    const { nextAcademicYearId, nextSectionId } = req.body;
    const currentEnrollment = await Enrollment.findById(req.params.id).populate('gradeId');
    if (!currentEnrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found' });
    }

    const currentLevel = currentEnrollment.gradeId.level;
    if (currentLevel >= 12) {
      // Mark as graduated
      currentEnrollment.isActive = false;
      currentEnrollment.history.push({
        previousGrade: currentEnrollment.gradeId.name,
        action: 'Graduated',
        date: new Date(),
        note: 'Completed Grade 12 High School Curriculum'
      });
      await currentEnrollment.save();
      return res.json({
        success: true,
        message: 'Student has graduated from Grade 12 High School!',
        enrollment: currentEnrollment
      });
    }

    const nextGrade = await Grade.findOne({ level: currentLevel + 1 });
    if (!nextGrade) {
      return res.status(400).json({ success: false, message: 'Next grade level does not exist' });
    }

    // Deactivate old enrollment
    currentEnrollment.isActive = false;
    currentEnrollment.history.push({
      previousGrade: currentEnrollment.gradeId.name,
      action: `Promoted to ${nextGrade.name}`,
      date: new Date(),
      note: `Rollover to Academic Year`
    });
    await currentEnrollment.save();

    // Create new enrollment
    const newEnrollment = await Enrollment.create({
      studentId: currentEnrollment.studentId,
      academicYearId: nextAcademicYearId || currentEnrollment.academicYearId,
      gradeId: nextGrade._id,
      sectionId: nextSectionId || currentEnrollment.sectionId,
      history: currentEnrollment.history
    });

    res.json({
      success: true,
      message: `Student successfully promoted to ${nextGrade.name}`,
      enrollment: newEnrollment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getEnrollments,
  enrollStudent,
  getStudentEnrollment,
  rolloverStudent
};
