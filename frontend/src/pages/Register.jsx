import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { User, Mail, Phone, Lock, Eye, EyeOff, Heart } from 'lucide-react';

function Register() {
    const [form, setForm] = useState({ 
        name: '', 
        prenom: '',
        email: '', 
        password: '', 
        password_confirmation: '', 
        phone: '' 
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const fullName = `${form.prenom} ${form.name}`.trim();
            const response = await api.post('/register', {
                name: fullName,
                email: form.email,
                password: form.password,
                password_confirmation: form.password_confirmation,
                phone: form.phone
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/');
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                const firstError = Object.values(errors)[0];
                setError(firstError[0]);
            } else {
                setError(err.response?.data?.message || "Erreur d'inscription");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10" style={{ backgroundColor: '#CCC7B9' }}>
            <div className="w-full max-w-md">
                {/* Logo et titre */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-17 h-17 rounded-2xl mb-4" style={{ backgroundColor: '#653239' }}>
                        <Heart className="w-8 h-8" style={{ color: '#EAF9D9', fill: 'none' }} />
                    </div>
                    <h2 className="text-1xl mb-2" style={{ color: '#653239', fontWeight: 'bold', fontSize: '30px' }}>Rejoignez-nous</h2>
                    <p style={{ color: '#453d3a82' }}>Créez votre compte bénévole</p>
                </div>

                {/* Formulaire d'inscription */}
                <div className="rounded-xl p-8 shadow-lg" style={{ backgroundColor: '#FFFFFF', border: `1px solid #E2D4BA` }}>
                    <p className="text-left text-xl font-semibold" style={{ color: '#251e1f', marginBottom: '25px' }}>
                        Inscription
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nom et Prénom */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-left" style={{ color: '#251e1f', marginBottom:"5px" }}>Nom*</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.border = '3px solid #653239'}
                                    onBlur={(e) => e.target.style.border = '1px solid #E2D4BA'}
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none transition"
                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f9a' }}
                                    placeholder="Dupont"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-left" style={{ color: '#251e1f', marginBottom:"5px" }}>Prénom*</label>
                                <input
                                    type="text"
                                    name="prenom"
                                    value={form.prenom}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.border = '3px solid #653239'}
                                    onBlur={(e) => e.target.style.border = '1px solid #E2D4BA'}
                                    className="w-full px-4 py-2 rounded-lg border focus:outline-none transition"
                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f9a' }}
                                    placeholder="Marie"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm text-left" style={{ color: '#251e1f', marginBottom:"5px" }}>Email*</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.border = '3px solid #653239'}
                                    onBlur={(e) => e.target.style.border = '1px solid #E2D4BA'}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition"
                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f9a' }}
                                    placeholder="marie.dupont@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Téléphone */}
                        <div>
                            <label className="block text-sm text-left" style={{ color: '#251e1f', marginBottom:"5px" }}>Téléphone*</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                </div>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.border = '3px solid #653239'}
                                    onBlur={(e) => e.target.style.border = '1px solid #E2D4BA'}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition"
                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f9a' }}
                                    placeholder="0612345678"
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label className="block text-sm text-left" style={{ color: '#251e1f', marginBottom:"5px" }}>Mot de passe*</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.border = '3px solid #653239'}
                                    onBlur={(e) => e.target.style.border = '1px solid #E2D4BA'}
                                    className="w-full pl-10 pr-12 py-2 rounded-lg border focus:outline-none transition"
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
                            <p className="text-xs text-gray-500 text-left" style={{ color: '#251e1f9a' }}>
                                Minimum 8 caractères
                            </p>
                        </div>

                        {/* Confirmation mot de passe */}
                        <div>
                            <label className="block text-sm text-left" style={{ color: '#251e1f', marginBottom:"5px" }}>Confirmer le mot de passe*</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="password_confirmation"
                                    value={form.password_confirmation}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.border = '3px solid #653239'}
                                    onBlur={(e) => e.target.style.border = '1px solid #E2D4BA'}
                                    className="w-full pl-10 pr-12 py-2 rounded-lg border focus:outline-none transition"
                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f9a' }}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                    ) : (
                                        <Eye className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8959588', color: '#cb0303', border: '1px solid #f6737387' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="w-full py-3 rounded-lg font-semibold transition transform btn-custom">
                            Créer mon compte
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm" style={{ color: '#251e1f' }}>
                            Déjà inscrit ? <span className="text-sm hover:underline" style={{ color: '#653239' }}>Se connecter</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;