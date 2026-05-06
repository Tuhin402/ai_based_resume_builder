import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import BuilderPage from './pages/BuilderPage';
import DashboardPage from './pages/DashboardPage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';
import PromoModal from './components/PromoModal';
import AuthModal from './components/AuthModal';

export default function App() {
  const { user, loading } = useAuth();
  const [showPromo,    setShowPromo]    = useState(false);
  const [showAuth,     setShowAuth]     = useState(false);

  // Show promo modal 700ms after landing (once per session)
  useEffect(() => {
    if (loading) return; // wait until auth resolves
    const shown = sessionStorage.getItem('promo-shown');
    if (shown) return;

    const t = setTimeout(() => {
      setShowPromo(true);
      sessionStorage.setItem('promo-shown', '1');
    }, 700);
    return () => clearTimeout(t);
  }, [loading]);

  const handleLoginRequired = () => {
    setShowPromo(false);
    setShowAuth(true);
  };

  return (
    <>
      <Routes>
        {/* Root: redirect logged-in users to dashboard */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <BuilderPage />}
        />

        {/* Builder — create new (guest OK) */}
        <Route path="/builder" element={<BuilderPage />} />

        {/* Builder — edit existing (auth checked inside BuilderPage) */}
        <Route path="/builder/:resumeId" element={<BuilderPage />} />

        {/* Dashboard — requires auth */}
        <Route
          path="/dashboard"
          element={user ? <DashboardPage /> : <Navigate to="/" replace />}
        />

        {/* Stripe success redirect */}
        <Route
          path="/success"
          element={user ? <SubscriptionSuccessPage /> : <Navigate to="/?redirect=success" replace />}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global PromoModal — auto-shown on landing */}
      <PromoModal
        isOpen={showPromo}
        onClose={() => setShowPromo(false)}
        onLoginRequired={handleLoginRequired}
      />

      {/* Global AuthModal — triggered when guest clicks Upgrade in PromoModal */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}