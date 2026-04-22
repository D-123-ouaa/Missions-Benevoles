import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { User, Mail, Phone, Heart, Camera, Trash2, Lock, LogOut } from 'lucide-react';

function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [message, setMessage] = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);

    // Formulaires
    const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
    const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    // Récupérer les données du profil de l'utilisateur
    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setUser(response.data);
            setProfileForm({
                name: response.data.name || '',
                email: response.data.email || '',
                phone: response.data.phone || ''
            });
        } catch (error) {
            console.error('Erreur:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    // Gérer la mise à jour des informations personnelles
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/profile', profileForm);
            setUser(response.data.user);
            setMessage({ type: 'success', text: response.data.message });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la mise à jour' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // Gérer l'upload de la photo de profil
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await api.post('/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUser(response.data.user);
            setAvatarPreview(null);
            setMessage({ type: 'success', text: response.data.message });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de l\'upload' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // Gérer la suppression de la photo de profil
    const handleDeleteAvatar = async () => {
        if (!window.confirm('Voulez-vous vraiment supprimer votre photo de profil ?')) return;

        try {
            const response = await api.delete('/profile/avatar');
            setUser(response.data.user);
            setMessage({ type: 'success', text: response.data.message });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la suppression' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // Gérer la mise à jour du mot de passe
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        try {
            const response = await api.put('/profile/password', {
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
                new_password_confirmation: passwordForm.new_password_confirmation
            });
            setMessage({ type: 'success', text: response.data.message });
            setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors du changement de mot de passe' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // Gérer la suppression du compte
    const handleDeleteAccount = async () => {
        if (!window.confirm('⚠️ Attention : Cette action est irréversible. Voulez-vous vraiment supprimer votre compte ?')) return;

        try {
            await api.delete('/profile');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la suppression' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]" style={{ backgroundColor: '#CCC7B9' }}>
                <div className="text-center">
                    <Heart className="w-12 h-12 animate-pulse mx-auto mb-4" style={{ color: '#653239' }} />
                    <p style={{ color: '#AF7A6D' }}>Chargement du profil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 py-24" style={{ backgroundColor: '#CCC7B9' }}>
            <div className="container mx-auto max-w-4xl">
                {/* En-tête */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-5" style={{ color: '#653239', fontSize: "35px" }}>
                        Mon profil
                    </h1>
                    <p className="text-lg" style={{ color: '#AF7A6D', fontSize: "25px", top:"-20px", position:"relative" }}>
                        Gérez vos informations personnelles
                    </p>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg text-center ${
                        message.type === 'success' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="rounded-xl overflow-hidden shadow-lg" style={{ backgroundColor: '#FFFFFF', border: `1px solid #E2D4BA` }}>
                            {/* Avatar */}
                            <div className="relative p-6 text-center border-b" style={{ borderColor: '#E2D4BA' }}>
                                <div className="relative inline-block">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Aperçu" className="w-32 h-32 rounded-full object-cover mx-auto" />
                                    ) : user?.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.name} className="w-32 h-32 rounded-full object-cover mx-auto" />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: '#EAF9D9' }}>
                                            <User className="w-16 h-16" style={{ color: '#653239' }} />
                                        </div>
                                    )}
                                    <label className="absolute bottom-0 right-0 p-1 rounded-full cursor-pointer" style={{ backgroundColor: '#653239' }}>
                                        <Camera className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                    </label>
                                </div>
                                <h2 className="mt-4 text-xl font-semibold" style={{ color: '#251e1f' }}>{user?.name}</h2>
                                <p className="text-sm" style={{ color: '#AF7A6D' }}>{user?.role === 'admin' ? 'Administrateur' : 'Bénévole'}</p>
                                {user?.avatar && (
                                    <button onClick={handleDeleteAvatar} className="mt-2 text-xs hover:underline" style={{ color: '#AF7A6D' }}>
                                        Supprimer la photo
                                    </button>
                                )}
                            </div>

                            {/* Navigation onglets */}
                            <div className="p-4 space-y-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                                        activeTab === 'profile' ? 'text-white' : ''
                                    }`}
                                    style={{ backgroundColor: activeTab === 'profile' ? '#653239' : 'transparent', color: activeTab === 'profile' ? '#FFFFFF' : '#AF7A6D' }}
                                >
                                    <User className="w-5 h-5" />
                                    <span>Informations personnelles</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('password')}
                                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                                        activeTab === 'password' ? 'text-white' : ''
                                    }`}
                                    style={{ backgroundColor: activeTab === 'password' ? '#653239' : 'transparent', color: activeTab === 'password' ? '#FFFFFF' : '#AF7A6D' }}
                                >
                                    <Lock className="w-5 h-5" />
                                    <span>Changer mot de passe</span>
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition hover:opacity-80"
                                    style={{ backgroundColor: '#AF7A6D', color: '#FFFFFF' }}
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Supprimer mon compte</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Contenu principal */}
                    <div className="lg:col-span-2">
                        <div className="rounded-xl p-6 shadow-lg" style={{ backgroundColor: '#FFFFFF', border: `1px solid #E2D4BA` }}>
                            {activeTab === 'profile' && (
                                <>
                                    <h2 className="text-xl font-semibold text-left" style={{ color: '#251e1f', marginBottom:"20px" }}>Informations personnelles</h2>
                                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                                        <div>
                                            <label className="block text-sm mb-1 text-left" style={{ color: '#251e1f' }}>Nom complet</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <User className="h-5 w-5" style={{ color: '#AF7A6D' }} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={profileForm.name}
                                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition"
                                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f' }}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1 text-left" style={{ color: '#251e1f' }}>Email</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Mail className="h-5 w-5" style={{ color: '#AF7A6D' }} />
                                                </div>
                                                <input
                                                    type="email"
                                                    value={profileForm.email}
                                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition"
                                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f' }}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1 text-left" style={{ color: '#251e1f' }}>Téléphone</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone className="h-5 w-5" style={{ color: '#AF7A6D' }} />
                                                </div>
                                                <input
                                                    type="tel"
                                                    value={profileForm.phone}
                                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition"
                                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f' }}
                                                />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full py-2 rounded-lg font-semibold transition hover:opacity-90" style={{ backgroundColor: '#653239', color: '#FFFFFF' }}>
                                            Mettre à jour
                                        </button>
                                    </form>
                                </>
                            )}

                            {activeTab === 'password' && (
                                <>
                                    <h2 className="text-xl font-semibold text-left" style={{ color: '#251e1f', marginBottom:"20px" }}>Changer le mot de passe</h2>
                                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                        <div>
                                            <label className="block text-sm mb-1 text-left" style={{ color: '#251e1f' }}>Mot de passe actuel</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5" style={{ color: '#AF7A6D' }} />
                                                </div>
                                                <input
                                                    type="password"
                                                    value={passwordForm.current_password}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition"
                                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f' }}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1 text-left" style={{ color: '#251e1f' }}>Nouveau mot de passe</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5" style={{ color: '#AF7A6D' }} />
                                                </div>
                                                <input
                                                    type="password"
                                                    value={passwordForm.new_password}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition"
                                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f' }}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm mb-1 text-left" style={{ color: '#251e1f' }}>Confirmer le nouveau mot de passe</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Lock className="h-5 w-5" style={{ color: '#AF7A6D' }} />
                                                </div>
                                                <input
                                                    type="password"
                                                    value={passwordForm.new_password_confirmation}
                                                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition"
                                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f' }}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full py-2 rounded-lg font-semibold transition hover:opacity-90" style={{ backgroundColor: '#653239', color: '#FFFFFF' }}>
                                            Changer le mot de passe
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;