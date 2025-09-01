import { useState } from 'react';
import api from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserRegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [msg, setMsg] = useState('');
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [quickCreds, setQuickCreds] = useState({ email: '', password: '' });
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // Always send contacts as an array (empty if not used)
      const payload = { ...form, contacts: [] };
  const res = await api.post('/users/register', payload);
  setMsg('Registration successful!');
          if (res.data && res.data.token) {
            login({ token: res.data.token, user: res.data.user || null });
          }
          // delegate to profile router for correct landing
          navigate('/profile');
    } catch (err) {
  // Surface backend-provided message when possible for easier debugging
  const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message || 'Registration failed';
  console.error('Register error:', err);
  setMsg(String(serverMsg));
  const lower = String(serverMsg).toLowerCase();
  if (lower.includes('exist') || lower.includes('already')) {
    setShowQuickLogin(true);
    setQuickCreds({ email: form.email || '', password: '' });
  }
    }
  };

  const quickLogin = async () => {
    try {
      const res = await api.post('/users/login', quickCreds);
      if (res.data?.token) {
        login({ token: res.data.token, user: res.data.user || null });
        navigate('/');
      }
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          User Registration
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter your name"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field"
                  placeholder="Enter your email"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter your phone number"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field"
                  placeholder="Enter your password"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button type="submit" className="w-full btn-primary">
                Register
              </button>
            </div>
            
            {msg && (
              <div className={`mt-4 text-center p-2 rounded ${
                msg.includes('successful') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {msg}
                {!msg.includes('successful') && (
                  <div className="mt-2 text-sm">
                    Already have an account? <a href="/login" className="text-primary-600">Login</a>
                  </div>
                )}
              </div>
            )}
            {showQuickLogin && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-700 mb-2">Quick login with your existing account</div>
                <input value={quickCreds.email} onChange={e => setQuickCreds({ ...quickCreds, email: e.target.value })} placeholder="Email" className="input-field mb-2" />
                <input value={quickCreds.password} onChange={e => setQuickCreds({ ...quickCreds, password: e.target.value })} placeholder="Password" type="password" className="input-field mb-2" />
                <div className="flex gap-2">
                  <button type="button" className="btn-primary" onClick={quickLogin}>Login</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowQuickLogin(false)}>Cancel</button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
