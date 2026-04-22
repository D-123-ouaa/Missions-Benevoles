import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MissionDetail from './pages/MissionDetail';
import MyRegistrations from './pages/MyRegistrations';
import Profile from './pages/Profile';
import AdminMissionEdit from './pages/AdminMissionEdit';
import AdminMissionCreate from './pages/AdminMissionCreate';
import AdminMissionShow from './pages/AdminMissionShow';

// Layout pour afficher le Navbar et le Footer sur toutes les pages
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
        </div>
    );
}

// Route privée pour les pages nécessitant une authentification
function PrivateRoute({ children }) {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
}

// Route privée pour les pages réservées aux administrateurs
function AdminRoute({ children }) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return token && user?.role === 'admin' ? children : <Navigate to="/" />;
}

// Composant principal de l'application avec la configuration des routes
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    {/* Routes publiques */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/missions/:id" element={<MissionDetail />} />
                    
                    {/* Authentification */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Routes privées */}
                    <Route path="/my-registrations" element={<PrivateRoute><MyRegistrations /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    
                    {/* Routes admin */}
                    <Route path="/admin/missions/create" element={<AdminRoute><AdminMissionCreate /></AdminRoute>} />
                    <Route path="/admin/missions/edit/:id" element={<AdminRoute><AdminMissionEdit /></AdminRoute>} />
                    <Route path="/admin/missions/show/:id" element={<AdminRoute><AdminMissionShow /></AdminRoute>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;