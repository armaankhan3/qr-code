import { useState } from 'react';
import QRScanner from '../components/QRScanner';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import api from '../services/api';

export default function Scan() {
  const [driver, setDriver] = useState(null);
  const [error, setError] = useState('');

  const handleResult = async (decodedText) => {
    setError('');
    try {
      // expect decodedText to be JSON like { id: '...' }
      let data;
      try { data = JSON.parse(decodedText); } catch (e) { data = { id: decodedText }; }
      if (!data.id) throw new Error('Invalid QR payload');
      const res = await api.get(`/api/drivers/${data.id}`);
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
        <QRScanner onResult={handleResult} onError={setError} />

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
