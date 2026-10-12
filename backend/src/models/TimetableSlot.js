const mongoose = require('mongoose');

const timetableSlotSchema = new mongoose.Schema(
  {
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
      required: true
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 1, // 1: Monday
      max: 6  // 5 or 6: Friday/Saturday
    },
    period: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true
    },
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: true
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
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

// Indexes to speed up queries and prevent timetable conflicts
timetableSlotSchema.index({ academicYearId: 1, dayOfWeek: 1, period: 1, teacherId: 1 });
timetableSlotSchema.index({ academicYearId: 1, dayOfWeek: 1, period: 1, classroom: 1 });
timetableSlotSchema.index({ academicYearId: 1, dayOfWeek: 1, period: 1, gradeId: 1, sectionId: 1 });

module.exports = mongoose.model('TimetableSlot', timetableSlotSchema);
