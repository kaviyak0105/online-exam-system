import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Student Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRegister from './pages/admin/AdminRegister';
import EnterCode from './pages/EnterCode';
import ExamPage from './pages/ExamPage';
import ResultPage from './pages/ResultPage';
import Leaderboard from './pages/Leaderboard';
import StudentProfile from './pages/StudentProfile';


// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import AddQuestion from './pages/admin/AddQuestion';
import EditQuestion from './pages/admin/EditQuestion';
import ViewResults from './pages/admin/ViewResults';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Student Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/enter-code" element={
            <ProtectedRoute role="student">
              <EnterCode />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
  <ProtectedRoute role="student">
    <StudentProfile />
  </ProtectedRoute>
} />
          <Route path="/exam/:examId" element={
            <ProtectedRoute role="student">
              <ExamPage />
            </ProtectedRoute>
          } />
          <Route path="/result/:examId" element={
            <ProtectedRoute role="student">
              <ResultPage />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard/:examId" element={
            <ProtectedRoute role="student">
              <Leaderboard />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/add-question/:examId" element={
            <ProtectedRoute role="admin">
              <AddQuestion />
            </ProtectedRoute>
          } />
          <Route path="/admin/edit-question/:questionId" element={
            <ProtectedRoute role="admin">
              <EditQuestion />
            </ProtectedRoute>
          } />
          <Route path="/admin/results/:examId" element={
            <ProtectedRoute role="admin">
              <ViewResults />
            </ProtectedRoute>
          } />

          {/* Default */}
          <Route path="/" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;