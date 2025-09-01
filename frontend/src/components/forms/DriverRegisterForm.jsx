import { useState, useRef } from 'react';
import api from '../../services/api';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DriverRegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', gender: '', address: '', licenseNumber: '', aadharNumber: '', experienceYears: 0, vehicleNumber: '', vehicleType: '', model: '', color: '', registrationNumber: '', insuranceNumber: '', route: '' });
  const [msg, setMsg] = useState('');
  const [qrValue, setQrValue] = useState(null);
  const [qrLink, setQrLink] = useState(null);
  const [qrToken, setQrToken] = useState(null);
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [quickCreds, setQuickCreds] = useState({ email: '', password: '' });
  const licensePhotoRef = useRef();
  const aadharPhotoRef = useRef();
  const driverPhotoRef = useRef();
  const registrationPhotoRef = useRef();
  const insurancePhotoRef = useRef();
  const fitnessPhotoRef = useRef();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== undefined && form[key] !== null) formData.append(key, form[key]);
      });
      // append files
      if (licensePhotoRef.current?.files[0]) formData.append('licensePhoto', licensePhotoRef.current.files[0]);
      if (aadharPhotoRef.current?.files[0]) formData.append('aadharPhoto', aadharPhotoRef.current.files[0]);
      if (driverPhotoRef.current?.files[0]) formData.append('driverPhoto', driverPhotoRef.current.files[0]);
      if (registrationPhotoRef.current?.files[0]) formData.append('registrationPhoto', registrationPhotoRef.current.files[0]);
      if (insurancePhotoRef.current?.files[0]) formData.append('insurancePhoto', insurancePhotoRef.current.files[0]);
      if (fitnessPhotoRef.current?.files[0]) formData.append('fitnessCertificatePhoto', fitnessPhotoRef.current.files[0]);

      const res = await api.post('/drivers/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg('Registration successful!');
      if (res.data && res.data.qrLink) {
        setQrLink(res.data.qrLink);
        setQrValue(res.data.qrLink);
        // if server returned an auth token, log in and navigate to profile
        if (res.data.authToken) {
          login({ token: res.data.authToken, user: { _id: res.data.driverId, role: 'driver' } });
          navigate('/profile');
        }
      }
    } catch (err) {
      console.error(err);
  const serverMsg = err?.response?.data?.message || 'Registration failed';
  setMsg(serverMsg);
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
        if (res.data.user?.role === 'driver' && res.data.user?._id) {
          navigate(`/driver/${res.data.user._id}/profile`);
        } else {
          navigate('/');
        }
      }
    } catch (e) {
      setMsg(e?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Driver Registration
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
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
              <div className="mt-1">
                <input id="age" name="age" type="number" required className="input-field" onChange={handleChange} />
              </div>
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
              <div className="mt-1">
                <select id="gender" name="gender" required className="input-field" onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <div className="mt-1">
                <input id="address" name="address" type="text" required className="input-field" onChange={handleChange} />
              </div>
            </div>

            <div>
              <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">
                Vehicle Number
              </label>
              <div className="mt-1">
                <input
                  id="vehicleNumber"
                  name="vehicleNumber"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter vehicle number"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">Vehicle Type</label>
              <div className="mt-1">
                <select id="vehicleType" name="vehicleType" required className="input-field" onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Bus">Bus</option>
                  <option value="Cab">Cab</option>
                  <option value="Auto">Auto</option>
                  <option value="Metro">Metro</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
              <div className="mt-1">
                <input id="model" name="model" type="text" required className="input-field" onChange={handleChange} />
              </div>
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color</label>
              <div className="mt-1">
                <input id="color" name="color" type="text" required className="input-field" onChange={handleChange} />
              </div>
            </div>

            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">Registration Number</label>
              <div className="mt-1">
                <input id="registrationNumber" name="registrationNumber" type="text" required className="input-field" onChange={handleChange} />
              </div>
            </div>

            <div>
              <label htmlFor="insuranceNumber" className="block text-sm font-medium text-gray-700">Insurance Number</label>
              <div className="mt-1">
                <input id="insuranceNumber" name="insuranceNumber" type="text" required className="input-field" onChange={handleChange} />
              </div>
            </div>

            <div>
              <label htmlFor="route" className="block text-sm font-medium text-gray-700">Route</label>
              <div className="mt-1">
                <input id="route" name="route" type="text" className="input-field" onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Upload License Photo</label>
              <input type="file" ref={licensePhotoRef} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Aadhar Photo</label>
              <input type="file" ref={aadharPhotoRef} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Driver Photo</label>
              <input type="file" ref={driverPhotoRef} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Registration Photo</label>
              <input type="file" ref={registrationPhotoRef} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Insurance Photo</label>
              <input type="file" ref={insurancePhotoRef} className="mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Fitness Certificate (optional)</label>
              <input type="file" ref={fitnessPhotoRef} className="mt-1" />
            </div>

            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                License Number
              </label>
              <div className="mt-1">
                <input
                  id="licenseNumber"
                  name="licenseNumber"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter license number"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button type="submit" className="w-full btn-primary">
                Register as Driver
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
            {qrValue && (
              <>
                <QRCodeDisplay value={qrValue} size={220} />
                {qrLink && (
                  <div className="mt-3 text-center">
                    <a href={qrLink} target="_blank" rel="noreferrer" className="text-sm text-primary-600">Open public link</a>
                    {qrToken && (
                      <div className="text-xs text-gray-500 mt-1 break-all">Token: {qrToken}</div>
                    )}
                  </div>
                )}
                <div className="mt-2 text-center">
                  <button onClick={() => {
                    // download canvas as PNG
                    const canvas = document.querySelector('canvas');
                    if (!canvas) return;
                    const link = document.createElement('a');
                    link.href = canvas.toDataURL('image/png');
                    link.download = 'driver-qr.png';
                    link.click();
                  }} className="mt-2 btn-secondary">Download QR</button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
