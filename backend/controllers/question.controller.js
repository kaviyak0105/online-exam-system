const Question = require('../models/Question');

// Add Question (Admin only)
const addQuestion = async (req, res) => {
  try {
    const { examId, partNumber, questionText, options, correctAnswer, marks } = req.body;

    const question = await Question.create({
      examId,
      partNumber,
      questionText,
      options,
      correctAnswer,
      marks: Number(marks)
    });

    res.status(201).json({
      message: 'Question added successfully!',
      question
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

// Get All Questions by Exam ID
const getQuestionsByExam = async (req, res) => {
  try {
    const questions = await Question.find({ examId: req.params.examId });
    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

// Get Questions by Exam ID + Part Number
const getQuestionsByPart = async (req, res) => {
  try {
    const { examId, partNumber } = req.params;
    const questions = await Question.find({ examId, partNumber });
    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

// Update Question (Admin only)
const updateQuestion = async (req, res) => {
  try {
    if (req.body.marks) {
      req.body.marks = Number(req.body.marks);
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found!' });
    }

    res.status(200).json({ message: 'Question updated successfully!', question });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

// Delete Question (Admin only)
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found!' });
    }
    res.status(200).json({ message: 'Question deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

module.exports = {
  addQuestion,
  getQuestionsByExam,
  getQuestionsByPart,
  updateQuestion,
  deleteQuestion
};