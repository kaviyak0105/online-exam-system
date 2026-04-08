import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ViewResults = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, passed, failed

  useEffect(() => {
    fetchResults();
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

  const fetchResults = async () => {
    try {
      const res = await API.get(`/result/all/${examId}`);
      setResults(res.data.results);
    } catch (error) {
      toast.error('Failed to fetch results!');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text('Online Examination System', 14, 20);

    doc.setFontSize(13);
    doc.text(`Exam: ${exam?.title}`, 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(113, 128, 150);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 38);

    // Stats
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.text(`Total Students: ${results.length}`, 14, 50);
    doc.text(`Passed: ${results.filter(r => r.isPassed).length}`, 60, 50);
    doc.text(`Failed: ${results.filter(r => !r.isPassed).length}`, 100, 50);
    doc.text(`Avg Score: ${(results.reduce((sum, r) => sum + Number(r.percentage), 0) / results.length).toFixed(1)}%`, 140, 50);

    // Table
    autoTable(doc, {
      startY: 58,
      head: [['Rank', 'Student Name', 'Email', 'Score', 'Percentage', 'Status', 'Time']],
      body: filteredResults.map((result, index) => [
        `#${index + 1}`,
        result.studentId?.name || '-',
        result.studentId?.email || '-',
        `${result.totalScore}/${exam?.totalMarks}`,
        `${result.percentage}%`,
        result.isPassed ? 'Pass' : 'Fail',
        `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s`
      ]),
      headStyles: {
        fillColor: [76, 81, 191],
        textColor: 255,
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: [44, 62, 80]
      },
      alternateRowStyles: {
        fillColor: [247, 250, 252]
      },
      didDrawCell: (data) => {
        if (data.column.index === 5 && data.section === 'body') {
          const result = filteredResults[data.row.index];
          if (result) {
            doc.setTextColor(result.isPassed ? '#276749' : '#9b2c2c');
          }
        }
      }
    });

    doc.save(`${exam?.title}_Results.pdf`);
    toast.success('PDF Downloaded!');
  };

  // Filter logic
  const filteredResults = results.filter((result) => {
    const name = result.studentId?.name?.toLowerCase() || '';
    const email = result.studentId?.email?.toLowerCase() || '';
    const search = searchText.toLowerCase();

    const matchesSearch = name.includes(search) || email.includes(search);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'passed' && result.isPassed) ||
      (filterStatus === 'failed' && !result.isPassed);

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.navTitle}>🎓 Online Examination System</h2>
        <button onClick={() => navigate('/admin/dashboard')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.content}>
        <h3 style={styles.pageTitle}>
          Results - {exam?.title}
        </h3>

        {loading ? (
          <p>Loading...</p>
        ) : results.length === 0 ? (
          <p style={styles.noData}>No results yet!</p>
        ) : (
          <div>
            {/* Stats */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <h4 style={styles.statNumber}>{results.length}</h4>
                <p style={styles.statLabel}>Total Students</p>
              </div>
              <div style={styles.statCard}>
                <h4 style={{ ...styles.statNumber, color: '#38a169' }}>
                  {results.filter(r => r.isPassed).length}
                </h4>
                <p style={styles.statLabel}>Passed</p>
              </div>
              <div style={styles.statCard}>
                <h4 style={{ ...styles.statNumber, color: '#e53e3e' }}>
                  {results.filter(r => !r.isPassed).length}
                </h4>
                <p style={styles.statLabel}>Failed</p>
              </div>
              <div style={styles.statCard}>
                <h4 style={styles.statNumber}>
                  {(results.reduce((sum, r) => sum + Number(r.percentage), 0) / results.length).toFixed(1)}%
                </h4>
                <p style={styles.statLabel}>Avg Score</p>
              </div>
            </div>

            {/* Search + Filter + Export */}
            <div style={styles.filterRow}>
              <input
                type="text"
                placeholder="🔍 Search by name or email..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={styles.searchInput}
              />
              <div style={styles.filterBtns}>
                <button
                  onClick={() => setFilterStatus('all')}
                  style={{
                    ...styles.filterBtn,
                    backgroundColor: filterStatus === 'all' ? '#4c51bf' : '#e2e8f0',
                    color: filterStatus === 'all' ? '#fff' : '#4a5568'
                  }}
                >
                  All ({results.length})
                </button>
                <button
                  onClick={() => setFilterStatus('passed')}
                  style={{
                    ...styles.filterBtn,
                    backgroundColor: filterStatus === 'passed' ? '#38a169' : '#e2e8f0',
                    color: filterStatus === 'passed' ? '#fff' : '#8cd8ac'
                  }}
                >
                  ✅ Passed ({results.filter(r => r.isPassed).length})
                </button>
                <button
                  onClick={() => setFilterStatus('failed')}
                  style={{
                    ...styles.filterBtn,
                    backgroundColor: filterStatus === 'failed' ? '#e53e3e' : '#e2e8f0',
                    color: filterStatus === 'failed' ? '#fff' : '#e6a2a2'
                  }}
                >
                  ❌ Failed ({results.filter(r => !r.isPassed).length})
                </button>
              </div>
              <button onClick={handleExportPDF} style={styles.exportBtn}>
                📄 Export PDF
              </button>
            </div>

            {/* Results count after filter */}
            <p style={styles.resultCount}>
              Showing {filteredResults.length} of {results.length} results
            </p>

            {/* Results Table */}
            {filteredResults.length === 0 ? (
              <p style={styles.noData}>No results found!</p>
            ) : (
              <div style={styles.tableCard}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.th}>Rank</th>
                      <th style={styles.th}>Student</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Score</th>
                      <th style={styles.th}>Percentage</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Time Taken</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result, index) => (
                      <tr key={result._id} style={styles.tableRow}>
                        <td style={styles.td}>#{index + 1}</td>
                        <td style={styles.td}>{result.studentId?.name}</td>
                        <td style={styles.td}>{result.studentId?.email}</td>
                        <td style={styles.td}>
                          {result.totalScore}/{exam?.totalMarks}
                        </td>
                        <td style={styles.td}>{result.percentage}%</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            backgroundColor: result.isPassed ? '#c6f6d5' : '#fed7d7',
                            color: result.isPassed ? '#276749' : '#9b2c2c'
                          }}>
                            {result.isPassed ? '✅ Pass' : '❌ Fail'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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
  noData: { color: '#718096', textAlign: 'center', padding: '40px' },
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
  filterRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '12px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none'
  },
  filterBtns: { display: 'flex', gap: '8px' },
  filterBtn: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px'
  },
  exportBtn: {
    backgroundColor: '#e53e3e',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    whiteSpace: 'nowrap'
  },
  resultCount: {
    fontSize: '13px',
    color: '#718096',
    marginBottom: '16px'
  },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    overflow: 'hidden'
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#f7fafc' },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4a5568',
    borderBottom: '1px solid #e2e8f0'
  },
  tableRow: { borderBottom: '1px solid #f0f2f5' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#2d3748' },
  badge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  }
};

export default ViewResults;