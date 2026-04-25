import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import 'animate.css';
import { Calendar, MapPin, Users, Heart, X, ChevronLeft, ChevronRight, User, Plus } from 'lucide-react';

function Dashboard() {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredMission, setHoveredMission] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState({});
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });
    const [selectedMission, setSelectedMission] = useState(null);
    const [modalImageIndex, setModalImageIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [message, setMessage] = useState('');
    const [filters, setFilters] = useState({
        date: '',
        location: ''
    });

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user?.role === 'admin';

    // Récupérer les missions avec pagination
    const fetchMissions = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page };
            if (filters.date) params.date = filters.date;
            if (filters.location) params.location = filters.location;
            console.log('Filtres envoyés:', params);
            const response = await api.get('/missions', { params });
            const missionsData = response.data.data || response.data;
            setMissions(Array.isArray(missionsData) ? missionsData : []);
            setPagination({
                current_page: response.data.current_page || page,
                last_page: response.data.last_page || 1,
                total: response.data.total || 0
            });
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchMissions(1);
    }, [fetchMissions]);

    // Auto-défilement des images au survol
    useEffect(() => {
        if (hoveredMission !== null) {
            const mission = missions.find(m => m.id === hoveredMission);
            if (mission?.images && mission.images.length > 1) {
                const interval = setInterval(() => {
                    setCurrentImageIndex(prev => ({
                        ...prev,
                        [hoveredMission]: ((prev[hoveredMission] || 0) + 1) % mission.images.length
                    }));
                }, 1500);
                return () => clearInterval(interval);
            }
        }
    }, [hoveredMission, missions]);

    useEffect(() => {
        if (selectedMission) {
            checkRegistration(selectedMission.id);
        }
    }, [selectedMission]);

    const handleImageIndex = (missionId, index) => {
        setCurrentImageIndex(prev => ({ ...prev, [missionId]: index }));
    };

    // Gérer la pagination
    const goToPage = (page) => {
        if (page >= 1 && page <= pagination.last_page) {
            fetchMissions(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Ouvrir et fermer le modal avec les détails de la mission
    const openModal = (mission) => {
        // Si admin, rediriger vers la page details
        if (isAdmin) {
            navigate(`/admin/missions/show/${mission.id}`);
            return;
        }
        setSelectedMission(mission);
        setModalImageIndex(0);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMission(null);
        setMessage('');
        document.body.style.overflow = 'auto';
    };

    // Vérifier si l'utilisateur est déjà inscrit à la mission
    const checkRegistration = async (missionId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsRegistered(false);
            return;
        }
        try {
            const response = await api.get('/my-registrations');
            const registered = response.data.registrations?.some(m => m.id == missionId);
            setIsRegistered(registered);
        } catch (error) {
            console.error('Erreur:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsRegistered(false);
            }
        }
    };

    // Gérer l'inscription et le désistement à une mission
    const handleRegister = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            closeModal();
            navigate('/login');
            return;
        }
        
        try {
            await api.post(`/missions/${selectedMission.id}/register`);
            setMessage({ type: 'success', text: 'Inscription réussie !' });
            setIsRegistered(true);
            fetchMissions(pagination.current_page);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'inscription' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleUnregister = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            closeModal();
            navigate('/login');
            return;
        }
        
        try {
            await api.delete(`/missions/${selectedMission.id}/unregister`);
            setMessage({ type: 'success', text: 'Désistement réussi' });
            setIsRegistered(false);
            fetchMissions(pagination.current_page);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors du désistement' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // Gérer la navigation entre les images dans le modal
    const nextModalImage = () => {
        if (selectedMission?.images) {
            setModalImageIndex((prev) => (prev + 1) % selectedMission.images.length);
        }
    };

    const prevModalImage = () => {
        if (selectedMission?.images) {
            setModalImageIndex((prev) => (prev - 1 + selectedMission.images.length) % selectedMission.images.length);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]" style={{ backgroundColor: '#CCC7B9' }}>
                <div className="text-center">
                    <Heart className="w-12 h-12 animate-pulse mx-auto mb-4" style={{ color: '#653239' }} />
                    <p style={{ color: '#AF7A6D' }}>Chargement des missions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#CCC7B9' }}>
            <div className="container mx-auto px-4 py-8 pt-24">
                {/* En-tête avec bouton création pour admin */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-5" style={{ color: '#653239', fontSize: "35px" }}>
                        Missions disponibles
                    </h1>
                    <p className="text-lg" style={{ color: '#AF7A6D', fontSize: "25px", top:"-20px", position:"relative" }}>
                        Rejoignez une mission et faites la différence
                    </p>
                    
                    {/* Bouton Créer une mission - visible seulement pour admin */}
                    {isAdmin && (
                        <div className="mt-6">
                            <Link to="/admin/missions/create">
                                <button className="px-6 py-2 rounded-lg font-semibold transition hover:opacity-90 flex items-right gap-2 mx-auto" style={{ backgroundColor: '#653239', color: '#EAF9D9' }}>
                                    <Plus className="w-5 h-5" />
                                    Créer une nouvelle mission
                                </button>
                            </Link>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 justify-center mb-8">
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                        className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                        style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF' }}
                    />
                    <input
                        type="text"
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        placeholder="Filtrer par lieu..."
                        className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 w-64"
                        style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF' }}
                    />
                    <button
                        onClick={() => fetchMissions(1)}
                        className="px-6 py-2 rounded-lg font-semibold transition hover:opacity-90"
                        style={{ backgroundColor: '#653239', color: '#FFFFFF' }}
                    >
                        Filtrer
                    </button>
                    <button
                        onClick={() => {
                            setFilters({ date: '', location: '' });
                            fetchMissions(1);
                        }}
                        className="px-6 py-2 rounded-lg font-semibold transition hover:opacity-90"
                        style={{ backgroundColor: '#AF7A6D', color: '#FFFFFF' }}
                    >
                        Réinitialiser
                    </button>
                </div>

                {missions.length === 0 ? (
                    <div className="text-center py-12">
                        <p style={{ color: '#AF7A6D' }}>Aucune mission disponible pour le moment.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {missions.map((mission) => {
                                const hasImages = mission.images && mission.images.length > 0;
                                const currentImgIndex = currentImageIndex[mission.id] || 0;
                                
                                return (
                                    <div 
                                        key={mission.id}
                                        className="rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl mx-auto w-full max-w-sm shadow-lg cursor-pointer animate__animated animate__fadeInUp"
                                        style={{ 
                                            backgroundColor: '#FFFFFF', 
                                            border: '1px solid #E2D4BA'
                                        }}
                                        onMouseEnter={() => setHoveredMission(mission.id)}
                                        onMouseLeave={() => {
                                            setHoveredMission(null);
                                            handleImageIndex(mission.id, 0);
                                        }}
                                        onClick={() => openModal(mission)}
                                    >
                                        <div className="relative h-64 overflow-hidden rounded-t-xl">
                                            {hasImages ? (
                                                <>
                                                    <img 
                                                        src={mission.images[currentImgIndex]?.url} 
                                                        alt={mission.title} 
                                                        className="w-full h-full object-cover transition-all duration-500"
                                                    />
                                                    
                                                    {mission.images.length > 1 && (
                                                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                                                            {mission.images.map((_, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleImageIndex(mission.id, idx);
                                                                    }}
                                                                    className={`transition-all rounded-full ${
                                                                        idx === currentImgIndex 
                                                                            ? 'w-5 h-1.5 bg-white' 
                                                                            : 'w-1.5 h-1.5 bg-white/50'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}

                                                    {mission.images.length > 1 && (
                                                        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                                                            {currentImgIndex + 1}/{mission.images.length}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#EAF9D9' }}>
                                                    <Heart className="w-12 h-12" style={{ color: '#653239', fill: 'none' }} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            <h2 className="text-xl font-bold mb-2 line-clamp-1 pb-2" style={{ color: '#653239', fontSize: "20px" }}>
                                                {mission.title}
                                            </h2>
                                            
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-sm" style={{ color: '#AF7A6D' }}>
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(mission.date).toLocaleDateString('fr-FR')}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm" style={{ color: '#AF7A6D' }}>
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="truncate">{mission.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm" style={{ color: '#653239' }}>
                                                    <Users className="w-4 h-4" />
                                                    <span className="font-medium">{mission.available_places} places</span>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                className="w-full py-2 rounded-lg font-semibold transition duration-300 hover:opacity-90"
                                                style={{ backgroundColor: isAdmin ? '#AF7A6D' : '#653239', color: '#FFFFFF' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openModal(mission);
                                                }}
                                            >
                                                {isAdmin ? 'Gérer cette mission' : 'Voir les détails'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {pagination.last_page > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-12 pb-12">
                                <button
                                    onClick={() => goToPage(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className="px-4 py-2 rounded-lg transition disabled:opacity-50"
                                    style={{ backgroundColor: '#653239', color: '#FFFFFF' }}
                                >
                                    ← Précédent
                                </button>
                                
                                <span className="px-4 py-2" style={{ color: '#653239' }}>
                                    Page {pagination.current_page} / {pagination.last_page}
                                </span>
                                
                                <button
                                    onClick={() => goToPage(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="px-4 py-2 rounded-lg transition disabled:opacity-50"
                                    style={{ backgroundColor: '#653239', color: '#FFFFFF' }}
                                >
                                    Suivant →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal - visible seulement pour les non-admins */}
            {!isAdmin && isModalOpen && selectedMission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={closeModal}>
                    <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl" style={{ backgroundColor: '#FFFFFF' }} onClick={(e) => e.stopPropagation()}>
                        {/* Bouton fermeture */}
                        <button onClick={closeModal} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition">
                            <X className="w-6 h-6 text-white" />
                        </button>

                        {/* Carrousel */}
                        <div className="relative h-96 bg-gray-200">
                            {selectedMission.images && selectedMission.images.length > 0 ? (
                                <>
                                    <img 
                                        src={selectedMission.images[modalImageIndex]?.url} 
                                        alt={selectedMission.title} 
                                        className="w-full h-full object-cover"
                                    />
                                    
                                    {selectedMission.images.length > 1 && (
                                        <>
                                            <button onClick={prevModalImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition">
                                                <ChevronLeft className="w-6 h-6 text-white" />
                                            </button>
                                            <button onClick={nextModalImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition">
                                                <ChevronRight className="w-6 h-6 text-white" />
                                            </button>
                                        </>
                                    )}

                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                        {selectedMission.images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setModalImageIndex(idx)}
                                                className={`transition-all rounded-full ${
                                                    idx === modalImageIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50'
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    <div className="absolute top-4 right-16 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                        {modalImageIndex + 1} / {selectedMission.images.length}
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#EAF9D9' }}>
                                    <Heart className="w-20 h-20" style={{ color: '#653239', fill: 'none' }} />
                                </div>
                            )}
                        </div>

                        {/* Contenu du modal */}
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold" style={{ color: '#653239' }}>{selectedMission.title}</h2>
                                {new Date(selectedMission.date) < new Date() && (
                                    <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#E2D4BA', color: '#653239' }}>
                                        Mission passée
                                    </span>
                                )}
                                {selectedMission.available_places <= 0 && new Date(selectedMission.date) >= new Date() && (
                                    <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#AF7A6D', color: '#FFFFFF' }}>
                                        Complet
                                    </span>
                                )}
                            </div>

                            <p className="text-gray-700 mb-6 leading-relaxed">{selectedMission.description}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-6 border-b" style={{ borderColor: '#E2D4BA' }}>
                                <div className="flex items-center gap-3" style={{ color: '#AF7A6D' }}>
                                    <Calendar className="w-5 h-5" />
                                    <div>
                                        <p className="text-sm font-medium text-left" style={{ color: '#653239' }}>Date</p>
                                        <p>{new Date(selectedMission.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3" style={{ color: '#AF7A6D' }}>
                                    <MapPin className="w-5 h-5" />
                                    <div>
                                        <p className="text-sm font-medium text-left" style={{ color: '#653239' }}>Lieu</p>
                                        <p>{selectedMission.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3" style={{ color: '#AF7A6D' }}>
                                    <Users className="w-5 h-5" />
                                    <div>
                                        <p className="text-sm font-medium text-left" style={{ color: '#653239' }}>Places disponibles</p>
                                        <p className="font-semibold" style={{ color: selectedMission.available_places > 0 ? '#653239' : '#AF7A6D' }}>
                                            {selectedMission.available_places} restantes
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3" style={{ color: '#AF7A6D' }}>
                                    <User className="w-5 h-5" />
                                    <div>
                                        <p className="text-sm font-medium text-left" style={{ color: '#653239' }}>Inscrits</p>
                                        <p>{selectedMission.volunteers?.length || 0} bénévole(s)</p>
                                    </div>
                                </div>
                            </div>

                            {message && (
                                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            {new Date(selectedMission.date) >= new Date() && (
                                <button
                                    onClick={isRegistered ? handleUnregister : handleRegister}
                                    disabled={selectedMission.available_places <= 0 && !isRegistered}
                                    className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${selectedMission.available_places <= 0 && !isRegistered ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                                    style={{ backgroundColor: isRegistered ? '#AF7A6D' : '#653239', color: '#FFFFFF' }}
                                >
                                    {isRegistered ? 'Se désister' : (selectedMission.available_places <= 0 ? 'Mission complète' : "S'inscrire")}
                                </button>
                            )}

                            {new Date(selectedMission.date) < new Date() && (
                                <div className="text-center py-3 rounded-lg" style={{ backgroundColor: '#E2D4BA', color: '#653239' }}>
                                    Cette mission est déjà passée
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;