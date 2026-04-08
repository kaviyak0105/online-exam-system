const Progress = require('../models/Progress');
const Result = require('../models/Result');

// Save Progress (Auto save)
const saveProgress = async (req, res) => {
  try {
    const { examId, answers, currentQuestion, timeRemaining } = req.body;
    const studentId = req.user.id;

    // Already submitted check
    const alreadySubmitted = await Result.findOne({ studentId, examId });
    if (alreadySubmitted) {
      return res.status(400).json({ message: 'Exam already submitted!' });
    }

    // Progress update or create
    const progress = await Progress.findOneAndUpdate(
      { studentId, examId },
      {
        studentId,
        examId,
        answers,
        currentQuestion,
        timeRemaining,
        isStarted: true
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: 'Progress saved!',
      progress
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

// Get Progress
const getProgress = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    // Already submitted check
    const alreadySubmitted = await Result.findOne({ studentId, examId });
    if (alreadySubmitted) {
      return res.status(400).json({ message: 'Exam already submitted! Cannot resume.' });
    }

    const progress = await Progress.findOne({ studentId, examId });

    if (!progress) {
      return res.status(404).json({ message: 'No progress found!' });
    }

    res.status(200).json({ progress });

  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

// Clear Progress (after submit)
const clearProgress = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    await Progress.findOneAndDelete({ studentId, examId });

    res.status(200).json({ message: 'Progress cleared!' });

  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

// Check Exam Status (already submitted or not)
const checkExamStatus = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    const alreadySubmitted = await Result.findOne({ studentId, examId });
    if (alreadySubmitted) {
      return res.status(200).json({
        status: 'submitted',
        message: 'Exam already submitted!'
      });
    }

    const progress = await Progress.findOne({ studentId, examId });
    if (progress) {
      return res.status(200).json({
        status: 'in-progress',
        message: 'Exam in progress!',
        progress
      });
    }

    res.status(200).json({
      status: 'not-started',
      message: 'Exam not started yet!'
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

module.exports = {
  saveProgress,
  getProgress,
  clearProgress,
  checkExamStatus
};