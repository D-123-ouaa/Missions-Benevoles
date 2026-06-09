import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Heart, User } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useUser } from '../hooks/useUser'; 

function Navbar({ showFullHeader = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user } = useUser(); 
    const token = localStorage.getItem('token');

    // ✅ Fonction pour vérifier si un lien est actif (déplacée avant le return)
    const isActive = (path) => {
        return location.pathname === path;
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        setIsMenuOpen(false);
    };

    const closeMenu = () => setIsMenuOpen(false);

    const isAuthenticated = !!token;
    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';

    const roleLabel = { admin: 'Super Admin', manager: 'Manager', volunteer: 'Bénévole' };
    const roleColor = { admin: '#653239', manager: '#AF7A6D', volunteer: '#8a9a6a' };

    const navLinks = (
        <div className="hidden md:flex gap-6 items-center">
            {/* ✅ Lien Missions avec soulignement actif */}
            <Link 
                to="/" 
                className={`transition ${isActive('/') ? 'border-b-2 pb-0.5 font-medium' : 'hover:border-b-2 hover:pb-0.5 hover:border-[#EAF9D9]/50'}`}
                style={{ color: '#EAF9D9', borderBottomColor: '#EAF9D9' }}
            >
                Missions
            </Link>

            {!isAuthenticated ? (
                <div className="flex gap-3">
                    <Link 
                        to="/login" 
                        className={`px-4 py-1.5 rounded-md transition-all duration-200 ${
                            isActive('/login') 
                                ? 'border border-[#EAF9D9] text-[#EAF9D9] hover:bg-[#EAF9D9]/10 hover:scale-105' 
                                : 'text-[#EAF9D9]'
                        }`}
                    >
                        Se connecter
                    </Link>
                    <Link 
                        to="/register" 
                        className={`px-4 py-1.5 rounded-md transition-all duration-200 ${
                            isActive('/register') 
                                ? 'border border-[#EAF9D9] text-[#EAF9D9] hover:bg-[#EAF9D9]/10 hover:scale-105' 
                                : 'text-[#EAF9D9]'
                        }`}
                    >
                        S'inscrire
                    </Link>
                </div>
            ) : (
                <>
                    {/* ✅ Dashboard Admin/Manager */}
                    {(isAdmin || isManager) && (
                        <Link 
                            to="/admin/dashboard" 
                            className={`transition ${isActive('/admin/dashboard') ? 'border-b-2 pb-0.5 font-medium' : 'hover:border-b-2 hover:pb-0.5 hover:border-[#EAF9D9]/50'}`}
                            style={{ color: '#EAF9D9', borderBottomColor: '#EAF9D9' }}
                        >
                            Tableau de bord
                        </Link>
                    )}
                    
                    {/* ✅ Mes inscriptions (bénévole) */}
                    {!isAdmin && !isManager && (
                        <Link 
                            to="/my-registrations" 
                            className={`transition ${isActive('/my-registrations') ? 'border-b-2 pb-0.5 font-medium' : 'hover:border-b-2 hover:pb-0.5 hover:border-[#EAF9D9]/50'}`}
                            style={{ color: '#EAF9D9', borderBottomColor: '#EAF9D9' }}
                        >
                            Mes inscriptions
                        </Link>
                    )}
                    
                    {/* ✅ Utilisateurs (admin uniquement) */}
                    {isAdmin && (
                        <Link 
                            to="/admin/users" 
                            className={`transition ${isActive('/admin/users') ? 'border-b-2 pb-0.5 font-medium' : 'hover:border-b-2 hover:pb-0.5 hover:border-[#EAF9D9]/50'}`}
                            style={{ color: '#EAF9D9', borderBottomColor: '#EAF9D9' }}
                        >
                            Utilisateurs
                        </Link>
                    )}

                    {/* Cloche notifications */}
                    <NotificationBell />

                    {/* ✅ Profil avec soulignement actif */}
                    <Link 
                        to="/profile" 
                        className={`flex flex-col items-center transition ${isActive('/profile') ? 'opacity-100' : 'hover:opacity-80'}`}
                    >
                        <div className="flex items-center gap-1.5">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: '#EAF9D9' }}>
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} className="w-7 h-7 rounded-full object-cover" alt="avatar" />
                                ) : (
                                    <User className="w-4 h-4" style={{ color: '#653239' }} />
                                )}
                            </div>
                            <span className="text-sm font-medium" style={{ color: '#EAF9D9' }}>
                                {user?.name?.split(' ')[0] || 'Profil'}
                            </span>
                        </div>
                        {user?.role && (
                            <span className="text-xs px-2 py-0.5 rounded-full mt-0.5"
                                style={{ 
                                    backgroundColor: roleColor[user.role] + '40', 
                                    color: '#EAF9D9',
                                    fontSize: '10px'
                                }}>
                                {roleLabel[user.role]}
                            </span>
                        )}
                    </Link>

                    <button onClick={handleLogout}
                        className="px-3 py-1.5 rounded-lg text-sm font-semibold transition hover:opacity-90"
                        style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#EAF9D9' }}>
                        Déconnexion
                    </button>
                </>
            )}
        </div>
    );

    const navContent = (
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <Link to="/" className="text-xl font-bold flex items-center gap-2" style={{ color: '#EAF9D9' }}>
                    <Heart className="w-8 h-8" style={{ color: '#EAF9D9', fill: 'none' }} />
                    <span className="hidden sm:inline">Missions Bénévoles</span>
                    <span className="sm:hidden">MB</span>
                </Link>

                {navLinks}

                {/* Burger mobile */}
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg"
                    style={{ color: '#EAF9D9' }}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {showFullHeader ? (
                <div className="relative h-170 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/header.jpg')", backgroundColor: '#653239' }}>
                    <div className="absolute inset-0 bg-black/60"></div>
                    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'shadow-lg' : 'bg-gradient-to-b from-[#653239]/90 to-transparent'}`}
                        style={{ backgroundColor: scrolled ? '#653239' : 'transparent' }}>
                        {navContent}
                    </nav>
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-start text-center pt-55">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#EAF9D9' }}>
                            Missions Bénévoles
                        </h1>
                        <p className="text-sm md:text-base" style={{ color: '#E2D4BA' }}>
                            Faites la différence, un engagement à la fois
                        </p>
                    </div>
                </div>
            ) : (
                <nav className="fixed top-0 left-0 right-0 z-50 shadow-lg" style={{ backgroundColor: '#653239' }}>
                    {navContent}
                </nav>
            )}

            {/* Menu Mobile */}
            <div className={`md:hidden fixed top-16 left-0 right-0 z-50 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                style={{ backgroundColor: '#653239' }}>
                <div className="flex flex-col p-4 gap-3" style={{ borderTop: '1px solid #AF7A6D' }}>

                    {/* Infos utilisateur mobile */}
                    {isAuthenticated && (
                        <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid #AF7A6D' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: '#EAF9D9' }}>
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
                                ) : (
                                    <User className="w-5 h-5" style={{ color: '#653239' }} />
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-sm" style={{ color: '#EAF9D9' }}>{user?.name}</p>
                                <span className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: '#EAF9D9', color: '#653239' }}>
                                    {roleLabel[user?.role] || 'Bénévole'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Menu Mobile - Missions */}
                    <Link 
                        to="/" 
                        onClick={closeMenu} 
                        className={`py-2 transition pl-2 ${isActive('/') ? 'border-l-4 font-bold' : 'hover:border-l-4 hover:border-[#EAF9D9]/50 hover:pl-2'}`}
                        style={{ color: '#EAF9D9', borderLeftColor: '#EAF9D9' }}
                    >
                        Missions
                    </Link>

                    {!isAuthenticated ? (
                        <>
                            <Link 
                                to="/login" 
                                onClick={closeMenu} 
                                className={`py-2 transition pl-2 ${isActive('/login') ? 'border-l-4 font-bold' : 'hover:border-l-4 hover:border-[#EAF9D9]/50 hover:pl-2'}`}
                                style={{ color: '#EAF9D9', borderLeftColor: '#EAF9D9' }}
                            >
                                Se connecter
                            </Link>
                            <Link 
                                to="/register" 
                                onClick={closeMenu} 
                                className={`py-2 transition pl-2 ${isActive('/register') ? 'border-l-4 font-bold' : 'hover:border-l-4 hover:border-[#EAF9D9]/50 hover:pl-2'}`}
                                style={{ color: '#EAF9D9', borderLeftColor: '#EAF9D9' }}
                            >
                                S'inscrire
                            </Link>
                        </>
                    ) : (
                        <>
                            {(isAdmin || isManager) && (
                                <Link 
                                    to="/admin/dashboard" 
                                    onClick={closeMenu} 
                                    className={`py-2 transition pl-2 ${isActive('/admin/dashboard') ? 'border-l-4 font-bold' : 'hover:border-l-4 hover:border-[#EAF9D9]/50 hover:pl-2'}`}
                                    style={{ color: '#EAF9D9', borderLeftColor: '#EAF9D9' }}
                                >
                                    Dashboard
                                </Link>
                            )}
                            {!isAdmin && !isManager && (
                                <Link 
                                    to="/my-registrations" 
                                    onClick={closeMenu} 
                                    className={`py-2 transition pl-2 ${isActive('/my-registrations') ? 'border-l-4 font-bold' : 'hover:border-l-4 hover:border-[#EAF9D9]/50 hover:pl-2'}`}
                                    style={{ color: '#EAF9D9', borderLeftColor: '#EAF9D9' }}
                                >
                                    Mes inscriptions
                                </Link>
                            )}
                            {isAdmin && (
                                <Link 
                                    to="/admin/users" 
                                    onClick={closeMenu} 
                                    className={`py-2 transition pl-2 ${isActive('/admin/users') ? 'border-l-4 font-bold' : 'hover:border-l-4 hover:border-[#EAF9D9]/50 hover:pl-2'}`}
                                    style={{ color: '#EAF9D9', borderLeftColor: '#EAF9D9' }}
                                >
                                    Utilisateurs
                                </Link>
                            )}
                            <Link 
                                to="/profile" 
                                onClick={closeMenu} 
                                className={`py-2 transition pl-2 ${isActive('/profile') ? 'border-l-4 font-bold' : 'hover:border-l-4 hover:border-[#EAF9D9]/50 hover:pl-2'}`}
                                style={{ color: '#EAF9D9', borderLeftColor: '#EAF9D9' }}
                            >
                                Profil
                            </Link>
                            <button 
                                onClick={handleLogout} 
                                className="py-2 text-left hover:underline pl-2"
                                style={{ color: '#EAF9D9' }}
                            >
                                Déconnexion
                            </button>
                        </>
                    )}
                </div>
            </div>

            {isMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMenu}></div>
            )}
        </>
    );
}

export default Navbar;