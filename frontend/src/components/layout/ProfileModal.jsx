import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import api from '../../services/api';

export default function ProfileModal({ open, onClose }) {
  const { user: authUser, logout } = useAuthContext();
  const [profile, setProfile] = useState(null);
  const containerRef = useRef(null);
  const closeBtnRef = useRef(null);

  // fetch latest profile when modal opens
  useEffect(() => {
    let mounted = true;
    if (!open) return;
    (async () => {
      try {
        const res = await api.get('/users/profile');
        if (mounted) setProfile(res.data.user || null);
      } catch (e) {
        // fallback to auth user
        if (mounted) setProfile(authUser || null);
      }
    })();
    return () => { mounted = false; };
  }, [open]);

  // ESC to close and simple focus trap
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        // basic focus trap: cycle to close button
        const focusable = containerRef.current?.querySelectorAll('button,a[href],input,textarea,select') || [];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    // set initial focus
    setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;
  const u = profile || authUser || {};
  const initial = u?.name ? u.name.charAt(0).toUpperCase() : (u?.email ? u.email.charAt(0).toUpperCase() : 'U');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div ref={containerRef} className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all scale-100">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-pink-500 text-white flex items-center justify-center font-bold text-xl">
              {initial}
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold text-slate-800">{u.name || 'Unnamed User'}</div>
              <div className="text-sm text-slate-500">{u.email || ''}</div>
              <div className="mt-1 text-xs text-slate-400">{u.role ? u.role.toUpperCase() : 'USER'}</div>
            </div>
            <div>
              <button ref={closeBtnRef} aria-label="Close profile" className="text-slate-400 hover:text-slate-600" onClick={onClose}>✕</button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <Link to="/profile" className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium">View & edit profile</Link>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="w-full py-2 rounded border border-slate-200 text-slate-700"
                onClick={() => { logout(); onClose(); }}
              >Logout</button>
              <button className="w-full py-2 rounded text-slate-500 bg-slate-50" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
