const mongoose = require('mongoose');

const gradeRecordSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true
    },
    termId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    termName: {
      type: String,
      default: ''
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    obtainedMarks: {
      type: Number,
      required: true,
      min: 0
    },
    maxMarks: {
      type: Number,
      default: 100
    },
    percentage: {
      type: Number,
      required: true
    },
    letterGrade: {
      type: String,
      required: true
    },
    gpaPoint: {
      type: Number,
      required: true,
      default: 4.0
    },
    teacherRemarks: {
      type: String,
      default: ''
    },
    isFinalized: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

gradeRecordSchema.index(
  { studentId: 1, academicYearId: 1, termId: 1, subjectId: 1 },
  { unique: true }
);

module.exports = mongoose.model('GradeRecord', gradeRecordSchema);
