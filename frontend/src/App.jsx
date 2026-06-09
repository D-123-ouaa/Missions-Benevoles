import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import MissionDetail from './pages/MissionDetail';
import MyRegistrations from './pages/MyRegistrations';
import Profile from './pages/Profile';
import AdminMissionEdit from './pages/AdminMissionEdit';
import AdminMissionCreate from './pages/AdminMissionCreate';
import AdminMissionShow from './pages/AdminMissionShow';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import RegisterSuccess from './pages/RegisterSuccess';
import AdminNotifications from './pages/AdminNotifications';

function Layout() {
    const location = useLocation();
    const showFullHeader = location.pathname === '/';
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar showFullHeader={showFullHeader} />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
            <ChatbotWidget />
        </div>
    );
}

function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return token && (user?.role === 'admin') ? children : <Navigate to="/" />;
}

function AdminOrManagerRoute({ children }) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return token && (user?.role === 'admin' || user?.role === 'manager') ? children : <Navigate to="/" />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    {/* Public */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/missions/:id" element={<MissionDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/register-success" element={<RegisterSuccess />} />

                    {/* Privé */}
                    <Route path="/my-registrations" element={<PrivateRoute><MyRegistrations /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

                    {/* Admin + Manager */}
                    <Route path="/admin/dashboard" element={<AdminOrManagerRoute><AdminDashboard /></AdminOrManagerRoute>} />
                    <Route path="/admin/missions/create" element={<AdminOrManagerRoute><AdminMissionCreate /></AdminOrManagerRoute>} />
                    <Route path="/admin/missions/edit/:id" element={<AdminOrManagerRoute><AdminMissionEdit /></AdminOrManagerRoute>} />
                    <Route path="/admin/missions/show/:id" element={<AdminOrManagerRoute><AdminMissionShow /></AdminOrManagerRoute>} />

                    {/* Super Admin uniquement */}
                    <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                    <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;