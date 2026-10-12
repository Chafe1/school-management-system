const mongoose = require('mongoose');

const examScheduleSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: true
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section'
    },
    date: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    classroom: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

examScheduleSchema.index({ date: 1, startTime: 1, classroom: 1 });
examScheduleSchema.index({ examId: 1, gradeId: 1, subjectId: 1 });

module.exports = mongoose.model('ExamSchedule', examScheduleSchema);
