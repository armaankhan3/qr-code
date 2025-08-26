import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import QRCodeDisplay from '../components/QRCodeDisplay';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function DriverQRCode() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [error, setError] = useState('');
  const [manualJson, setManualJson] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchDriver = async () => {
      try {
  const params = new URLSearchParams(location.search);
  const tk = params.get('tk');
  const url = tk ? `/api/drivers/${id}?tk=${encodeURIComponent(tk)}` : `/api/drivers/${id}`;
  const res = await api.get(url);
        setDriver(res.data.driver);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Could not fetch driver');
      }
    };
    fetchDriver();
  }, [id]);

  const getQrValue = () => {
    if (driver) {
      // choose fields to include in QR
      const payload = {
        id: driver._id || driver.id,
        name: driver.name,
        phone: driver.phone,
        vehicleNumber: driver.vehicle?.vehicleNumber,
        model: driver.vehicle?.model,
        registrationNumber: driver.vehicle?.registrationNumber,
      };
      return JSON.stringify(payload);
    }

    // fallback to manual JSON
    try {
      const parsed = JSON.parse(manualJson);
      return JSON.stringify(parsed);
    } catch (e) {
      return null;
    }
  };

  const qrValue = getQrValue();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Driver QR Generator</h1>
        {id ? (
          <p className="mb-4 text-sm text-gray-600">Generating QR for driver id: <strong>{id}</strong></p>
        ) : (
          <p className="mb-4 text-sm text-gray-600">No driver id provided — paste driver JSON below to generate QR.</p>
        )}

        {error && <div className="mb-4 text-red-600">{error}</div>}

        {!driver && !id && (
          <div className="mb-4">
            <textarea
              rows={6}
              className="w-full border rounded p-2"
              placeholder='Paste driver JSON here (example: {"id":"...","name":"...","phone":"...","vehicleNumber":"..."})'
              value={manualJson}
              onChange={e => setManualJson(e.target.value)}
            />
          </div>
        )}

        {qrValue ? (
          <QRCodeDisplay value={qrValue} size={260} />
        ) : (
          <div className="mt-4 text-sm text-gray-500">Provide a valid driver id in the URL or paste valid JSON to generate a QR.</div>
        )}
      </div>
      <Footer />
    </div>
  );
}
