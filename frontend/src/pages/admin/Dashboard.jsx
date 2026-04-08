import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const Dashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    totalMarks: '',
    passMarkPercentage: 40,
    parts: [
      { partName: 'Part 1', partNumber: 1 },
      { partName: 'Part 2', partNumber: 2 }
    ]
  });

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await API.get('/exam/all');
      setExams(res.data.exams);
    } catch (error) {
      toast.error('Failed to fetch exams!');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/exam/create', formData);
      toast.success('Exam created successfully!');
      setShowCreateForm(false);
      fetchExams();
      setFormData({
        title: '',
        description: '',
        duration: '',
        totalMarks: '',
        passMarkPercentage: 40,
        parts: [
          { partName: 'Part 1', partNumber: 1 },
          { partName: 'Part 2', partNumber: 2 }
        ]
      });
    } catch (error) {
      toast.error('Failed to create exam!');
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      await API.delete(`/exam/delete/${examId}`);
      toast.success('Exam deleted!');
      fetchExams();
    } catch (error) {
      toast.error('Failed to delete exam!');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>🎓 Online Examination System</h2>
        <div style={styles.navRight}>
          <span style={styles.adminName}>👤 {user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <div style={styles.header}>
          <h3 style={styles.pageTitle}>Admin Dashboard</h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={styles.createBtn}
          >
            {showCreateForm ? 'Cancel' : '+ Create Exam'}
          </button>
        </div>

        {/* Create Exam Form */}
        {showCreateForm && (
          <div style={styles.formCard}>
            <h4 style={styles.formTitle}>Create New Exam</h4>
            <form onSubmit={handleCreateExam}>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Exam Title</label>
                  <input
                    type="text"
                    placeholder="Enter exam title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Description</label>
                  <input
                    type="text"
                    placeholder="Enter description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Duration (minutes)</label>
                  <input
                    type="number"
                    placeholder="Ex: 30"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Total Marks</label>
                  <input
                    type="number"
                    placeholder="Ex: 10"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Pass Mark %</label>
                  <input
                    type="number"
                    placeholder="Ex: 40"
                    value={formData.passMarkPercentage}
                    onChange={(e) => setFormData({ ...formData, passMarkPercentage: e.target.value })}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
              <button type="submit" style={styles.submitBtn}>Create Exam</button>
            </form>
          </div>
        )}

        {/* Exams List */}
        <div style={styles.examsList}>
          <h4 style={styles.listTitle}>All Exams ({exams.length})</h4>
          {loading ? (
            <p>Loading...</p>
          ) : exams.length === 0 ? (
            <p style={styles.noData}>No exams found! Create one.</p>
          ) : (
            exams.map((exam) => (
              <div key={exam._id} style={styles.examCard}>
                <div style={styles.examInfo}>
                  <h4 style={styles.examTitle}>{exam.title}</h4>
                  <p style={styles.examMeta}>
                    ⏱️ {exam.duration} mins &nbsp;|&nbsp;
                    📝 {exam.totalMarks} marks &nbsp;|&nbsp;
                    🔑 Code: <strong>{exam.examCode}</strong>
                  </p>
                  <p style={styles.examMeta}>
                    ✅ Pass: {exam.passMarkPercentage}% &nbsp;|&nbsp;
                    📂 Parts: {exam.parts.length}
                  </p>
                </div>
                <div style={styles.examActions}>
                  <button
                    onClick={() => navigate(`/admin/add-question/${exam._id}`)}
                    style={styles.addQBtn}
                  >
                    + Add Questions
                  </button>
                  <button
                    onClick={() => navigate(`/admin/results/${exam._id}`)}
                    style={styles.resultsBtn}
                  >
                    View Results
                  </button>
                  <button
                    onClick={() => handleDeleteExam(exam._id)}
                    style={styles.deleteBtn}
                  >
                    Delete
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
    backgroundColor: '#e53e3e',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navTitle: { color: '#fff', fontSize: '18px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  adminName: { color: '#fff', fontSize: '14px' },
  logoutBtn: {
    backgroundColor: '#fff',
    color: '#e53e3e',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  content: { padding: '24px' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  pageTitle: { fontSize: '22px', color: '#2d3748' },
  createBtn: {
    backgroundColor: '#e53e3e',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  formCard: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  },
  formTitle: { fontSize: '18px', color: '#2d3748', marginBottom: '16px' },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none'
  },
  submitBtn: {
    marginTop: '16px',
    backgroundColor: '#e53e3e',
    color: '#fff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  examsList: {},
  listTitle: { fontSize: '18px', color: '#2d3748', marginBottom: '16px' },
  noData: { color: '#718096', textAlign: 'center', padding: '40px' },
  examCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },
  examInfo: {},
  examTitle: { fontSize: '16px', color: '#2d3748', marginBottom: '6px' },
  examMeta: { fontSize: '13px', color: '#718096', marginBottom: '4px' },
  examActions: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  addQBtn: {
    backgroundColor: '#4c51bf',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  resultsBtn: {
    backgroundColor: '#38a169',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  deleteBtn: {
    backgroundColor: '#e53e3e',
    color: '#fff',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  }
};

export default Dashboard;