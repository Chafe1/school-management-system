const TimetableSlot = require('../models/TimetableSlot');

// @desc Get timetable slots
// @route GET /api/v1/timetable/slots
const getSlots = async (req, res) => {
  try {
    const { academicYearId, gradeId, sectionId, teacherId, dayOfWeek } = req.query;
    const query = {};
    if (academicYearId) query.academicYearId = academicYearId;
    if (gradeId) query.gradeId = gradeId;
    if (sectionId) query.sectionId = sectionId;
    if (teacherId) query.teacherId = teacherId;
    if (dayOfWeek) query.dayOfWeek = Number(dayOfWeek);

    const slots = await TimetableSlot.find(query)
      .populate('subjectId', 'name code')
      .populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'firstName lastName email' }
      })
      .populate('gradeId', 'level name')
      .populate('sectionId', 'name room')
      .sort({ dayOfWeek: 1, period: 1 });

    res.json({ success: true, count: slots.length, slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create timetable slot with conflict check
// @route POST /api/v1/timetable/slots
const createSlot = async (req, res) => {
  try {
    const {
      academicYearId,
      dayOfWeek,
      period,
      startTime,
      endTime,
      subjectId,
      teacherId,
      gradeId,
      sectionId,
      classroom
    } = req.body;

    // 1. Check teacher conflict
    const teacherConflict = await TimetableSlot.findOne({
      academicYearId,
      dayOfWeek,
      period,
      teacherId
    }).populate('subjectId gradeId sectionId');
    if (teacherConflict) {
      return res.status(409).json({
        success: false,
        message: `Teacher conflict: Teacher is already teaching ${teacherConflict.subjectId?.name} for ${teacherConflict.gradeId?.name}-${teacherConflict.sectionId?.name} in Period ${period} on this day.`
      });
    }

    // 2. Check room conflict
    const roomConflict = await TimetableSlot.findOne({
      academicYearId,
      dayOfWeek,
      period,
      classroom: classroom.trim()
    }).populate('gradeId sectionId');
    if (roomConflict) {
      return res.status(409).json({
        success: false,
        message: `Classroom conflict: Classroom ${classroom} is already occupied by ${roomConflict.gradeId?.name}-${roomConflict.sectionId?.name} in Period ${period}.`
      });
    }

    // 3. Check section conflict
    const sectionConflict = await TimetableSlot.findOne({
      academicYearId,
      dayOfWeek,
      period,
      gradeId,
      sectionId
    }).populate('subjectId');
    if (sectionConflict) {
      return res.status(409).json({
        success: false,
        message: `Class conflict: This class already has ${sectionConflict.subjectId?.name} scheduled in Period ${period}.`
      });
    }

    const slot = await TimetableSlot.create({
      academicYearId,
      dayOfWeek,
      period,
      startTime,
      endTime,
      subjectId,
      teacherId,
      gradeId,
      sectionId,
      classroom
    });

    const populated = await TimetableSlot.findById(slot._id)
      .populate('subjectId', 'name code')
      .populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'firstName lastName email' }
      })
      .populate('gradeId', 'level name')
      .populate('sectionId', 'name');

    res.status(201).json({ success: true, slot: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc Delete timetable slot
// @route DELETE /api/v1/timetable/slots/:id
const deleteSlot = async (req, res) => {
  try {
    await TimetableSlot.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Timetable slot deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get class timetable
// @route GET /api/v1/timetable/class/:gradeId/:sectionId
const getClassTimetable = async (req, res) => {
  try {
    const { gradeId, sectionId } = req.params;
    const slots = await TimetableSlot.find({ gradeId, sectionId })
      .populate('subjectId', 'name code')
      .populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'firstName lastName' }
      })
      .populate('gradeId', 'level name')
      .populate('sectionId', 'name')
      .sort({ dayOfWeek: 1, period: 1 });

    res.json({ success: true, slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get teacher timetable
// @route GET /api/v1/timetable/teacher/:teacherId
const getTeacherTimetable = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const slots = await TimetableSlot.find({ teacherId })
      .populate('subjectId', 'name code')
      .populate('gradeId', 'level name')
      .populate('sectionId', 'name')
      .sort({ dayOfWeek: 1, period: 1 });

    res.json({ success: true, slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSlots,
  createSlot,
  deleteSlot,
  getClassTimetable,
  getTeacherTimetable
};
