const express = require('express');
const router = express.Router();
const {
  saveProgress,
  getProgress,
  clearProgress,
  checkExamStatus
} = require('../controllers/progress.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/save', authMiddleware, saveProgress);
router.get('/get/:examId', authMiddleware, getProgress);
router.delete('/clear/:examId', authMiddleware, clearProgress);
router.get('/status/:examId', authMiddleware, checkExamStatus);

module.exports = router;