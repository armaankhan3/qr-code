import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <header className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 sm:text-6xl">Ride Safe with <span className="text-primary-600">WomenSafe</span></h1>
          <p className="mt-4 text-lg text-gray-600">Quick QR verification, trusted drivers, and emergency support — all in one app.</p>
          <div className="mt-8 flex justify-center gap-4">
            <a href="/scan" className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-full shadow-lg font-semibold hover:opacity-95">Scan QR Now</a>
            <a href="/user/register" className="inline-flex items-center px-6 py-3 border border-primary-600 text-primary-600 rounded-full font-semibold hover:bg-primary-50">Register</a>
          </div>
        </div>
      </header>

      <main className="mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">Instant Verification</h3>
              <p className="text-gray-600">Scan a driver's QR to instantly verify identity and vehicle details.</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">Trusted Drivers</h3>
              <p className="text-gray-600">Drivers are verified and listed to help passengers travel with confidence.</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-2">Emergency Support</h3>
              <p className="text-gray-600">Share your trip with trusted contacts and call for help quickly.</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
