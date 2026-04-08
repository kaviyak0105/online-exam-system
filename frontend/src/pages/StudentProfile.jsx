import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const StudentProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyResults();
  }, []);

  const fetchMyResults = async () => {
    try {
      const res = await API.get('/result/my-all-results');
      setResults(res.data.results);
    } catch (error) {
      toast.error('Failed to fetch results!');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalExams = results.length;
  const passedExams = results.filter(r => r.isPassed).length;
  const failedExams = results.filter(r => !r.isPassed).length;
  const avgScore = totalExams > 0
    ? (results.reduce((sum, r) => sum + Number(r.percentage), 0) / totalExams).toFixed(1)
    : 0;

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>🎓 Online Examination System</h2>
        <div style={styles.navRight}>
          <button onClick={() => navigate('/enter-code')} style={styles.homeBtn}>
            🏠 Home
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 style={styles.userName}>{user?.name}</h2>
          <p style={styles.userEmail}>{user?.email}</p>
          <span style={styles.roleBadge}>👨‍🎓 Student</span>
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{totalExams}</h3>
            <p style={styles.statLabel}>Total Exams</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={{ ...styles.statNumber, color: '#38a169' }}>{passedExams}</h3>
            <p style={styles.statLabel}>Passed</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={{ ...styles.statNumber, color: '#e53e3e' }}>{failedExams}</h3>
            <p style={styles.statLabel}>Failed</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{avgScore}%</h3>
            <p style={styles.statLabel}>Avg Score</p>
          </div>
        </div>

        {/* Exam History */}
        <div style={styles.historySection}>
          <h3 style={styles.historyTitle}>📋 Exam History</h3>

          {loading ? (
            <p>Loading...</p>
          ) : results.length === 0 ? (
            <p style={styles.noData}>No exams attended yet!</p>
          ) : (
            results.map((result, index) => (
              <div key={result._id} style={styles.historyCard}>
                <div style={styles.historyLeft}>
                  <h4 style={styles.examName}>
                    {result.examId?.title || 'Exam'}
                  </h4>
                  <p style={styles.examDate}>
                    📅 {new Date(result.submittedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div style={styles.historyRight}>
                  <span style={styles.scoreText}>
                    {result.totalScore}/{result.examId?.totalMarks}
                  </span>
                  <span style={styles.percentText}>{result.percentage}%</span>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: result.isPassed ? '#c6f6d5' : '#fed7d7',
                    color: result.isPassed ? '#276749' : '#9b2c2c'
                  }}>
                    {result.isPassed ? '✅ Pass' : '❌ Fail'}
                  </span>
                  <button
                    onClick={() => navigate(`/result/${result.examId?._id}`)}
                    style={styles.viewBtn}
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f2f5' },
  navbar: {
    backgroundColor: '#4c51bf',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navTitle: { color: '#fff', fontSize: '18px' },
  navRight: { display: 'flex', gap: '12px' },
  homeBtn: {
    backgroundColor: 'transparent',
    color: '#fff',
    border: '1px solid #fff',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  logoutBtn: {
    backgroundColor: '#fff',
    color: '#4c51bf',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  content: { padding: '24px', maxWidth: '800px', margin: '0 auto' },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    marginBottom: '24px'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#4c51bf',
    color: '#fff',
    fontSize: '32px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px'
  },
  userName: { fontSize: '24px', color: '#2d3748', marginBottom: '4px' },
  userEmail: { fontSize: '14px', color: '#718096', marginBottom: '12px' },
  roleBadge: {
    backgroundColor: '#ebf4ff',
    color: '#3182ce',
    padding: '4px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    textAlign: 'center'
  },
  statNumber: { fontSize: '28px', fontWeight: '700', color: '#2d3748', marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: '#718096' },
  historySection: {},
  historyTitle: { fontSize: '20px', color: '#2d3748', marginBottom: '16px' },
  noData: { color: '#718096', textAlign: 'center', padding: '40px' },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  historyLeft: {},
  examName: { fontSize: '16px', color: '#2d3748', marginBottom: '4px' },
  examDate: { fontSize: '13px', color: '#718096' },
  historyRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  scoreText: { fontSize: '16px', fontWeight: '700', color: '#2d3748' },
  percentText: { fontSize: '14px', color: '#718096' },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600'
  },
  viewBtn: {
    backgroundColor: '#4c51bf',
    color: '#fff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  }
};

export default StudentProfile;