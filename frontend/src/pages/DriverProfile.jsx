import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import QRCode from 'qrcode';
import { useParams } from 'react-router-dom';

export default function DriverProfile() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/api/drivers/${id}/profile`);
        setDriver(res.data.driver);
      } catch (e) {
        setMessage(e.response ? e.response.data.message : String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (driver && driver.vehicle && driver.vehicle.qrCode) {
      QRCode.toCanvas(qrCanvasRef.current, driver.vehicle.qrCode).catch(() => {});
    }
  }, [driver]);

  const onGenerate = async () => {
    setMessage('Generating...');
    try {
      const res = await api.post(`/api/drivers/${id}/generate-qr`);
      setDriver(res.data.driver);
      setMessage('QR generated');
    } catch (e) {
      setMessage(e.response ? e.response.data.message : String(e));
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!driver) return <div className="p-6">No driver found</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Driver Profile</h2>
      <div className="space-y-3">
        <div><strong>Name:</strong> {driver.name}</div>
        <div><strong>Email:</strong> {driver.email}</div>
        <div><strong>Phone:</strong> {driver.phone}</div>
        <div><strong>Vehicle:</strong> {driver.vehicle?.vehicleNumber} - {driver.vehicle?.model}</div>
        <div className="mt-4">
          <button className="btn-primary" onClick={onGenerate}>Generate QR</button>
          <span className="ml-4">{message}</span>
        </div>
        <div className="mt-6">
          <canvas ref={qrCanvasRef} />
        </div>
        {driver.vehicle?.qrCode && (
          <div className="mt-3 text-sm break-all">Link: {driver.vehicle.qrCode}</div>
        )}
      </div>
    </div>
  );
}
