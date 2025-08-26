import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-4">Welcome — Register to get started</h1>
        <p className="text-sm text-gray-600 text-center mb-6">Create an account as a passenger or register as a driver to generate your QR.</p>

        <div className="space-y-4">
          <a href="/user/register" className="block w-full text-center px-4 py-3 bg-primary-600 text-white rounded-md font-semibold">Register as Passenger</a>
          <a href="/driver/register" className="block w-full text-center px-4 py-3 border border-primary-600 text-primary-600 rounded-md font-semibold">Register as Driver</a>
        </div>

        <p className="mt-6 text-xs text-gray-500 text-center">By registering you agree to our terms. Your information is stored securely.</p>
      </div>
    </div>
  );
}
