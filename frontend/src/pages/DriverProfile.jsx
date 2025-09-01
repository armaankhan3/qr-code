import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import QRCode from 'qrcode';
import { useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function DriverProfile() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const profilePicRef = useRef();
  const qrCanvasRef = useRef(null);
  const licenseRef = useRef();
  const aadharRef = useRef();
  const driverPhotoRef = useRef();
  const registrationRef = useRef();
  const insuranceRef = useRef();
  const fitnessRef = useRef();

  useEffect(() => {
    async function load() {
      try {
    const res = await api.get(`/drivers/${id}/profile`);
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
  const res = await api.post(`/drivers/${id}/generate-qr`);
      setDriver(res.data.driver);
      setMessage('QR generated');
    } catch (e) {
      setMessage(e.response ? e.response.data.message : String(e));
    }
  };

  const isComplete = () => {
    if (!driver) return false;
    const v = driver.vehicle || {};
    return Boolean(driver.name && driver.phone && v.vehicleNumber && v.model && v.registrationNumber && driver.licenseNumber && driver.aadharNumber);
  };

  const handleSave = async () => {
    setMessage('Saving...');
    try {
      const formData = new FormData();
      // top-level fields
      ['name','email','phone','age','gender','address','experienceYears','licenseNumber','aadharNumber'].forEach(k => {
        if (driver[k] !== undefined && driver[k] !== null) formData.append(k, driver[k]);
      });
      // vehicle fields
      const veh = driver.vehicle || {};
      ['vehicleNumber','vehicleType','model','color','registrationNumber','insuranceNumber','route'].forEach(k => {
        if (veh[k] !== undefined && veh[k] !== null) formData.append(k, veh[k]);
      });

      // files
      if (licenseRef.current?.files[0]) formData.append('licensePhoto', licenseRef.current.files[0]);
      if (aadharRef.current?.files[0]) formData.append('aadharPhoto', aadharRef.current.files[0]);
      if (driverPhotoRef.current?.files[0]) formData.append('driverPhoto', driverPhotoRef.current.files[0]);
      if (registrationRef.current?.files[0]) formData.append('registrationPhoto', registrationRef.current.files[0]);
      if (insuranceRef.current?.files[0]) formData.append('insurancePhoto', insuranceRef.current.files[0]);
      if (fitnessRef.current?.files[0]) formData.append('fitnessCertificatePhoto', fitnessRef.current.files[0]);

  const res = await api.put(`/drivers/${id}/profile`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDriver(res.data.driver);
      setMessage('Saved');
    } catch (e) {
      setMessage(e.response ? e.response.data.message : String(e));
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!driver) return <div className="p-6">No driver found</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white shadow-md rounded-xl p-6">
            <div className="flex items-center gap-6">
              <div>
                {driver.driverPhoto ? (
                  <img src={`/${driver.driverPhoto}`} alt="driver" className="w-28 h-28 rounded-full object-cover border" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-600 to-pink-500 text-white flex items-center justify-center text-3xl font-bold">{(driver.name||'D').charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold">{driver.name || 'Driver profile'}</h2>
                <p className="text-sm text-gray-500">Edit driver and vehicle details. Generate QR when records are complete.</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input className="input-field mt-1" value={driver.name || ''} onChange={e => setDriver({ ...driver, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input className="input-field mt-1" value={driver.email || ''} onChange={e => setDriver({ ...driver, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input className="input-field mt-1" value={driver.phone || ''} onChange={e => setDriver({ ...driver, phone: e.target.value })} />
              </div>

              <div className="md:col-span-2">
                <h3 className="mt-2 font-semibold">Vehicle</h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                <input className="input-field mt-1" value={driver.vehicle?.vehicleNumber || ''} onChange={e => setDriver({ ...driver, vehicle: { ...(driver.vehicle||{}), vehicleNumber: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <input className="input-field mt-1" value={driver.vehicle?.model || ''} onChange={e => setDriver({ ...driver, vehicle: { ...(driver.vehicle||{}), model: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                <input className="input-field mt-1" value={driver.vehicle?.registrationNumber || ''} onChange={e => setDriver({ ...driver, vehicle: { ...(driver.vehicle||{}), registrationNumber: e.target.value } })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <input className="input-field mt-1" value={driver.vehicle?.color || ''} onChange={e => setDriver({ ...driver, vehicle: { ...(driver.vehicle||{}), color: e.target.value } })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">License Number</label>
                <input className="input-field mt-1" value={driver.licenseNumber || ''} onChange={e => setDriver({ ...driver, licenseNumber: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Aadhar Number</label>
                <input className="input-field mt-1" value={driver.aadharNumber || ''} onChange={e => setDriver({ ...driver, aadharNumber: e.target.value })} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Profile picture</label>
                <div className="flex items-center gap-3 mt-2">
                  <input type="file" ref={profilePicRef} />
                  <div className="text-sm text-gray-500">PNG/JPG up to 5MB</div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Upload License Photo</label>
                <input type="file" ref={licenseRef} className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Aadhar Photo</label>
                <input type="file" ref={aadharRef} className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Driver Photo</label>
                <input type="file" ref={driverPhotoRef} className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Registration Photo</label>
                <input type="file" ref={registrationRef} className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Insurance Photo</label>
                <input type="file" ref={insuranceRef} className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Fitness Certificate</label>
                <input type="file" ref={fitnessRef} className="mt-1" />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button className="btn-primary" onClick={handleSave}>Save Profile</button>
              <button className={`btn-primary ${!isComplete() ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={onGenerate} disabled={!isComplete()}>Generate QR</button>
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
      </div>
      <Footer />
    </>
  );
}
