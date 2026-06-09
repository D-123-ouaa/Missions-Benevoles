import { useEffect, useState } from 'react';
import api from '../api/axios';
import { UserCog, Heart, Trash2, Shield, ToggleLeft, ToggleRight, Search, Users, Mail, Phone, CheckCircle, XCircle, ChevronDown, List, Plus, Edit, Eye, X, Key } from 'lucide-react';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordUser, setPasswordUser] = useState(null);
    const [passwordForm, setPasswordForm] = useState({
        password: '',
        password_confirmation: ''
    });
    
    // États pour les modals
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
    const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', password_confirmation: '', phone: '', role: 'volunteer' });
    const [viewingUser, setViewingUser] = useState(null);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Erreur:', err);
            showMsg('Erreur lors du chargement des utilisateurs', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const showMsg = (msg, type = 'success') => { 
        setMessage({ text: msg, type }); 
        setTimeout(() => setMessage(''), 3000); 
    };

    // Gestion des rôles
    const handleRole = async (id, role) => {
        try {
            await api.put(`/admin/users/${id}/role`, { role });
            setUsers(users.map(u => u.id === id ? { ...u, role } : u));
            showMsg('Rôle mis à jour', 'success');
        } catch { 
            showMsg('Erreur lors de la mise à jour', 'error'); 
        }
    };

    const handleUpdatePassword = async () => {
        if (passwordForm.password !== passwordForm.password_confirmation) {
            showMsg('Les mots de passe ne correspondent pas', 'error');
            return;
        }
        if (passwordForm.password.length < 8) {
            showMsg('Le mot de passe doit contenir au moins 8 caractères', 'error');
            return;
        }
        try {
            // Note: Vous devez ajouter cette route dans le backend
            await api.put(`/admin/users/${passwordUser.id}/password`, {
                password: passwordForm.password,
                password_confirmation: passwordForm.password_confirmation
            });
            setIsPasswordModalOpen(false);
            setPasswordForm({ password: '', password_confirmation: '' });
            showMsg('Mot de passe modifié avec succès', 'success');
        } catch (error) {
            showMsg(error.response?.data?.message || 'Erreur lors de la modification', 'error');
        }
    };

    // Gestion du statut
    const handleStatus = async (id, is_active) => {
        try {
            await api.put(`/admin/users/${id}/status`, { is_active });
            setUsers(users.map(u => u.id === id ? { ...u, is_active } : u));
            showMsg(is_active ? 'Compte activé' : 'Compte désactivé', 'success');
        } catch { 
            showMsg('Erreur lors du changement de statut', 'error'); 
        }
    };

    // Supprimer un utilisateur
    const handleDelete = async (id) => {
        if (!confirm('⚠️ Supprimer définitivement cet utilisateur ? Cette action est irréversible.')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            showMsg('Utilisateur supprimé', 'success');
        } catch { 
            showMsg('Erreur lors de la suppression', 'error'); 
        }
    };

    // Voir les détails d'un utilisateur
    const handleViewUser = (user) => {
        setViewingUser(user);
        setIsViewModalOpen(true);
    };

    // Modifier un utilisateur
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            phone: user.phone || ''
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async () => {
        try {
            const res = await api.put(`/admin/users/${selectedUser.id}`, editForm);
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...res.data.user } : u));
            setIsEditModalOpen(false);
            showMsg('Utilisateur mis à jour', 'success');
        } catch (error) {
            showMsg(error.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
        }
    };

    // Créer un utilisateur
    const handleCreateUser = async () => {
        if (createForm.password !== createForm.password_confirmation) {
            showMsg('Les mots de passe ne correspondent pas', 'error');
            return;
        }
        try {
            const res = await api.post('/admin/users', {
                name: createForm.name,
                email: createForm.email,
                password: createForm.password,
                role: createForm.role,
                phone: createForm.phone
            });
            setUsers([res.data.user, ...users]);
            setIsCreateModalOpen(false);
            setCreateForm({ name: '', email: '', password: '', password_confirmation: '', phone: '', role: 'volunteer' });
            showMsg('Utilisateur créé avec succès', 'success');
        } catch (error) {
            showMsg(error.response?.data?.message || 'Erreur lors de la création', 'error');
        }
    };

    const filtered = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = selectedRole === 'all' || u.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    const roleColors = { admin: '#653239', manager: '#AF7A6D', volunteer: '#8a9a6a' };
    const roleBgColors = { admin: '#65323910', manager: '#AF7A6D10', volunteer: '#8a9a6a10' };
    const roleLabels = { admin: 'Super Admin', manager: 'Manager', volunteer: 'Bénévole' };

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        managers: users.filter(u => u.role === 'manager').length,
        volunteers: users.filter(u => u.role === 'volunteer').length,
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length,
    };

    const roleOptions = [
        { value: 'all', label: 'Tous les rôles', icon: List, iconColor: '#AF7A6D' },
        { value: 'admin', label: 'Super Admin', icon: Shield, iconColor: '#653239' },
        { value: 'manager', label: 'Manager', icon: UserCog, iconColor: '#AF7A6D' },
        { value: 'volunteer', label: 'Bénévole', icon: Heart, iconColor: '#8a9a6a' },
    ];

    const getSelectedLabel = () => {
        const option = roleOptions.find(o => o.value === selectedRole);
        return option ? option.label : 'Tous les rôles';
    };

    const getSelectedIcon = () => {
        const option = roleOptions.find(o => o.value === selectedRole);
        if (option && option.icon) {
            const IconComponent = option.icon;
            return <IconComponent className="w-4 h-4" style={{ color: option.iconColor }} />;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]" style={{ backgroundColor: '#CCC7B9' }}>
                <div className="text-center">
                    <Heart className="w-12 h-12 animate-pulse mx-auto mb-4" style={{ color: '#653239' }} />
                    <p style={{ color: '#AF7A6D' }}>Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-20 pb-10 px-4" style={{ backgroundColor: '#CCC7B9' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header avec bouton créer */}
                <div className="mb-8 text-left">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex-1">
                            <h1 className="text-3xl md:text-4xl font-bold mb-5" style={{ color: '#653239', fontSize: '35px' }}>
                                Gestion des utilisateurs
                            </h1>
                            <p className="text-lg" style={{ color: '#AF7A6D', fontSize: '20px' }}>
                                Gérez les comptes et les rôles
                            </p>
                        </div>
                        <div>
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition hover:scale-105"
                                style={{ backgroundColor: '#653239', color: '#EAF9D9' }}
                            >
                                <Plus className="w-4 h-4" /> Nouvel utilisateur
                            </button>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                        message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Statistiques */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <div className="rounded-2xl p-4 shadow-lg text-center" style={{ backgroundColor: '#FFFFFF' }}>
                        <Users className="w-8 h-8 mx-auto mb-2" style={{ color: '#653239' }} />
                        <p className="text-2xl font-bold" style={{ color: '#653239' }}>{stats.total}</p>
                        <p className="text-xs" style={{ color: '#AF7A6D' }}>Total</p>
                    </div>
                    <div className="rounded-2xl p-4 shadow-lg text-center" style={{ backgroundColor: '#FFFFFF' }}>
                        <Shield className="w-8 h-8 mx-auto mb-2" style={{ color: '#653239' }} />
                        <p className="text-2xl font-bold" style={{ color: '#653239' }}>{stats.admins}</p>
                        <p className="text-xs" style={{ color: '#AF7A6D' }}>Admins</p>
                    </div>
                    <div className="rounded-2xl p-4 shadow-lg text-center" style={{ backgroundColor: '#FFFFFF' }}>
                        <UserCog className="w-8 h-8 mx-auto mb-2" style={{ color: '#AF7A6D' }} />
                        <p className="text-2xl font-bold" style={{ color: '#AF7A6D' }}>{stats.managers}</p>
                        <p className="text-xs" style={{ color: '#AF7A6D' }}>Managers</p>
                    </div>
                    <div className="rounded-2xl p-4 shadow-lg text-center" style={{ backgroundColor: '#FFFFFF' }}>
                        <Heart className="w-8 h-8 mx-auto mb-2" style={{ color: '#8a9a6a' }} />
                        <p className="text-2xl font-bold" style={{ color: '#8a9a6a' }}>{stats.volunteers}</p>
                        <p className="text-xs" style={{ color: '#AF7A6D' }}>Bénévoles</p>
                    </div>
                    <div className="rounded-2xl p-4 shadow-lg text-center" style={{ backgroundColor: '#FFFFFF' }}>
                        <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                        <p className="text-xs" style={{ color: '#AF7A6D' }}>Actifs</p>
                    </div>
                    <div className="rounded-2xl p-4 shadow-lg text-center" style={{ backgroundColor: '#FFFFFF' }}>
                        <XCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                        <p className="text-2xl font-bold text-red-500">{stats.inactive}</p>
                        <p className="text-xs" style={{ color: '#AF7A6D' }}>Inactifs</p>
                    </div>
                </div>

                {/* Filtres */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#AF7A6D' }} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom ou email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition"
                            style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f' }}
                        />
                    </div>
                    
                    <div className="relative w-56">
                        <button
                            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                            className="w-full px-4 py-2 rounded-lg border focus:outline-none transition flex items-center justify-between gap-2"
                            style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f' }}
                        >
                            <div className="flex items-center gap-2">
                                {getSelectedIcon()}
                                <span>{getSelectedLabel()}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform ${isRoleMenuOpen ? 'rotate-180' : ''}`} style={{ color: '#AF7A6D' }} />
                        </button>
                        
                        {isRoleMenuOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 overflow-hidden"
                                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D4BA' }}>
                                {roleOptions.map(option => {
                                    const IconComponent = option.icon;
                                    const isSelected = selectedRole === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSelectedRole(option.value);
                                                setIsRoleMenuOpen(false);
                                            }}
                                            className={`w-full px-4 py-2.5 flex items-center gap-2 transition hover:bg-gray-50 ${
                                                isSelected ? 'bg-gray-50' : ''
                                            }`}
                                            style={{ color: '#251e1f' }}
                                        >
                                            <IconComponent className="w-4 h-4" style={{ color: option.iconColor }} />
                                            <span className="flex-1 text-left">{option.label}</span>
                                            {isSelected && <CheckCircle className="w-4 h-4" style={{ color: '#653239' }} />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tableau */}
                <div className="rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead style={{ backgroundColor: '#fafaf9' }}>
                                <tr style={{ borderBottom: '2px solid #E2D4BA', backgroundColor: '#fafaf9' }}>
                                    <th className="text-left py-4 px-4" style={{ color: '#653239' }}>Utilisateur</th>
                                    <th className="text-left py-4 px-4" style={{ color: '#653239' }}>Contact</th>
                                    <th className="text-left py-4 px-4" style={{ color: '#653239' }}>Rôle</th>
                                    <th className="text-left py-4 px-4" style={{ color: '#653239', position: 'relative', left: '10px' }}>Statut</th>
                                    <th className="text-left py-4 px-4" style={{ color: '#653239', position: 'relative', left: '35px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition" style={{ borderBottom: index === filtered.length - 1 ? 'none' : '1px solid #E2D4BA' }}>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0"
                                                    style={{ backgroundColor: roleColors[user.role] }}>
                                                    {user.avatar ? (
                                                        <img src={`http://localhost:8000/storage/${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-bold">{user.name?.charAt(0).toUpperCase() || '?'}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold" style={{ color: '#251e1f' }}>{user.name}</p>
                                                    <p className="text-xs" style={{ color: '#AF7A6D' }}>ID: {user.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm" style={{ color: '#AF7A6D' }}>
                                                    <Mail className="w-3 h-3" /> {user.email}
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center gap-2 text-sm" style={{ color: '#AF7A6D' }}>
                                                        <Phone className="w-3 h-3" /> {user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                {user.role === 'admin' && <Shield className="w-4 h-4" style={{ color: '#653239' }} />}
                                                {user.role === 'manager' && <UserCog className="w-4 h-4" style={{ color: '#AF7A6D' }} />}
                                                {user.role === 'volunteer' && <Heart className="w-4 h-4" style={{ color: '#8a9a6a' }} />}
                                                <select value={user.role} onChange={e => handleRole(user.id, e.target.value)} className="px-3 py-1.5 rounded-lg text-sm font-semibold border cursor-pointer"
                                                    style={{ backgroundColor: roleBgColors[user.role], color: roleColors[user.role], borderColor: roleColors[user.role] + '30' }}>
                                                    <option value="volunteer">Bénévole</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="admin">Super Admin</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button onClick={() => handleStatus(user.id, !user.is_active)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition hover:scale-105">
                                                {user.is_active ? (
                                                    <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-xs font-medium text-green-600">Actif</span></>
                                                ) : (
                                                    <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-xs font-medium text-gray-500">Inactif</span></>
                                                )}
                                            </button>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => handleViewUser(user)} className="p-2 rounded-xl transition hover:bg-blue-50" title="Voir">
                                                    <Eye className="w-4 h-4 text-blue-500" />
                                                </button>
                                                <button onClick={() => handleEditUser(user)} className="p-2 rounded-xl transition hover:bg-yellow-50" title="Modifier">
                                                    <Edit className="w-4 h-4 text-yellow-600" />
                                                </button>
                                                <button onClick={() => {
                                                    setPasswordUser(user);
                                                    setIsPasswordModalOpen(true);
                                                }} className="p-2 rounded-xl transition hover:bg-purple-50" title="Changer mot de passe">
                                                    <Key className="w-4 h-4 text-purple-500" />
                                                </button>
                                                <button onClick={() => handleDelete(user.id)} className="p-2 rounded-xl transition hover:bg-red-50" title="Supprimer">
                                                    <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 mx-auto mb-3 opacity-40" style={{ color: '#AF7A6D' }} />
                            <p className="text-lg" style={{ color: '#AF7A6D' }}>Aucun utilisateur trouvé</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Voir détails */}
            {isViewModalOpen && viewingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsViewModalOpen(false)}>
                    <div className="bg-white rounded-2xl p-6 w-96 max-w-[90%]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold" style={{ color: '#653239' }}>Détails de l'utilisateur</h3>
                            <button onClick={() => setIsViewModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="text-center mb-4">
                            {/* Avatar avec vérification */}
                            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto overflow-hidden"
                                style={{ backgroundColor: !viewingUser.avatar ? roleColors[viewingUser.role] : 'transparent' }}>
                                {viewingUser.avatar ? (
                                    <img 
                                        src={`http://localhost:8000/storage/${viewingUser.avatar}`} 
                                        alt={viewingUser.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = viewingUser.name?.charAt(0).toUpperCase() || '?';
                                            e.target.parentElement.style.backgroundColor = roleColors[viewingUser.role];
                                        }}
                                    />
                                ) : (
                                    <span>{viewingUser.name?.charAt(0).toUpperCase() || '?'}</span>
                                )}
                            </div>
                            <h4 className="text-lg font-semibold mt-2">{viewingUser.name}</h4>
                            <p className="text-sm" style={{ color: '#AF7A6D' }}>{roleLabels[viewingUser.role]}</p>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" style={{ color: '#AF7A6D' }} />
                                <span>{viewingUser.email}</span>
                            </div>
                            {viewingUser.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" style={{ color: '#AF7A6D' }} />
                                    <span>{viewingUser.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>{viewingUser.is_active ? 'Compte actif' : 'Compte inactif'}</span>
                            </div>
                            <div className="pt-2 border-t" style={{ borderColor: '#E2D4BA' }}>
                                <p><strong>ID:</strong> {viewingUser.id}</p>
                                <p><strong>Inscrit le:</strong> {new Date(viewingUser.created_at).toLocaleDateString('fr-FR')}</p>
                                {viewingUser.email_verified_at && (
                                    <p><strong>Email vérifié le:</strong> {new Date(viewingUser.email_verified_at).toLocaleDateString('fr-FR')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Modifier */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsEditModalOpen(false)}>
                    <div className="bg-white rounded-2xl p-6 w-96 max-w-[90%]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold" style={{ color: '#653239' }}>Modifier l'utilisateur</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3">
                            <div><label className="text-sm font-medium">Nom</label><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-sm font-medium">Email</label><input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-sm font-medium">Téléphone</label><input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                            <div className="flex gap-2 mt-4">
                                <button onClick={handleUpdateUser} className="flex-1 py-2 rounded-xl bg-[#653239] text-white">Enregistrer</button>
                                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2 rounded-xl bg-gray-200">Annuler</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Changer mot de passe */}
            {isPasswordModalOpen && passwordUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsPasswordModalOpen(false)}>
                    <div className="bg-white rounded-2xl p-6 w-96 max-w-[90%]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold" style={{ color: '#653239' }}>
                                Changer le mot de passe
                            </h3>
                            <button onClick={() => {
                                setIsPasswordModalOpen(false);
                                setPasswordForm({ password: '', password_confirmation: '' });
                            }} className="p-1 hover:bg-gray-100 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto"
                                style={{ backgroundColor: roleColors[passwordUser.role] }}>
                                {passwordUser.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <h4 className="font-semibold mt-2">{passwordUser.name}</h4>
                            <p className="text-xs" style={{ color: '#AF7A6D' }}>{passwordUser.email}</p>
                        </div>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium block mb-1">Nouveau mot de passe *</label>
                                <input
                                    type="password"
                                    value={passwordForm.password}
                                    onChange={e => setPasswordForm({ ...passwordForm, password: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#653239]"
                                    placeholder="Minimum 8 caractères"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">Confirmer le mot de passe *</label>
                                <input
                                    type="password"
                                    value={passwordForm.password_confirmation}
                                    onChange={e => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#653239]"
                                    placeholder="Retapez le mot de passe"
                                />
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                                <button 
                                    onClick={handleUpdatePassword} 
                                    disabled={!passwordForm.password || !passwordForm.password_confirmation || passwordForm.password !== passwordForm.password_confirmation}
                                    className="flex-1 py-2 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#653239', color: '#FFFFFF' }}
                                >
                                    Modifier
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsPasswordModalOpen(false);
                                        setPasswordForm({ password: '', password_confirmation: '' });
                                    }} 
                                    className="flex-1 py-2 rounded-xl font-semibold transition hover:bg-gray-100"
                                    style={{ backgroundColor: '#E2D4BA', color: '#653239' }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Créer */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsCreateModalOpen(false)}>
                    <div className="bg-white rounded-2xl p-6 w-96 max-w-[90%]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold" style={{ color: '#653239' }}>Créer un utilisateur</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            <div><label className="text-sm font-medium">Nom *</label><input type="text" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-sm font-medium">Email *</label><input type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-sm font-medium">Mot de passe *</label><input type="password" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-sm font-medium">Confirmer *</label><input type="password" value={createForm.password_confirmation} onChange={e => setCreateForm({...createForm, password_confirmation: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-sm font-medium">Téléphone</label><input type="tel" value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-sm font-medium">Rôle</label>
                                <select value={createForm.role} onChange={e => setCreateForm({...createForm, role: e.target.value})} className="w-full p-2 border rounded-lg">
                                    <option value="volunteer">Bénévole</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Super Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button onClick={handleCreateUser} className="flex-1 py-2 rounded-xl bg-[#653239] text-white">Créer</button>
                                <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-2 rounded-xl bg-gray-200">Annuler</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;