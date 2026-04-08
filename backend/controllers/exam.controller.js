const Exam = require('../models/Exam');
const crypto = require('crypto');

// Generate unique exam code
const generateExamCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase(); // Ex: "A3F9B2C1"
};

// Create Exam (Admin only)
const createExam = async (req, res) => {
  try {
    const { title, description, duration, parts, totalMarks, passMarkPercentage } = req.body;

    const examCode = generateExamCode();

    const exam = await Exam.create({
      title,
      description,
      examCode,
      duration,
      parts,
      totalMarks,
      passMarkPercentage,
      createdBy: req.user.id
    });

    res.status(201).json({
      message: 'Exam created successfully!',
      exam
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

// Get All Exams (Admin only)
const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate('createdBy', 'name email');
    res.status(200).json({ exams });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

// Get Single Exam by ID
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found!' });
    }
    res.status(200).json({ exam });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

// Verify Exam Code (Student)
const verifyExamCode = async (req, res) => {
  try {
    const { examCode } = req.body;

    const exam = await Exam.findOne({ examCode, isActive: true });
    if (!exam) {
      return res.status(404).json({ message: 'Invalid exam code!' });
    }

    res.status(200).json({
      message: 'Exam code verified!',
      exam: {
        id: exam._id,
        title: exam.title,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        parts: exam.parts
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

// Update Exam (Admin only)
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found!' });
    }
    res.status(200).json({ message: 'Exam updated successfully!', exam });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

// Delete Exam (Admin only)
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found!' });
    }
    res.status(200).json({ message: 'Exam deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

module.exports = {
  createExam,
  getAllExams,
  getExamById,
  verifyExamCode,
  updateExam,
  deleteExam
};