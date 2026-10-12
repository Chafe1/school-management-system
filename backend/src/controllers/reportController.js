const Student = require('../models/Student');
const User = require('../models/User');
const GradeRecord = require('../models/GradeRecord');
const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const Teacher = require('../models/Teacher');
const Grade = require('../models/Grade');
const { calculateCumulativeGpa } = require('../utils/gradeCalculator');

// @desc Generate comprehensive transcript / report card data
// @route GET /api/v1/reports/transcript/:studentId
const getStudentTranscript = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId)
      .populate('userId', 'firstName lastName email contact profilePicture')
      .populate('parentIds', 'firstName lastName email contact');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const enrollment = await Enrollment.findOne({ studentId, isActive: true })
      .populate('gradeId', 'level name')
      .populate('sectionId', 'name room')
      .populate('academicYearId', 'name terms');

    const gradeRecords = await GradeRecord.find({ studentId })
      .populate('subjectId', 'name code credits isElective')
      .sort({ createdAt: 1 });

    const cumulativeGpa = calculateCumulativeGpa(gradeRecords);

    // Attendance summary
    const attendanceRecords = await Attendance.find({ studentId });
    const totalDays = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
    const lateCount = attendanceRecords.filter(a => a.status === 'late').length;
    const absentCount = attendanceRecords.filter(a => a.status === 'absent').length;
    const attendanceRate = totalDays > 0
      ? Number((((presentCount + (lateCount * 0.5)) / totalDays) * 100).toFixed(1))
      : 100.0;

    const transcript = {
      schoolName: 'Westlake Academic High School (Grades 9–12)',
      schoolAddress: '1000 Academy Way, Cambridge, MA',
      issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      student: {
        id: student._id,
        fullName: student.userId ? `${student.userId.firstName} ${student.userId.lastName}` : 'N/A',
        email: student.userId?.email,
        enrollmentNo: student.enrollmentNo,
        dateOfBirth: student.dateOfBirth,
        contact: student.userId?.contact,
        parents: student.parentIds
      },
      academic: {
        grade: enrollment?.gradeId?.name || 'High School Grade',
        section: enrollment?.sectionId?.name || 'A',
        academicYear: enrollment?.academicYearId?.name || '2025-2026',
        cumulativeGpa,
        totalCredits: gradeRecords.reduce((acc, curr) => acc + (curr.subjectId?.credits || 1.0), 0)
      },
      grades: gradeRecords,
      attendance: {
        totalDays,
        presentCount,
        absentCount,
        lateCount,
        attendanceRate
      }
    };

    res.json({ success: true, transcript });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc High level dashboard overview statistics
// @route GET /api/v1/reports/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalGrades = await Grade.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments({ isActive: true });

    // Average attendance rate across school
    const allAttendance = await Attendance.find();
    let overallAttendanceRate = 96.5; // realistic default
    if (allAttendance.length > 0) {
      const present = allAttendance.filter(a => a.status === 'present').length;
      const late = allAttendance.filter(a => a.status === 'late').length;
      overallAttendanceRate = Number((((present + (late * 0.5)) / allAttendance.length) * 100).toFixed(1));
    }

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalGrades,
        totalEnrollments,
        overallAttendanceRate
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getStudentTranscript,
  getDashboardStats
};
