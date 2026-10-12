const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Section name is required'],
      trim: true
    },
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      required: [true, 'Grade reference is required']
    },
    room: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Unique section name per grade
sectionSchema.index({ name: 1, gradeId: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
