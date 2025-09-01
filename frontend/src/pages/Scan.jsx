import { useState, useEffect } from 'react';
import QRScanner from '../components/QRScanner';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import api from '../services/api';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Scan() {
  const [driver, setDriver] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);

  useEffect(() => {
    // if not authenticated redirect to login
    const token = localStorage.getItem('auth_token');
    if (!token) navigate('/login');
  }, []);

  const handleResult = async (decodedText) => {
    setError('');
    try {
      // expect decodedText to be JSON like { id: '...', tk: '...' } or a url containing id and tk
      let data;
      try { data = JSON.parse(decodedText); } catch (e) {
        // try parse as url
        try {
          const u = new URL(decodedText);
          const parts = u.pathname.split('/').filter(Boolean);
          const id = parts.pop();
          const tk = u.searchParams.get('tk');
          data = { id, tk };
        } catch (err) {
          data = { id: decodedText };
        }
      }
      if (!data.id) throw new Error('Invalid QR payload');
  const url = `/drivers/${data.id}${data.tk ? `?tk=${encodeURIComponent(data.tk)}` : ''}`;
      const res = await api.get(url);
      setDriver(res.data.driver);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not fetch driver');
      setDriver(null);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Scan Driver QR</h2>
        <div className="mb-4">
          <button className="btn-primary" onClick={() => setRunning(r => !r)}>{running ? 'Stop Scan' : 'Start Scan'}</button>
        </div>
        <QRScanner onResult={handleResult} onError={setError} running={running} />

        {error && <div className="mt-4 text-red-600">{error}</div>}

        {driver && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold">{driver.name}</h3>
            <p className="text-sm text-gray-500">Phone: {driver.phone}</p>
            <div className="mt-3">
              <p><strong>Vehicle:</strong> {driver.vehicle?.model} - {driver.vehicle?.vehicleNumber}</p>
              <p><strong>Route:</strong> {driver.vehicle?.route}</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
