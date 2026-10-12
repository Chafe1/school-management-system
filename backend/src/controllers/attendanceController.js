const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @desc Mark or update attendance (batch or single)
// @route POST /api/v1/attendance/mark
const markAttendance = async (req, res) => {
  try {
    const { gradeId, sectionId, date, records } = req.body;
    // records: [ { studentId, status, remarks } ]

    if (!gradeId || !sectionId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Invalid payload: gradeId, sectionId, date, and records array required' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const savedRecords = [];
    for (const item of records) {
      const record = await Attendance.findOneAndUpdate(
        {
          studentId: item.studentId,
          date: attendanceDate
        },
        {
          studentId: item.studentId,
          gradeId,
          sectionId,
          date: attendanceDate,
          status: item.status || 'present',
          remarks: item.remarks || '',
          markedBy: req.user._id
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      savedRecords.push(record);
    }

    res.json({
      success: true,
      message: `Successfully marked attendance for ${savedRecords.length} students`,
      records: savedRecords
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get student attendance summary and logs
// @route GET /api/v1/attendance/student/:studentId
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { studentId };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const records = await Attendance.find(query).sort({ date: -1 });

    const totalDays = records.length;
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const lateCount = records.filter(r => r.status === 'late').length;
    const excusedCount = records.filter(r => r.status === 'excused').length;

    const attendanceRate = totalDays > 0
      ? Number((((presentCount + (lateCount * 0.5)) / totalDays) * 100).toFixed(1))
      : 100.0;

    res.json({
      success: true,
      summary: {
        totalDays,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendanceRate
      },
      records
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get class attendance for a specific date
// @route GET /api/v1/attendance/class/:gradeId/:sectionId
const getClassAttendance = async (req, res) => {
  try {
    const { gradeId, sectionId } = req.params;
    const { date } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const records = await Attendance.find({
      gradeId,
      sectionId,
      date: targetDate
    }).populate({
      path: 'studentId',
      populate: { path: 'userId', select: 'firstName lastName email' }
    });

    res.json({ success: true, date: targetDate, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  markAttendance,
  getStudentAttendance,
  getClassAttendance
};
