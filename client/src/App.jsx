import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import BuilderPage from './pages/BuilderPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Root: redirect logged-in users to dashboard */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <BuilderPage />}
      />

      {/* Builder — create new (guest OK) */}
      <Route path="/builder" element={<BuilderPage />} />

      {/* Builder — edit existing (requires auth, checked inside BuilderPage) */}
      <Route path="/builder/:resumeId" element={<BuilderPage />} />

      {/* Dashboard — requires auth */}
      <Route
        path="/dashboard"
        element={user ? <DashboardPage /> : <Navigate to="/" replace />}
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}