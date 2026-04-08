import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Login = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });
      const { token, user } = res.data;

      if (user.role !== role) {
        toast.error(`Invalid credentials for ${role} login!`);
        return;
      }

      login(user, token);
      toast.success('Login successful!');

      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/enter-code');
      }

    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🎓 Online Examination System</h2>

        {/* Role Toggle */}
        <div style={styles.toggleContainer}>
          <button
            onClick={() => setRole('student')}
            style={{
              ...styles.toggleBtn,
              backgroundColor: role === 'student' ? '#4c51bf' : '#e2e8f0',
              color: role === 'student' ? '#fff' : '#4a5568'
            }}
          >
            👨‍🎓 Student
          </button>
          <button
            onClick={() => setRole('admin')}
            style={{
              ...styles.toggleBtn,
              backgroundColor: role === 'admin' ? '#e53e3e' : '#e2e8f0',
              color: role === 'admin' ? '#fff' : '#4a5568'
            }}
          >
            🛠️ Admin
          </button>
        </div>

        <h3 style={{
          ...styles.subtitle,
          color: role === 'student' ? '#4c51bf' : '#e53e3e'
        }}>
          {role === 'student' ? 'Student Login' : 'Admin Login'}
        </h3>

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                ...styles.input,
                borderColor: role === 'student' ? '#4c51bf' : '#e53e3e'
              }}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                ...styles.input,
                borderColor: role === 'student' ? '#4c51bf' : '#e53e3e'
              }}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              backgroundColor: role === 'student' ? '#4c51bf' : '#e53e3e'
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : `Login as ${role === 'student' ? 'Student' : 'Admin'}`}
          </button>
        </form>
{/* //student register link */}
            {role === 'student' && (
        <p style={styles.registerLink}>
  Don't have an account?{' '}
  <a href="/register" style={styles.link}>
    Register here
  </a>
</p>
 )}

{/* //Admin register link */}
{role === 'admin' && (
<p style={styles.registerLink}>
  New Admin?{' '}
  <a href="/admin/register" style={{ ...styles.link, color: '#e53e3e' }}>Register here</a>
</p>
)}

      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5'
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    textAlign: 'center',
    color: '#2d3748',
    marginBottom: '20px',
    fontSize: '22px'
  },
  toggleContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    backgroundColor: '#e2e8f0',
    padding: '4px',
    borderRadius: '10px'
  },
  toggleBtn: {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '16px',
    fontWeight: '600'
  },
  inputGroup: { marginBottom: '16px' },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#4a5568',
    fontSize: '14px',
    fontWeight: '600'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '2px solid',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease'
  },
  button: {
    width: '100%',
    padding: '12px',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background-color 0.2s ease'
  },
  registerLink: {
    textAlign: 'center',
    marginTop: '16px',
    color: '#718096',
    fontSize: '14px'
  },
  link: {
    color: '#4c51bf',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default Login;