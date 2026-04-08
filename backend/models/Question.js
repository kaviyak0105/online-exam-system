const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  partNumber: {
    type: Number,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: [
    {
      optionLabel: { type: String, required: true },
      optionText: { type: String, required: true }
    }
  ],
  correctAnswer: {
    type: String,
    required: true
  },
  marks: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);