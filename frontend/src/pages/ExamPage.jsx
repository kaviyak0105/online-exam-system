import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api/axios';

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenRequested, setFullscreenRequested] = useState(false);
  const [tabWarning, setTabWarning] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const warningListenerAdded = useRef(false);
  const lastWarningTime = useRef(0);

  useEffect(() => {
    fetchExamData();
  }, []);

  const fetchExamData = async () => {
    try {
      const [examRes, questionsRes] = await Promise.all([
        API.get(`/exam/${examId}`),
        API.get(`/question/exam/${examId}`)
      ]);
      const examData = examRes.data.exam;
      setExam(examData);
      const shuffled = questionsRes.data.questions.sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      try {
        const progressRes = await API.get(`/progress/get/${examId}`);
        if (progressRes.data.progress) {
          const savedAnswers = {};
          progressRes.data.progress.answers.forEach(a => {
            savedAnswers[a.questionId] = a.selectedAnswer;
          });
          setAnswers(savedAnswers);
          setCurrentIndex(progressRes.data.progress.currentQuestion || 0);
          setTimeRemaining(progressRes.data.progress.timeRemaining);
        } else {
          setTimeRemaining(examData.duration * 60);
        }
      } catch {
        setTimeRemaining(examData.duration * 60);
      }
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load exam!');
    }
  };

  // Timer
  useEffect(() => {
    if (timeRemaining === null || submitted) return;
    if (timeRemaining <= 0) {
      handleSubmit(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining, submitted]);

  // Auto save
  useEffect(() => {
    if (!exam || submitted) return;
    const autoSave = setInterval(() => {
      saveProgress();
    }, 10000);
    return () => clearInterval(autoSave);
  }, [answers, currentIndex, timeRemaining, exam, submitted]);

  // Tab warning auto submit
  useEffect(() => {
    if (tabWarning >= 2 && !submitted) {
      handleSubmit(true);
    }
  }, [tabWarning]);

  // Key block + warning detection
  useEffect(() => {
    if (warningListenerAdded.current) return;
    warningListenerAdded.current = true;

    const triggerWarning = () => {
      const now = Date.now();
      if (now - lastWarningTime.current < 1000) return;
      lastWarningTime.current = now;

      setTabWarning(prev => {
        const newCount = prev + 1;
        if (newCount >= 2) {
          toast.error('Too many switches! Exam auto submitted!');
        } else {
          toast.warning(`⚠️ Warning ${newCount}/3: Don't leave the exam window!`);
        }
        return newCount;
      });
    };

    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'Tab') e.preventDefault();
      if (e.key === 'Meta') e.preventDefault();
      if (e.altKey && e.key === 'F4') e.preventDefault();
      if (e.ctrlKey && e.key === 'w') e.preventDefault();
      if (e.ctrlKey && e.key === 't') e.preventDefault();
      if (e.ctrlKey && e.key === 'n') e.preventDefault();
      if (e.key === 'F11') e.preventDefault();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) triggerWarning();
    };

    const handleWindowBlur = () => {
      triggerWarning();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Fullscreen detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && fullscreenRequested && !submitted) {
        toast.warning('⚠️ Please stay in fullscreen mode!');
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [fullscreenRequested, submitted]);

  const requestFullscreen = () => {
    document.documentElement.requestFullscreen();
    setIsFullscreen(true);
    setFullscreenRequested(true);
  };

  const saveProgress = async () => {
    try {
      const answersArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer
      }));
      await API.post('/progress/save', {
        examId,
        answers: answersArray,
        currentQuestion: currentIndex,
        timeRemaining
      });
    } catch (error) {
      console.log('Auto save failed:', error);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submitted) return;
    if (!autoSubmit) {
      setShowConfirm(true);
      return;
    }
    setSubmitted(true);
    try {
      const answersArray = questions.map(q => ({
        questionId: q._id,
        selectedAnswer: answers[q._id] || ''
      }));
      const timeTaken = exam.duration * 60 - timeRemaining;
      await API.post('/result/submit', {
        examId,
        answers: answersArray,
        timeTaken
      });
      toast.success('Exam submitted successfully!');
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      navigate(`/result/${examId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Submit failed!');
      setSubmitted(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) return <div style={styles.loading}>Loading exam...</div>;

  const filteredQuestions = selectedPart
    ? questions.filter(q => q.partNumber === selectedPart)
    : questions;

  const currentQuestion = filteredQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  if (!isFullscreen) {
    return (
      <div style={styles.fullscreenGate}>
        <div style={styles.fullscreenCard}>
          <h2 style={styles.fullscreenTitle}>🖥️ Fullscreen Required</h2>
          <p style={styles.fullscreenText}>This exam must be taken in fullscreen mode.</p>
          <p style={styles.fullscreenSubText}>⚠️ Switching tabs will result in warnings and auto-submit!</p>
          <button onClick={requestFullscreen} style={styles.fullscreenBtn}>
            Enter Fullscreen & Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (!selectedPart) {
    return (
      <div style={styles.fullscreenGate}>
        <div style={styles.partSelectionCard}>
          <h2 style={styles.partSelectionTitle}>📋 Select Part</h2>
          <p style={styles.partSelectionSubtitle}>Choose which part you want to attempt</p>
          <div style={styles.partBtns}>
            {exam?.parts.map((part) => (
              <button
                key={part.partNumber}
                onClick={() => {
                  setSelectedPart(part.partNumber);
                  setCurrentIndex(0);
                }}
                style={styles.partSelectBtn}
              >
                <span style={styles.partBtnNumber}>Part {part.partNumber}</span>
                <span style={styles.partBtnName}>{part.partName}</span>
                <span style={styles.partBtnCount}>
                  {questions.filter(q => q.partNumber === part.partNumber).length} Questions
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.examInfo}>
          <h3 style={styles.examTitle}>{exam?.title}</h3>
          <span style={styles.questionCount}>
            Part {selectedPart} | Question {currentIndex + 1} of {filteredQuestions.length}
          </span>
        </div>
        <div style={styles.headerRight}>
          {tabWarning > 0 && (
            <span style={styles.warningBadge}>⚠️ Warnings: {tabWarning}/3</span>
          )}
          <div style={{
            ...styles.timer,
            backgroundColor: timeRemaining < 60 ? '#e53e3e' : '#4c51bf'
          }}>
            ⏱️ {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      <div style={styles.progressBar}>
        <div style={{
          ...styles.progressFill,
          width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%`
        }} />
      </div>

      <div style={styles.content}>
        <div style={styles.questionPanel}>
          <span style={styles.partBadge}>Part {currentQuestion?.partNumber}</span>
          <h4 style={styles.questionText}>
            {currentIndex + 1}. {currentQuestion?.questionText}
          </h4>
          <div style={styles.optionsContainer}>
            {currentQuestion?.options.map((option) => (
              <div
                key={option.optionLabel}
                onClick={() => handleAnswerSelect(currentQuestion._id, option.optionLabel)}
                style={{
                  ...styles.optionCard,
                  backgroundColor: answers[currentQuestion._id] === option.optionLabel ? '#4c51bf' : '#fff',
                  color: answers[currentQuestion._id] === option.optionLabel ? '#fff' : '#2d3748',
                  borderColor: answers[currentQuestion._id] === option.optionLabel ? '#4c51bf' : '#e2e8f0'
                }}
              >
                <span style={styles.optionLabel}>{option.optionLabel}</span>
                <span style={styles.optionText}>{option.optionText}</span>
              </div>
            ))}
          </div>
          <div style={styles.navigation}>
            <button
              onClick={() => setCurrentIndex(prev => prev - 1)}
              disabled={currentIndex === 0}
              style={{ ...styles.navBtn, opacity: currentIndex === 0 ? 0.4 : 1 }}
            >
              ← Previous
            </button>
            <span style={styles.answeredText}>
              ✅ {answeredCount}/{questions.length} Answered
            </span>
            {currentIndex === filteredQuestions.length - 1 ? (
              <button onClick={() => handleSubmit(false)} style={styles.submitBtn}>
                Submit Exam ✓
              </button>
            ) : (
              <button onClick={() => setCurrentIndex(prev => prev + 1)} style={styles.navBtn}>
                Next →
              </button>
            )}
          </div>
        </div>

        <div style={styles.navigator}>
          <h4 style={styles.navigatorTitle}>Questions</h4>
          <div style={styles.navigatorGrid}>
            {filteredQuestions.map((q, index) => (
              <div
                key={q._id}
                onClick={() => setCurrentIndex(index)}
                style={{
                  ...styles.navDot,
                  backgroundColor: answers[q._id] ? '#4c51bf' : index === currentIndex ? '#e2e8f0' : '#fff',
                  color: answers[q._id] ? '#fff' : '#2d3748',
                  border: index === currentIndex ? '2px solid #4c51bf' : '1px solid #e2e8f0'
                }}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div style={styles.legend}>
            <span style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: '#4c51bf' }} />
              Answered
            </span>
            <span style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
              Not Answered
            </span>
          </div>
          <button
            onClick={() => { setSelectedPart(null); setCurrentIndex(0); }}
            style={styles.switchPartBtn}
          >
            🔄 Switch Part
          </button>
        </div>
      </div>

      {showConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>⚠️ Submit Exam?</h3>
            <p style={styles.modalText}>Are you sure you want to submit the exam?</p>
            <p style={styles.modalSubText}>✅ Answered: {answeredCount}/{questions.length}</p>
            <div style={styles.modalBtns}>
              <button onClick={() => setShowConfirm(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={() => { setShowConfirm(false); handleSubmit(true); }} style={styles.confirmBtn}>Yes, Submit!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px' },
  fullscreenGate: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a202c' },
  fullscreenCard: { backgroundColor: '#fff', padding: '48px', borderRadius: '16px', textAlign: 'center', maxWidth: '480px' },
  fullscreenTitle: { fontSize: '24px', color: '#2d3748', marginBottom: '16px' },
  fullscreenText: { fontSize: '16px', color: '#4a5568', marginBottom: '8px' },
  fullscreenSubText: { fontSize: '14px', color: '#e53e3e', marginBottom: '24px' },
  fullscreenBtn: { backgroundColor: '#4c51bf', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
  partSelectionCard: { backgroundColor: '#fff', padding: '48px', borderRadius: '16px', textAlign: 'center', maxWidth: '500px', width: '90%' },
  partSelectionTitle: { fontSize: '26px', color: '#2d3748', marginBottom: '8px' },
  partSelectionSubtitle: { fontSize: '15px', color: '#718096', marginBottom: '32px' },
  partBtns: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  partSelectBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px 32px', backgroundColor: '#4c51bf', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', minWidth: '140px' },
  partBtnNumber: { fontSize: '20px', fontWeight: '700' },
  partBtnName: { fontSize: '14px', opacity: 0.9 },
  partBtnCount: { fontSize: '13px', opacity: 0.75, backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: '10px' },
  container: { minHeight: '100vh', backgroundColor: '#f0f2f5', display: 'flex', flexDirection: 'column' },
  header: { backgroundColor: '#4c51bf', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  examInfo: {},
  examTitle: { color: '#fff', fontSize: '16px', marginBottom: '4px' },
  questionCount: { color: '#c3dafe', fontSize: '13px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  warningBadge: { backgroundColor: '#fc8181', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '600' },
  timer: { color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '20px', fontWeight: '700' },
  progressBar: { height: '4px', backgroundColor: '#e2e8f0' },
  progressFill: { height: '100%', backgroundColor: '#48bb78', transition: 'width 0.3s ease' },
  content: { display: 'flex', gap: '24px', padding: '24px', flex: 1 },
  questionPanel: { flex: 1, backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  partBadge: { backgroundColor: '#ebf4ff', color: '#3182ce', padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '600' },
  questionText: { fontSize: '18px', color: '#2d3748', margin: '16px 0 24px' },
  optionsContainer: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' },
  optionCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '10px', border: '2px solid', cursor: 'pointer', transition: 'all 0.2s ease' },
  optionLabel: { fontWeight: '700', fontSize: '16px', minWidth: '24px' },
  optionText: { fontSize: '15px' },
  navigation: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navBtn: { backgroundColor: '#4c51bf', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  submitBtn: { backgroundColor: '#38a169', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  answeredText: { fontSize: '14px', color: '#718096' },
  navigator: { width: '220px', backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', alignSelf: 'flex-start' },
  navigatorTitle: { fontSize: '15px', color: '#2d3748', marginBottom: '16px' },
  navigatorGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' },
  navDot: { width: '36px', height: '36px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  legend: { display: 'flex', flexDirection: 'column', gap: '8px' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#718096' },
  legendDot: { width: '14px', height: '14px', borderRadius: '3px', display: 'inline-block' },
  switchPartBtn: { width: '100%', marginTop: '12px', padding: '8px', backgroundColor: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalCard: { backgroundColor: '#fff', padding: '32px', borderRadius: '12px', textAlign: 'center', maxWidth: '360px', width: '90%' },
  modalTitle: { fontSize: '20px', color: '#2d3748', marginBottom: '12px' },
  modalText: { fontSize: '15px', color: '#4a5568', marginBottom: '8px' },
  modalSubText: { fontSize: '14px', color: '#718096', marginBottom: '24px' },
  modalBtns: { display: 'flex', gap: '12px', justifyContent: 'center' },
  cancelBtn: { padding: '10px 24px', backgroundColor: '#e2e8f0', color: '#2d3748', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  confirmBtn: { padding: '10px 24px', backgroundColor: '#38a169', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }
};

export default ExamPage;