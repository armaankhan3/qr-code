import { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const { user } = useAuthContext();
  const nav = useNavigate();
  const [profile, setProfile] = useState(null);
  const [msg, setMsg] = useState('');
  const fileRef = useRef();
  const { login } = useAuthContext();
  
  useEffect(() => {
    if (!user) return nav('/login');
    api.get('/users/profile').then(r => setProfile(r.data.user)).catch(() => setMsg('Failed to load'));
  }, [user]);

  const handleChange = e => setProfile({ ...profile, [e.target.name]: e.target.value });

  const save = async () => {
    try {
      const form = new FormData();
      form.append('name', profile.name || '');
      form.append('phone', profile.phone || '');
      form.append('address', profile.address || '');
      if (fileRef.current?.files[0]) form.append('profilePic', fileRef.current.files[0]);
      const res = await api.put('/users/profile', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile(res.data.user);
      // refresh auth context with updated user (preserve token)
      const token = localStorage.getItem('auth_token');
      if (token) login({ token, user: res.data.user });
      setMsg('Saved');
    } catch (e) { console.error(e); setMsg('Save failed'); }
  };

  if (!profile) return <div className="p-6">{msg || 'Loading...'}</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white shadow-md rounded-xl p-6">
            <div className="flex items-center gap-6">
              <div>
                {profile.profilePic ? (
                  <img src={`/${profile.profilePic}`} alt="profile" className="w-24 h-24 rounded-full object-cover border" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-pink-500 text-white flex items-center justify-center text-2xl font-bold">{(profile.name||'U').charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold">{profile.name || 'Your profile'}</h2>
                <p className="text-sm text-gray-500">Manage your profile and privacy settings here.</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input name="name" value={profile.name||''} onChange={handleChange} className="input-field mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input name="phone" value={profile.phone||''} onChange={handleChange} className="input-field mt-1" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input name="address" value={profile.address||''} onChange={handleChange} className="input-field mt-1" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Profile picture</label>
                <div className="flex items-center gap-3 mt-2">
                  <input type="file" ref={fileRef} />
                  <div className="text-sm text-gray-500">PNG/JPG up to 5MB</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button className="btn-primary" onClick={save}>Save profile</button>
              <button className="btn-secondary" onClick={() => { setProfile(profile); setMsg('Changes discarded'); }}>Cancel</button>
              <span className="ml-3 text-sm text-green-700">{msg}</span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
