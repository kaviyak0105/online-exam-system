const express = require('express');
const router = express.Router();
const {
  submitExam,
  getStudentResult,
  getLeaderboard,
  getAllResults
} = require('../controllers/result.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

router.post('/submit', authMiddleware, submitExam);
router.get('/my-result/:examId', authMiddleware, getStudentResult);
router.get('/leaderboard/:examId', authMiddleware, getLeaderboard);
router.get('/all/:examId', authMiddleware, adminMiddleware, getAllResults);

router.get('/my-all-results', authMiddleware, async (req, res) => {
  try {
    const results = await require('../models/Result').find({ studentId: req.user.id })
      .populate('examId', 'title totalMarks')
      .sort({ submittedAt: -1 });
    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
});

module.exports = router;