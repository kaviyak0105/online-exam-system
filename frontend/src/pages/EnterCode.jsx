import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const EnterCode = () => {
  const [examCode, setExamCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post('/exam/verify-code', { examCode });
      const { exam } = res.data;
      toast.success('Exam code verified!');
      navigate(`/exam/${exam.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid exam code!');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>🎓 Online Examination System</h2>
        <div style={styles.navRight}>
          <span style={styles.userName}>👤 {user?.name}</span>
          <button onClick={() => navigate('/profile')} style={styles.profileBtn}>Profile</button>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.card}>
          <h3 style={styles.title}>Enter Exam Code</h3>
          <p style={styles.subtitle}>
            Enter the exam code provided by your teacher
          </p>

          <form onSubmit={handleVerify}>
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Enter exam code (Ex: D75EE262)"
                value={examCode}
                onChange={(e) => setExamCode(e.target.value.toUpperCase())}
                style={styles.codeInput}
                required
              />
            </div>
            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Start Exam →'}
            </button>
          </form>
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
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  userName: { color: '#fff', fontSize: '14px' },
  logoutBtn: {
    backgroundColor: '#fff',
    color: '#4c51bf',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 60px)'
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center'
  },
  title: { fontSize: '22px', color: '#2d3748', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#718096', marginBottom: '24px' },
  inputGroup: { marginBottom: '16px' },
  codeInput: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: '2px solid #e2e8f0',
    fontSize: '18px',
    textAlign: 'center',
    letterSpacing: '4px',
    fontWeight: '700',
    outline: 'none',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4c51bf',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  profileBtn: {
  backgroundColor: 'white',
  color: '#4c51bf',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: '600'
},
};

export default EnterCode;