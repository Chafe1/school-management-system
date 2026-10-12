const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// @desc Get assignments
// @route GET /api/v1/assignments
const getAssignments = async (req, res) => {
  try {
    const { gradeId, sectionId, subjectId, teacherId } = req.query;
    const query = {};
    if (gradeId) query.gradeId = gradeId;
    if (sectionId) query.sectionId = sectionId;
    if (subjectId) query.subjectId = subjectId;
    if (teacherId) query.teacherId = teacherId;

    const assignments = await Assignment.find(query)
      .populate('subjectId', 'name code')
      .populate({
        path: 'teacherId',
        populate: { path: 'userId', select: 'firstName lastName email' }
      })
      .populate('gradeId', 'level name')
      .populate('sectionId', 'name')
      .sort({ dueDate: 1 });

    res.json({ success: true, count: assignments.length, assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create assignment
// @route POST /api/v1/assignments
const createAssignment = async (req, res) => {
  try {
    const { title, description, subjectId, teacherId, gradeId, sectionId, dueDate, totalMarks, type } = req.body;
    const assignment = await Assignment.create({
      title,
      description,
      subjectId,
      teacherId: teacherId || req.teacher?._id,
      gradeId,
      sectionId,
      dueDate,
      totalMarks: totalMarks || 100,
      type: type || 'homework'
    });

    const populated = await Assignment.findById(assignment._id)
      .populate('subjectId', 'name code')
      .populate('gradeId', 'level name')
      .populate('sectionId', 'name');

    res.status(201).json({ success: true, assignment: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc Update assignment
// @route PUT /api/v1/assignments/:id
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, assignment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc Delete assignment
// @route DELETE /api/v1/assignments/:id
const deleteAssignment = async (req, res) => {
  try {
    await Submission.deleteMany({ assignmentId: req.params.id });
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Assignment and related submissions deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment
};
