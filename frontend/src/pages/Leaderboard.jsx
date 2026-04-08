import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';

const Leaderboard = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    fetchExam();
  }, []);

  const fetchExam = async () => {
    try {
      const res = await API.get(`/exam/${examId}`);
      setExam(res.data.exam);
    } catch (error) {
      toast.error('Failed to fetch exam!');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await API.get(`/result/leaderboard/${examId}`);
      setLeaderboard(res.data.leaderboard);
    } catch (error) {
      toast.error('Failed to fetch leaderboard!');
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) return <div style={styles.loading}>Loading leaderboard...</div>;

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>🎓 Online Examination System</h2>
        <button onClick={() => navigate('/enter-code')} style={styles.backBtn}>
          🏠 Home
        </button>
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <h3 style={styles.pageTitle}>🏆 Leaderboard</h3>
          <p style={styles.examName}>{exam?.title}</p>
        </div>

        {leaderboard.length === 0 ? (
          <p style={styles.noData}>No results yet!</p>
        ) : (
          <div style={styles.leaderboardList}>
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                style={{
                  ...styles.entryCard,
                  backgroundColor:
                    entry.rank === 1 ? '#fffbeb' :
                    entry.rank === 2 ? '#f7fafc' :
                    entry.rank === 3 ? '#fff5f5' : '#fff',
                  borderLeft: `4px solid ${
                    entry.rank === 1 ? '#f6ad55' :
                    entry.rank === 2 ? '#a0aec0' :
                    entry.rank === 3 ? '#fc8181' : '#e2e8f0'
                  }`
                }}
              >
                <div style={styles.rankSection}>
                  <span style={styles.rankEmoji}>
                    {getRankEmoji(entry.rank)}
                  </span>
                </div>

                <div style={styles.studentInfo}>
                  <h4 style={styles.studentName}>{entry.studentName}</h4>
                  <p style={styles.studentEmail}>{entry.email}</p>
                </div>

                <div style={styles.scoreSection}>
                  <span style={styles.score}>
                    {entry.totalScore}/{exam?.totalMarks}
                  </span>
                  <span style={styles.percentage}>{entry.percentage}%</span>
                </div>

                <div style={styles.statusSection}>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: entry.isPassed ? '#c6f6d5' : '#fed7d7',
                    color: entry.isPassed ? '#276749' : '#9b2c2c'
                  }}>
                    {entry.isPassed ? '✅ Pass' : '❌ Fail'}
                  </span>
                  <span style={styles.timeTaken}>
                    ⏱️ {Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px' },
  container: { minHeight: '100vh', backgroundColor: '#f0f2f5' },
  navbar: {
    backgroundColor: '#4c51bf',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navTitle: { color: '#fff', fontSize: '18px' },
  backBtn: {
    backgroundColor: '#fff',
    color: '#4c51bf',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  content: { padding: '24px', maxWidth: '800px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '32px' },
  pageTitle: { fontSize: '28px', color: '#2d3748', marginBottom: '8px' },
  examName: { fontSize: '16px', color: '#718096' },
  noData: { textAlign: 'center', color: '#718096', padding: '40px' },
  leaderboardList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  rankSection: { minWidth: '48px', textAlign: 'center' },
  rankEmoji: { fontSize: '24px', fontWeight: '700', color: '#2d3748' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: '16px', color: '#2d3748', marginBottom: '4px' },
  studentEmail: { fontSize: '13px', color: '#718096' },
  scoreSection: { textAlign: 'center' },
  score: { display: 'block', fontSize: '20px', fontWeight: '700', color: '#2d3748' },
  percentage: { fontSize: '13px', color: '#718096' },
  statusSection: { textAlign: 'center' },
  statusBadge: { display: 'block', padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', marginBottom: '4px' },
  timeTaken: { fontSize: '12px', color: '#718096' }
};

export default Leaderboard;