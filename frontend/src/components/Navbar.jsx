import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';

function Navbar({ showFullHeader = false }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
    // Récupération sécurisée du token et user
    const token = localStorage.getItem('token');
    
    // Version sécurisée pour le user
    const getUser = () => {
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                console.error('Erreur parsing user:', e);
                return {};
            }
        }
        return {};
    };
    
    const user = getUser();
    const isAuthenticated = !!token;
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
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

    // Contenu commun du navbar (logo + menu)
    const navContent = (
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <Link to="/" className="text-xl font-bold flex items-center gap-2" style={{ color: '#EAF9D9' }}>
                    <Heart className="w-8 h-8" style={{ color: '#EAF9D9', fill: 'none' }} />
                    <span className="hidden sm:inline">Missions Bénévoles</span>
                    <span className="sm:hidden">MB</span>
                </Link>

                {/* Menu Desktop */}
                <div className="hidden md:flex gap-6 items-center">
                    <Link to="/" className="hover:underline" style={{ color: '#EAF9D9' }}>Missions</Link>
                    {!isAuthenticated ? (
                        <Link to="/login" className="hover:underline" style={{ color: '#EAF9D9' }}>Se connecter</Link>
                    ) : isAdmin ? (
                        <>
                            <Link to="/profile" className="hover:underline" style={{ color: '#EAF9D9' }}>Profile</Link>
                            <button onClick={handleLogout} className="hover:underline" style={{ color: '#EAF9D9' }}>Déconnexion</button>
                        </>
                    ) : (
                        <>
                            <Link to="/my-registrations" className="hover:underline" style={{ color: '#EAF9D9' }}>Mes inscriptions</Link>
                            <Link to="/profile" className="hover:underline" style={{ color: '#EAF9D9' }}>Profile</Link>
                            <button onClick={handleLogout} className="hover:underline" style={{ color: '#EAF9D9' }}>Déconnexion</button>
                        </>
                    )}
                </div>

                {/* Bouton Burger pour mobile */}
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-lg" style={{ color: '#EAF9D9' }}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {showFullHeader ? (
                // Page d'accueil : Header avec grande image
                <div className="relative h-170 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/header.jpg')", backgroundColor: '#653239' }}>
                    <div className="absolute inset-0 bg-black/60"></div>
                    
                    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${scrolled ? 'shadow-lg' : 'bg-gradient-to-b from-[#653239]/90 to-transparent'}`} style={{ backgroundColor: scrolled ? '#653239' : 'transparent' }}>
                        {navContent}
                    </nav>

                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-start text-center pt-55">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#EAF9D9' }}>Missions Bénévoles</h1>
                        <p className="text-sm md:text-base" style={{ color: '#E2D4BA' }}>Faites la différence, un engagement à la fois</p>
                    </div>
                </div>
            ) : (
                // Autres pages : Navbar simple
                <nav className="fixed top-0 left-0 right-0 z-50 shadow-lg" style={{ backgroundColor: '#653239' }}>
                    {navContent}
                </nav>
            )}

            {/* Menu Mobile (dropdown simple) */}
            <div className={`md:hidden absolute top-16 left-0 right-0 z-50 transition-all duration-300 ease-in-out overflow-hidden ${
                    isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
                style={{ backgroundColor: '#653239' }}>
                <div className="flex flex-col p-4 gap-3 border-t" style={{ borderColor: '#AF7A6D' }}>
                    <Link to="/" onClick={closeMenu} className="py-2 hover:underline" style={{ color: '#EAF9D9' }}>
                        Missions
                    </Link>

                    {!isAuthenticated ? (
                        <Link to="/login" onClick={closeMenu} className="py-2 hover:underline" style={{ color: '#EAF9D9' }}>
                            Se connecter
                        </Link>
                    ) : isAdmin ? (
                        <>
                            <Link to="/profile" onClick={closeMenu} className="py-2 hover:underline" style={{ color: '#EAF9D9' }}>
                                Profile
                            </Link>
                            <button onClick={handleLogout} className="py-2 hover:underline" style={{ color: '#EAF9D9' }}>
                                Déconnexion
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/my-registrations" onClick={closeMenu} className="py-2 hover:underline" style={{ color: '#EAF9D9' }}>
                                Mes inscriptions
                            </Link>
                            <Link to="/profile" onClick={closeMenu} className="py-2 hover:underline" style={{ color: '#EAF9D9' }}>
                                Profile
                            </Link> 
                            <button onClick={handleLogout} className="py-2 hover:underline" style={{ color: '#EAF9D9' }}>
                                Déconnexion
                            </button>
                        </>
                    )}
                </div>
            </div>
            {/* Overlay */}
            {isMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeMenu}></div>}
        </>
    );
}

export default Navbar;