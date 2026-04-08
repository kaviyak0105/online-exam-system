import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';

const ResultPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      const res = await API.get(`/result/my-result/${examId}`);
      setResult(res.data.result);
    } catch (error) {
      toast.error('Failed to fetch result!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading result...</div>;
  if (!result) return <div style={styles.loading}>Result not found!</div>;

  const correctAnswers = result.answers.filter(a => a.isCorrect).length;
  const wrongAnswers = result.answers.filter(a => !a.isCorrect).length;

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>🎓 Online Examination System</h2>
      </div>

      <div style={styles.content}>
        {/* Score Card */}
        <div style={{
          ...styles.scoreCard,
          borderTop: `6px solid ${result.isPassed ? '#38a169' : '#e53e3e'}`
        }}>
          <div style={styles.scoreIcon}>
            {result.isPassed ? '🎉' : '😔'}
          </div>
          <h2 style={{
            ...styles.scoreStatus,
            color: result.isPassed ? '#38a169' : '#e53e3e'
          }}>
            {result.isPassed ? 'Congratulations! You Passed!' : 'Better Luck Next Time!'}
          </h2>
          <h1 style={styles.scoreNumber}>
            {result.totalScore}/{result.examId?.totalMarks}
          </h1>
          <p style={styles.percentage}>{result.percentage}%</p>

          <div style={styles.statsRow}>
            <div style={styles.statItem}>
              <span style={styles.statValue}>{result.answers.length}</span>
              <span style={styles.statLabel}>Total</span>
            </div>
            <div style={{ ...styles.statItem, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
              <span style={{ ...styles.statValue, color: '#38a169' }}>{correctAnswers}</span>
              <span style={styles.statLabel}>Correct</span>
            </div>
            <div style={styles.statItem}>
              <span style={{ ...styles.statValue, color: '#e53e3e' }}>{wrongAnswers}</span>
              <span style={styles.statLabel}>Wrong</span>
            </div>
          </div>

          <div style={styles.btnRow}>
            <button
              onClick={() => navigate(`/leaderboard/${examId}`)}
              style={styles.leaderboardBtn}
            >
              🏆 View Leaderboard
            </button>
            <button
              onClick={() => navigate('/enter-code')}
              style={styles.homeBtn}
            >
              🏠 Back to Home
            </button>
          </div>
        </div>

        {/* Answers Review */}
        <div style={styles.reviewSection}>
          <h3 style={styles.reviewTitle}>📝 Answer Review</h3>

          {result.answers.map((answer, index) => (
            <div
              key={index}
              style={{
                ...styles.answerCard,
                borderLeft: `4px solid ${answer.isCorrect ? '#38a169' : '#e53e3e'}`
              }}
            >
              <div style={styles.answerHeader}>
                <span style={{
                  ...styles.answerBadge,
                  backgroundColor: answer.isCorrect ? '#c6f6d5' : '#fed7d7',
                  color: answer.isCorrect ? '#276749' : '#9b2c2c'
                }}>
                  {answer.isCorrect ? '✅ Correct' : '❌ Wrong'}
                </span>
                <span style={styles.marksBadge}>
                  {answer.marksAwarded}/{answer.questionId?.marks} marks
                </span>
              </div>

              <p style={styles.questionText}>
                {index + 1}. {answer.questionId?.questionText}
              </p>

              <div style={styles.optionsReview}>
                {answer.questionId?.options.map((opt) => (
                  <div
                    key={opt.optionLabel}
                    style={{
                      ...styles.optionReview,
                      backgroundColor:
                        opt.optionLabel === answer.questionId?.correctAnswer
                          ? '#c6f6d5'
                          : opt.optionLabel === answer.selectedAnswer && !answer.isCorrect
                          ? '#fed7d7'
                          : '#f7fafc',
                      color:
                        opt.optionLabel === answer.questionId?.correctAnswer
                          ? '#276749'
                          : opt.optionLabel === answer.selectedAnswer && !answer.isCorrect
                          ? '#9b2c2c'
                          : '#4a5568'
                    }}
                  >
                    <strong>{opt.optionLabel}:</strong> {opt.optionText}
                    {opt.optionLabel === answer.questionId?.correctAnswer && ' ✅'}
                    {opt.optionLabel === answer.selectedAnswer && !answer.isCorrect && ' ❌'}
                  </div>
                ))}
              </div>

              {!answer.isCorrect && (
                <p style={styles.correctAnswerText}>
                  ✅ Correct Answer: <strong>{answer.questionId?.correctAnswer}</strong>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px' },
  container: { minHeight: '100vh', backgroundColor: '#f0f2f5' },
  navbar: { backgroundColor: '#4c51bf', padding: '16px 24px' },
  navTitle: { color: '#fff', fontSize: '18px' },
  content: { padding: '24px', maxWidth: '800px', margin: '0 auto' },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
    marginBottom: '24px'
  },
  scoreIcon: { fontSize: '48px', marginBottom: '8px' },
  scoreStatus: { fontSize: '22px', fontWeight: '700', marginBottom: '16px' },
  scoreNumber: { fontSize: '48px', fontWeight: '700', color: '#2d3748', marginBottom: '4px' },
  percentage: { fontSize: '20px', color: '#718096', marginBottom: '24px' },
  statsRow: { display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '24px' },
  statItem: { padding: '12px 32px', textAlign: 'center' },
  statValue: { display: 'block', fontSize: '24px', fontWeight: '700', color: '#2d3748' },
  statLabel: { fontSize: '13px', color: '#718096' },
  btnRow: { display: 'flex', gap: '12px', justifyContent: 'center' },
  leaderboardBtn: {
    backgroundColor: '#4c51bf',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  homeBtn: {
    backgroundColor: '#e2e8f0',
    color: '#2d3748',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  reviewSection: { marginTop: '8px' },
  reviewTitle: { fontSize: '20px', color: '#2d3748', marginBottom: '16px' },
  answerCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    marginBottom: '16px'
  },
  answerHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  answerBadge: { padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '600' },
  marksBadge: { fontSize: '13px', color: '#718096' },
  questionText: { fontSize: '16px', color: '#2d3748', marginBottom: '12px', fontWeight: '500' },
  optionsReview: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' },
  optionReview: { padding: '8px 12px', borderRadius: '6px', fontSize: '14px' },
  correctAnswerText: { fontSize: '14px', color: '#38a169', marginTop: '8px' }
};

export default ResultPage;