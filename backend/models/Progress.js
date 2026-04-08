const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      },
      selectedAnswer: {
        type: String  // "A" or "B" or "C" or "D"
      }
    }
  ],
  currentQuestion: {
    type: Number,
    default: 0  // ippov ethana question la irukanga
  },
  timeRemaining: {
    type: Number  // seconds la irukum
  },
  isSubmitted: {
    type: Boolean,
    default: false
  },
  isStarted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);