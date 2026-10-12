const Submission = require('../models/Submission');

// @desc Get submissions for an assignment
// @route GET /api/v1/submissions/assignment/:assignmentId
const getAssignmentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignmentId: req.params.assignmentId })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'firstName lastName email' }
      })
      .sort({ submittedAt: -1 });

    res.json({ success: true, count: submissions.length, submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get submissions of a student
// @route GET /api/v1/submissions/student/:studentId
const getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.params.studentId })
      .populate({
        path: 'assignmentId',
        populate: { path: 'subjectId', select: 'name code' }
      })
      .sort({ submittedAt: -1 });

    res.json({ success: true, count: submissions.length, submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Submit assignment work
// @route POST /api/v1/submissions
const submitWork = async (req, res) => {
  try {
    const { assignmentId, studentId, content, fileUrl } = req.body;
    const sId = studentId || req.student?._id;

    if (!sId) {
      return res.status(400).json({ success: false, message: 'Student ID required' });
    }

    const submission = await Submission.findOneAndUpdate(
      { assignmentId, studentId: sId },
      {
        assignmentId,
        studentId: sId,
        content: content || '',
        fileUrl: fileUrl || '',
        status: 'submitted',
        submittedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, message: 'Assignment submitted successfully', submission });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc Grade submission (Teacher/Admin)
// @route PUT /api/v1/submissions/:id/grade
const gradeSubmission = async (req, res) => {
  try {
    const { obtainedMarks, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      {
        obtainedMarks: Number(obtainedMarks),
        feedback: feedback || '',
        status: 'graded'
      },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({ success: true, message: 'Marks awarded successfully', submission });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAssignmentSubmissions,
  getStudentSubmissions,
  submitWork,
  gradeSubmission
};
