const Result = require('../models/Result');
const Question = require('../models/Question');
const Exam = require('../models/Exam');
const Progress = require('../models/Progress');

const submitExam = async (req, res) => {
  try {
    const { examId, answers, timeTaken } = req.body;
    const studentId = req.user.id;

    const alreadySubmitted = await Result.findOne({ studentId, examId });
    if (alreadySubmitted) {
      return res.status(400).json({ message: 'Exam already submitted!' });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found!' });

    const questions = await Question.find({ examId });

    let totalScore = 0;
    const evaluatedAnswers = answers.map((answer) => {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId
      );
      if (!question) return { ...answer, isCorrect: false, marksAwarded: 0 };

      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      const marksAwarded = isCorrect ? question.marks : 0;
      totalScore += marksAwarded;

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        marksAwarded
      };
    });

    const percentage = (totalScore / exam.totalMarks) * 100;
    const isPassed = percentage >= exam.passMarkPercentage;

    const result = await Result.create({
      studentId,
      examId,
      answers: evaluatedAnswers,
      totalScore,
      percentage: percentage.toFixed(2),
      isPassed,
      timeTaken,
      submittedAt: new Date()
    });

    await Progress.findOneAndDelete({ studentId, examId });

    res.status(201).json({
      message: 'Exam submitted successfully!',
      result: {
        totalScore,
        totalMarks: exam.totalMarks,
        percentage: percentage.toFixed(2),
        isPassed,
        timeTaken
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

const getStudentResult = async (req, res) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;

    const result = await Result.findOne({ studentId, examId })
      .populate('examId', 'title totalMarks passMarkPercentage')
      .populate('answers.questionId', 'questionText options correctAnswer marks');

    if (!result) return res.status(404).json({ message: 'Result not found!' });

    res.status(200).json({ result });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const { examId } = req.params;

    const results = await Result.find({ examId })
      .populate('studentId', 'name email')
      .sort({ totalScore: -1, timeTaken: 1 });

    const leaderboard = results.map((result, index) => ({
      rank: index + 1,
      studentName: result.studentId.name,
      email: result.studentId.email,
      totalScore: result.totalScore,
      percentage: result.percentage,
      isPassed: result.isPassed,
      timeTaken: result.timeTaken
    }));

    res.status(200).json({ leaderboard });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

const getAllResults = async (req, res) => {
  try {
    const { examId } = req.params;

    const results = await Result.find({ examId })
      .populate('studentId', 'name email')
      .populate('examId', 'title totalMarks')
      .sort({ totalScore: -1 });

    res.status(200).json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error!', error });
  }
};

module.exports = {
  submitExam,
  getStudentResult,
  getLeaderboard,
  getAllResults
};