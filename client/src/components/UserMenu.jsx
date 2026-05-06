import { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown, Crown, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import LogoutModal from './LogoutModal';
import './UserMenu.css';

export default function UserMenu({ onUpgradeClick }) {
  const { user } = useAuth();
  const { isPro, downloadsLeft, downloadsLimit, daysRemaining } = useSubscription();
  const [open,       setOpen]       = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  return (
    <>
      <div className="user-menu" ref={menuRef}>
        <button
          className="user-avatar-btn"
          onClick={() => setOpen(o => !o)}
          aria-label="User menu"
          aria-expanded={open}
        >
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=7c3aed&color=fff`}
            alt={user.displayName || 'User'}
            className="user-avatar"
            referrerPolicy="no-referrer"
            onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=7c3aed&color=fff`; }}
          />
          <ChevronDown size={14} className={`user-chevron ${open ? 'open' : ''}`} />
        </button>

        {open && (
          <div className="user-dropdown glass-card">
            {/* User info */}
            <div className="user-info">
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=7c3aed&color=fff`}
                alt={user.displayName}
                className="user-info-avatar"
                referrerPolicy="no-referrer"
                onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=7c3aed&color=fff`; }}
              />
              <div className="user-info-text">
                <span className="user-name">{user.displayName}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>

            <div className="user-dropdown-divider" />

            {/* Subscription status */}
            {isPro ? (
              <div className="user-plan user-plan-pro">
                <Crown size={13} />
                <div>
                  <span className="user-plan-name">Pro Plan</span>
                  <span className="user-plan-detail">{downloadsLeft}/{downloadsLimit} downloads · {daysRemaining}d left</span>
                </div>
              </div>
            ) : (
              <button className="user-plan user-plan-free" onClick={() => { setOpen(false); onUpgradeClick?.(); }}>
                <Zap size={13} />
                <div>
                  <span className="user-plan-name">Free Plan</span>
                  <span className="user-plan-detail">Upgrade for PDF downloads</span>
                </div>
                <Crown size={12} className="user-plan-upgrade-icon" />
              </button>
            )}

            <div className="user-dropdown-divider" />

            <button
              className="user-logout-btn"
              onClick={() => { setOpen(false); setShowLogout(true); }}
            >
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>

      <LogoutModal isOpen={showLogout} onClose={() => setShowLogout(false)} />
    </>
  );
}
