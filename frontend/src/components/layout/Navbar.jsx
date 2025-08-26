import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-primary-600 to-pink-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-600 font-bold">W</div>
            <span className="text-xl font-bold tracking-tight">WomenSafe</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/user/register" className="hover:opacity-90">Passenger</Link>
            <Link to="/driver/register" className="hover:opacity-90">Driver</Link>
            <Link to="/scan" className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold shadow">Scan QR</Link>
            <Link to="/login" className="ml-2 px-4 py-2 border border-white rounded-lg">Login</Link>
          </div>
          <div className="md:hidden">
            <Link to="/scan" className="bg-white text-primary-600 px-3 py-2 rounded-md font-semibold">Scan</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
