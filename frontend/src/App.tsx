import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleBasedRedirect } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ValidatorDashboard } from './pages/ValidatorDashboard';
import { UnauthorizedPage } from './pages/UnauthorizedPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root Redirect based on user role */}
          <Route path="/" element={<RoleBasedRedirect />} />

          {/* Student Dashboard */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'student']}>
                <StudentDashboard />
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

          {/* Validator Dashboard */}
          <Route
            path="/validator"
            element={
              <ProtectedRoute allowedRoles={['VALIDATOR', 'validator']}>
                <ValidatorDashboard />
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
  );
}

export default App;
