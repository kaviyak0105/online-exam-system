const express = require('express');
const router = express.Router();
const {
  createExam,
  getAllExams,
  getExamById,
  verifyExamCode,
  updateExam,
  deleteExam
} = require('../controllers/exam.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware');

// Admin routes
router.post('/create', authMiddleware, adminMiddleware, createExam);
router.get('/all', authMiddleware, adminMiddleware, getAllExams);
router.put('/update/:id', authMiddleware, adminMiddleware, updateExam);
router.delete('/delete/:id', authMiddleware, adminMiddleware, deleteExam);

// Common routes
router.get('/:id', authMiddleware, getExamById);
router.post('/verify-code', authMiddleware, verifyExamCode);

module.exports = router;