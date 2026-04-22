import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

function Footer() {
    const currentYear = new Date().getFullYear();
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;

    // Fonction de déconnexion : supprime le token et les infos utilisateur du localStorage, puis redirige vers la page d'accueil
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <footer className="mt-auto" style={{ backgroundColor: '#653239' }}>
            <div className="container mx-auto px-6 py-8">
                {/* Grille responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center sm:text-left">
                    
                    {/* Colonne 1 : Logo et description */}
                    <div className="flex flex-col items-center sm:items-start">
                        <div className="flex items-center gap-2 mb-4">
                            <Heart className="w-6 h-6" style={{ color: '#AF7A6D', fill: 'none' }} />
                            <span className="text-lg font-bold" style={{ color: '#EAF9D9' }}>Missions Bénévoles</span>
                        </div>
                        <p className="text-sm" style={{ color: '#AF7A6D', maxWidth: '250px' }}>
                            Faites la différence, un engagement à la fois.
                        </p>
                    </div>

                    {/* Colonne 2 : Liens rapides */}
                    <div>
                        <h3 className="text-md font-semibold mb-4" style={{ color: '#EAF9D9' }}>Liens rapides</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-sm hover:underline transition" style={{ color: '#AF7A6D' }}>Accueil</Link></li>
                            <li><Link to="/" className="text-sm hover:underline transition" style={{ color: '#AF7A6D' }}>Missions</Link></li>
                            {isAuthenticated ? (
                                <>
                                    <li><Link to="/profile" className="text-sm hover:underline transition" style={{ color: '#AF7A6D' }}>Mon profil</Link></li>
                                    <li><button onClick={handleLogout} className="text-sm hover:underline transition" style={{ color: '#AF7A6D' }}>Déconnexion</button></li>
                                </>
                            ) : (
                                <li><Link to="/login" className="text-sm hover:underline transition" style={{ color: '#AF7A6D' }}>Se connecter</Link></li>
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
                                <span className="text-sm" style={{ color: '#AF7A6D' }}>+21 62 33 44 55</span>
                            </li>
                            <li className="flex items-center justify-center sm:justify-start gap-2">
                                <MapPin className="w-4 h-4 shrink-0" style={{ color: '#AF7A6D' }} />
                                <span className="text-sm" style={{ color: '#AF7A6D' }}>Marrackech, centre ville</span>
                            </li>
                        </ul>
                    </div>

                    {/* Colonne 4 : Réseaux sociaux */}
                    <div>
                        <h3 className="text-md font-semibold mb-4" style={{ color: '#EAF9D9' }}>Suivez-nous</h3>
                        <div className="flex gap-4 justify-center sm:justify-start">
                            <a href="#" className="text-xl hover:opacity-70 transition" style={{ color: '#AF7A6D' }}>📘</a>
                            <a href="#" className="text-xl hover:opacity-70 transition" style={{ color: '#AF7A6D' }}>🐦</a>
                            <a href="#" className="text-xl hover:opacity-70 transition" style={{ color: '#AF7A6D' }}>📷</a>
                            <a href="#" className="text-xl hover:opacity-70 transition" style={{ color: '#AF7A6D' }}>💼</a>
                        </div>
                    </div>
                </div>

                {/* Séparateur */}
                <div className="border-t my-6" style={{ borderColor: '#AF7A6D' }}></div>

                {/* Copyright */}
                <div className="text-center">
                    <p className="text-xs" style={{ color: '#AF7A6D' }}>
                        © {currentYear} Missions Bénévoles - Tous droits réservés
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;