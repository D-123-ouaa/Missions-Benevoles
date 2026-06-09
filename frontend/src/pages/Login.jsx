import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { User, Lock, Eye, EyeOff, Heart } from 'lucide-react';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [resendMsg, setResendMsg] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setNeedsVerification(false);
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/');
        } catch (err) {
            if (err.response?.data?.email_verified === false) {
                setNeedsVerification(true);
                setVerificationEmail(email);
            } else {
                setError(err.response?.data?.message || 'Erreur de connexion');
            }
        }
    };

    const handleResend = async () => {
        try {
            await api.post('/auth/resend-verification', { email: verificationEmail });
            setResendMsg('Email de vérification renvoyé ! Vérifiez votre boîte mail.');
        } catch {
            setResendMsg('Erreur lors de l\'envoi.');
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-30" style={{ backgroundColor: '#CCC7B9' }}>
            <div className="w-full max-w-md">
                {/* Logo et titre */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-17 h-17 rounded-2xl mb-4" style={{ backgroundColor: '#653239' }}>
                      <Heart className="w-8 h-8" style={{ color: '#EAF9D9', fill: 'none' }} />
                    </div>
                    <h2 className="text-1xl mb-2" style={{ color: '#653239', fontWeight: 'bold' , fontSize: '30px'}}>Missions Bénévoles</h2>
                    <p style={{ color: '#453d3a82' }}>Connectez-vous pour gérer vos missions</p>
                </div>

                {/* Formulaire de connexion */}
                
                <div className="rounded-xl p-8 shadow-lg" style={{ backgroundColor: '#FFFFFF', border: `1px solid #E2D4BA` }}>  
                    <p className="text-left text-xl font-semibold" style={{ color: '#251e1f', marginBottom: '25px' }}>
                        Connexion
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-sm text-left" style={{ color: '#251e1f' }}>Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={(e) => e.target.style.border = '3px solid #653239'}
                                    onBlur={(e) => e.target.style.border = '1px solid #E2D4BA'}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition"
                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f9a' }}
                                    placeholder="votre.email@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm text-left" style={{ color: '#251e1f' }}>Mot de passe</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={(e) => e.target.style.border = '3px solid #653239'}
                                    onBlur={(e) => e.target.style.border = '1px solid #E2D4BA'}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition"
                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f9a' }}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                    ) : (
                                        <Eye className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {needsVerification && (
                            <div className="p-4 rounded-lg text-sm" style={{ backgroundColor: '#fff8e1', border: '1px solid #f0c040', color: '#7a5c00' }}>
                                <p className="font-semibold mb-2">📧 Vérifiez votre email avant de vous connecter.</p>
                                <button onClick={handleResend} className="underline text-sm" style={{ color: '#653239' }}>
                                    Renvoyer l'email de vérification
                                </button>
                                {resendMsg && <p className="mt-2 text-green-700">{resendMsg}</p>}
                            </div>
                        )}

                        {error && (
                            <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8959588', color: '#cb0303', border: '1px solid #f6737387' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="w-full py-3 rounded-lg font-semibold transition transform btn-custom">
                            Se connecter
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/register" className="text-sm" style={{ color: '#251e1f' }}>
                            Pas encore de compte ? <span className="text-sm hover:underline" style={{ color: '#653239' }}>S'inscrire</span> 
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;