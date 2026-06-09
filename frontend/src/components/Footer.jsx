import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

function Footer() {
    const currentYear = new Date().getFullYear();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        window.scrollTo(0, 0);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="mt-auto" style={{ backgroundColor: '#653239' }}>
            <div className="container mx-auto px-6 py-8">
                {/* Grille responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
                    
                    {/* Colonne 1 : Logo et description */}
                    <div className="flex flex-col items-center sm:items-start">
                        <Link to="/" onClick={scrollToTop} className="flex items-center gap-2 mb-4 hover:opacity-80 transition">
                            <Heart className="w-6 h-6" style={{ color: '#AF7A6D', fill: 'none' }} />
                            <span className="text-lg font-bold" style={{ color: '#EAF9D9' }}>Missions Bénévoles</span>
                        </Link>
                        <p className="text-sm" style={{ color: '#AF7A6D', maxWidth: '250px' }}>
                            Faites la différence, un engagement à la fois.
                        </p>
                    </div>

                    {/* Colonne 2 : Liens rapides */}
                    <div>
                        <h3 className="text-md font-semibold mb-4" style={{ color: '#EAF9D9' }}>Liens rapides</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" onClick={scrollToTop} className="text-sm hover:underline transition" style={{ color: '#AF7A6D' }}>
                                    Missions
                                </Link>
                            </li>
                            {isAuthenticated && !isAdmin && !isManager && (
                                <li>
                                    <Link to="/my-registrations" onClick={scrollToTop} className="text-sm hover:underline transition" style={{ color: '#AF7A6D' }}>
                                        Mes inscriptions
                                    </Link>
                                </li>
                            )}
                            {(isAdmin || isManager) && (
                                <li>
                                    <Link to="/admin/dashboard" onClick={scrollToTop} className="text-sm hover:underline transition" style={{ color: '#AF7A6D' }}>
                                        Tableau de bord
                                    </Link>
                                </li>
                            )}
                            {(isAdmin) && (
                                <li>
                                    <Link to="/admin/users" onClick={scrollToTop} className="text-sm hover:underline transition" style={{ color: '#AF7A6D' }}>
                                        Utilisateurs
                                    </Link>
                                </li>
                            )}
                            {isAuthenticated && (
                                <li>
                                    <Link to="/profile" onClick={scrollToTop} className="text-sm hover:underline transition" style={{ color: '#AF7A6D' }}>
                                        Mon profil
                                    </Link>
                                </li>
                            )}
                            {isAuthenticated ? (
                                <li>
                                    <button onClick={handleLogout} className="text-sm hover:underline transition" style={{ color: '#AF7A6D' }}>
                                        Déconnexion
                                    </button>
                                </li>
                            ) : (
                                <li>
                                    <Link to="/login" onClick={scrollToTop} className="text-sm hover:underline transition" style={{ color: '#AF7A6D' }}>
                                        Se connecter
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Colonne 3 : Contact */}
                    <div>
                        <h3 className="text-md font-semibold mb-4" style={{ color: '#EAF9D9' }}>Contact</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center justify-center sm:justify-start gap-2">
                                <Mail className="w-4 h-4 shrink-0" style={{ color: '#AF7A6D' }} />
                                <span className="text-sm break-all" style={{ color: '#AF7A6D' }}>adminprincip@gmail.com</span>
                            </li>
                            <li className="flex items-center justify-center sm:justify-start gap-2">
                                <Phone className="w-4 h-4 shrink-0" style={{ color: '#AF7A6D' }} />
                                <span className="text-sm" style={{ color: '#AF7A6D' }}>+212 6 23 34 45 55</span>
                            </li>
                            <li className="flex items-center justify-center sm:justify-start gap-2">
                                <MapPin className="w-4 h-4 shrink-0" style={{ color: '#AF7A6D' }} />
                                <span className="text-sm" style={{ color: '#AF7A6D' }}>Marrakech, centre ville</span>
                            </li>
                        </ul>
                    </div>

                    {/* Colonne 4 : Réseaux sociaux */}
                    <div>
                        <h3 className="text-md font-semibold mb-4" style={{ color: '#EAF9D9' }}>Suivez-nous</h3>
                        <div className="flex gap-4 justify-center sm:justify-start">
                            <a 
                                href="https://facebook.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 rounded-full hover:bg-white/10 transition-all hover:scale-110"
                                style={{ color: '#AF7A6D' }}
                                aria-label="Facebook"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.99h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z"/>
                                </svg>
                            </a>
                            <a 
                                href="https://twitter.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 rounded-full hover:bg-white/10 transition-all hover:scale-110"
                                style={{ color: '#AF7A6D' }}
                                aria-label="Twitter"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </a>
                            <a 
                                href="https://instagram.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 rounded-full hover:bg-white/10 transition-all hover:scale-110"
                                style={{ color: '#AF7A6D' }}
                                aria-label="Instagram"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zM12 16c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm7.846-10.405c0 .795-.646 1.441-1.441 1.441-.795 0-1.441-.646-1.441-1.441 0-.795.646-1.441 1.441-1.441.795 0 1.441.646 1.441 1.441z"/>
                                </svg>
                            </a>
                            <a 
                                href="https://linkedin.com" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 rounded-full hover:bg-white/10 transition-all hover:scale-110"
                                style={{ color: '#AF7A6D' }}
                                aria-label="LinkedIn"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.203 0 22.225 0z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Séparateur */}
                <div className="border-t my-6" style={{ borderColor: '#AF7A6D' }}></div>

                {/* Copyright avec retour haut de page */}
                <div className="text-center">
                    <p className="text-xs" style={{ color: '#AF7A6D' }}>
                        © {currentYear} Missions Bénévoles - Tous droits réservés
                    </p>
                    <button 
                        onClick={scrollToTop}
                        className="text-xs mt-2 hover:underline transition"
                        style={{ color: '#AF7A6D' }}
                    >
                        ↑ Retour en haut
                    </button>
                </div>
            </div>
        </footer>
    );
}

export default Footer;