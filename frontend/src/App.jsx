
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import UserRegister from './pages/UserRegister';
import DriverRegister from './pages/DriverRegister';
import Login from './components/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Scan from './pages/Scan';
import DriverQRCode from './pages/DriverQRCode';
import DriverProfile from './pages/DriverProfile';
import Dashboard from './pages/Dashboard';



function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/driver/register" element={<DriverRegister />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/scan" element={<Scan />} />
  <Route path="/driver-qr/:id" element={<DriverQRCode />} />
    <Route path="/driver/:id/profile" element={<DriverProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
