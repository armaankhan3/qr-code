import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function ProfileRouter() {
  const { user } = useAuthContext();
  const nav = useNavigate();

  useEffect(() => {
    if (!user) return nav('/login');
    // route by role
    if (user.role === 'driver') {
      // assume user._id or id is present
      const id = user._id || user.id;
      if (id) return nav(`/driver/${id}/profile`);
      return nav('/dashboard');
    }
    // default to user profile
    return nav('/user/profile');
  }, [user]);

  return null;
}
