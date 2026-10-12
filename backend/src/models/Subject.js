const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade'
    },
    isElective: {
      type: Boolean,
      default: false
    },
    credits: {
      type: Number,
      default: 1.0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Subject', subjectSchema);
