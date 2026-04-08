const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  examCode: {
    type: String,
    required: true,
    unique: true
  },
  duration: {
    type: Number,  // minutes la irukum
    required: true
  },
  parts: [
    {
      partName: {
        type: String,  // "Part 1", "Part 2"
        required: true
      },
      partNumber: {
        type: Number,
        required: true
      }
    }
  ],
  totalMarks: {
    type: Number,
    required: true
  },
  passMarkPercentage: {
    type: Number,
    default: 40  // 40% pass mark
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'  // Admin reference
  }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);