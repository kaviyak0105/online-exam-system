const express = require('express');
const router = express.Router();
const {
  addQuestion,
  getQuestionsByExam,
  getQuestionsByPart,
  updateQuestion,
  deleteQuestion
} = require('../controllers/question.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// Admin routes
router.post('/add', authMiddleware, adminMiddleware, addQuestion);
router.put('/update/:id', authMiddleware, adminMiddleware, updateQuestion);
router.delete('/delete/:id', authMiddleware, adminMiddleware, deleteQuestion);

// Common routes
router.get('/exam/:examId', authMiddleware, getQuestionsByExam);
router.get('/exam/:examId/part/:partNumber', authMiddleware, getQuestionsByPart);

router.get('/:questionId', authMiddleware, async (req, res) => {
  try {
    const question = await require('../models/Question').findById(req.params.questionId);
    if (!question) return res.status(404).json({ message: 'Question not found!' });
    res.status(200).json({ question });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
});

module.exports = router;