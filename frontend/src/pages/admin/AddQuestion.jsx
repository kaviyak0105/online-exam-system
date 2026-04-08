import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const AddQuestion = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({
    partNumber: 1,
    questionText: '',
    options: [
      { optionLabel: 'A', optionText: '' },
      { optionLabel: 'B', optionText: '' },
      { optionLabel: 'C', optionText: '' },
      { optionLabel: 'D', optionText: '' }
    ],
    correctAnswer: 'A',
    marks: 1
  });

  useEffect(() => {
    fetchExam();
    fetchQuestions();
  }, []);

  const fetchExam = async () => {
    try {
      const res = await API.get(`/exam/${examId}`);
      setExam(res.data.exam);
    } catch (error) {
      toast.error('Failed to fetch exam!');
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await API.get(`/question/exam/${examId}`);
      setQuestions(res.data.questions);
    } catch (error) {
      toast.error('Failed to fetch questions!');
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index].optionText = value;
    setFormData({ ...formData, options: updatedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/question/add', { ...formData, examId });
      toast.success('Question added successfully!');
      fetchQuestions();
      setFormData({
        partNumber: 1,
        questionText: '',
        options: [
          { optionLabel: 'A', optionText: '' },
          { optionLabel: 'B', optionText: '' },
          { optionLabel: 'C', optionText: '' },
          { optionLabel: 'D', optionText: '' }
        ],
        correctAnswer: 'A',
        marks: 1
      });
    } catch (error) {
      toast.error('Failed to add question!');
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await API.delete(`/question/delete/${questionId}`);
      toast.success('Question deleted!');
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to delete question!');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>🎓 Online Examination System</h2>
        <button onClick={() => navigate('/admin/dashboard')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.content}>
        <h3 style={styles.pageTitle}>Add Questions - {exam?.title}</h3>

        <div style={styles.formCard}>
          <h4 style={styles.formTitle}>New Question</h4>
          <form onSubmit={handleSubmit}>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Part</label>
                <select
                  value={formData.partNumber}
                  onChange={(e) => setFormData({ ...formData, partNumber: parseInt(e.target.value) })}
                  style={styles.input}
                >
                  {exam?.parts.map((part) => (
                    <option key={part.partNumber} value={part.partNumber}>
                      {part.partName}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Marks</label>
                <input
                  type="number"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                  style={styles.input}
                  min="1"
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Question</label>
              <textarea
                placeholder="Enter question text"
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                style={styles.textarea}
                required
              />
            </div>

            <div style={styles.optionsGrid}>
              {formData.options.map((option, index) => (
                <div key={index} style={styles.inputGroup}>
                  <label style={styles.label}>Option {option.optionLabel}</label>
                  <input
                    type="text"
                    placeholder={`Enter option ${option.optionLabel}`}
                    value={option.optionText}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              ))}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Correct Answer</label>
              <select
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                style={styles.input}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <button type="submit" style={styles.submitBtn}>
              + Add Question
            </button>
          </form>
        </div>

        <div style={styles.questionsList}>
          <h4 style={styles.listTitle}>All Questions ({questions.length})</h4>
          {questions.length === 0 ? (
            <p style={styles.noData}>No questions yet!</p>
          ) : (
            questions.map((q, index) => (
              <div key={q._id} style={styles.questionCard}>
                <div style={styles.questionHeader}>
                  <span style={styles.partBadge}>Part {q.partNumber}</span>
                  <span style={styles.marksBadge}>{q.marks} mark</span>
                </div>
                <p style={styles.questionText}>
                  {index + 1}. {q.questionText}
                </p>
                <div style={styles.optionsList}>
                  {q.options.map((opt) => (
                    <span
                      key={opt.optionLabel}
                      style={{
                        ...styles.optionItem,
                        backgroundColor: opt.optionLabel === q.correctAnswer ? '#c6f6d5' : '#f7fafc',
                        color: opt.optionLabel === q.correctAnswer ? '#276749' : '#4a5568'
                      }}
                    >
                      {opt.optionLabel}: {opt.optionText}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => navigate(`/admin/edit-question/${q._id}`)}
                    style={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
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
  backBtn: {
    backgroundColor: '#fff',
    color: '#e53e3e',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  content: { padding: '24px' },
  pageTitle: { fontSize: '22px', color: '#2d3748', marginBottom: '24px' },
  formCard: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  },
  formTitle: { fontSize: '18px', color: '#2d3748', marginBottom: '16px' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    minHeight: '80px',
    boxSizing: 'border-box'
  },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  submitBtn: {
    backgroundColor: '#4c51bf',
    color: '#fff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  questionsList: {},
  listTitle: { fontSize: '18px', color: '#2d3748', marginBottom: '16px' },
  noData: { color: '#718096', textAlign: 'center', padding: '40px' },
  questionCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    marginBottom: '16px'
  },
  questionHeader: { display: 'flex', gap: '8px', marginBottom: '8px' },
  partBadge: {
    backgroundColor: '#ebf4ff',
    color: '#3182ce',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  marksBadge: {
    backgroundColor: '#fefcbf',
    color: '#975a16',
    padding: '2px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  questionText: { fontSize: '15px', color: '#2d3748', marginBottom: '12px' },
  optionsList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' },
  optionItem: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500'
  },
  editBtn: {
    backgroundColor: '#4c51bf',
    color: '#fff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  deleteBtn: {
    backgroundColor: '#e53e3e',
    color: '#fff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  }
};

export default AddQuestion;