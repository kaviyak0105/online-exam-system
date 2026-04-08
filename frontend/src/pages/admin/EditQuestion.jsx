import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const EditQuestion = () => {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    questionText: '',
    options: [
      { optionLabel: 'A', optionText: '' },
      { optionLabel: 'B', optionText: '' },
      { optionLabel: 'C', optionText: '' },
      { optionLabel: 'D', optionText: '' }
    ],
    correctAnswer: 'A',
    marks: 1,
    partNumber: 1
  });

  useEffect(() => {
    fetchQuestion();
  }, []);

  const fetchQuestion = async () => {
    try {
      const res = await API.get(`/question/${questionId}`);
      const q = res.data.question;
      setFormData({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        partNumber: q.partNumber
      });
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch question!');
    }
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index].optionText = value;
    setFormData({ ...formData, options: updatedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/question/update/${questionId}`, formData);
      toast.success('Question updated successfully!');
      navigate(-1);
    } catch (error) {
      toast.error('Failed to update question!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>🎓 Online Examination System</h2>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Back
        </button>
      </div>

      <div style={styles.content}>
        <h3 style={styles.pageTitle}>✏️ Edit Question</h3>

        <div style={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Part</label>
                <select
                  value={formData.partNumber}
                  onChange={(e) => setFormData({ ...formData, partNumber: parseInt(e.target.value) })}
                  style={styles.input}
                >
                  <option value={1}>Part 1</option>
                  <option value={2}>Part 2</option>
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

            <button type="submit" style={styles.submitBtn} disabled={saving}>
              {saving ? 'Saving...' : '✅ Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px' },
  container: { minHeight: '100vh', backgroundColor: '#f0f2f5' },
  navbar: { backgroundColor: '#e53e3e', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navTitle: { color: '#fff', fontSize: '18px' },
  backBtn: { backgroundColor: '#fff', color: '#e53e3e', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  content: { padding: '24px', maxWidth: '700px', margin: '0 auto' },
  pageTitle: { fontSize: '22px', color: '#2d3748', marginBottom: '24px' },
  formCard: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '6px' },
  input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', minHeight: '80px', boxSizing: 'border-box' },
  optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  submitBtn: { backgroundColor: '#38a169', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }
};

export default EditQuestion;