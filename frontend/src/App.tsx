import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleBasedRedirect } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentHistoryPage } from './pages/StudentHistoryPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminManagement } from './pages/AdminManagement';
import { ValidatorDashboard } from './pages/ValidatorDashboard';
import { SubmissionListPage } from './pages/SubmissionListPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ProfilePage } from './pages/ProfilePage';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Root Redirect based on user role */}
          <Route path="/" element={<RoleBasedRedirect />} />

          {/* Submission List - Public page, only shows approved */}
          <Route path="/submissions" element={<SubmissionListPage />} />

          {/* Student Dashboard */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/history"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'student']}>
                <StudentHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/management"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'admin']}>
                <AdminManagement />
              </ProtectedRoute>
            }
          />

          {/* Validator Dashboard */}
          <Route
            path="/validator"
            element={
              <ProtectedRoute allowedRoles={['VALIDATOR', 'validator']}>
                <ValidatorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Profile Page */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'student', 'ADMIN', 'admin', 'VALIDATOR', 'validator']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* 403 Access Denied */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ToastProvider>
  );
}

export default App;
