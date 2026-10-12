const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    level: {
      type: Number,
      required: [true, 'Grade level is required (9-12)'],
      min: 9,
      max: 12,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Grade name is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Grade', gradeSchema);
