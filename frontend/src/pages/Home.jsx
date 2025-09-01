import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Home() {
  const { user } = useAuthContext();

  const GuestView = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-extrabold text-center mb-4">Welcome to WomenSafe</h1>
        <p className="text-sm text-gray-600 text-center mb-6">Register as a passenger or driver to start using secure QR profiles and quick scanning.</p>

        <div className="grid grid-cols-2 gap-4">
          <Link to="/user/register" className="block text-center px-4 py-4 bg-primary-600 text-white rounded-lg font-semibold shadow">Register as Passenger</Link>
          <Link to="/driver/register" className="block text-center px-4 py-4 border border-primary-600 text-primary-600 rounded-lg font-semibold shadow-sm">Register as Driver</Link>
        </div>

        <p className="mt-6 text-xs text-gray-500 text-center">By registering you agree to our terms. Your information is stored securely.</p>
      </div>
    </div>
  );

  const AuthView = () => (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Hello, {user?.name || 'User'}</h2>
            <p className="text-sm text-gray-500">Welcome back — quick actions to get you moving.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Quick Scan</div>
            <div className="mt-3">
              <Link to="/scan" className="btn-primary w-full">Open Scanner</Link>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Your Profile</div>
            <div className="mt-3">
              <Link to="/profile" className="w-full inline-block px-4 py-2 border rounded text-primary-600">View & Edit</Link>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Generate QR</div>
            <div className="mt-3">
              {user?.role === 'driver' ? (
                <Link to={`/driver/${user._id || user.id}/profile`} className="btn-secondary w-full">Driver Panel</Link>
              ) : (
                <div className="text-sm text-gray-400">Driver-only</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Recent Activity</h3>
            <p className="text-sm text-gray-500 mt-2">No recent scans yet — scan a driver's QR to see it here.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Safety Tips</h3>
            <ul className="text-sm text-gray-500 list-disc list-inside mt-2">
              <li>Share your ride details with a trusted contact.</li>
              <li>Check driver profile and vehicle details before boarding.</li>
              <li>Use the QR scanner to verify driver identity.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      {user ? <AuthView /> : <GuestView />}
      <Footer />
    </>
  );
}
