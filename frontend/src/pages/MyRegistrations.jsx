import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, MapPin, Heart, Users, X, ChevronLeft, ChevronRight, User } from 'lucide-react';

function MyRegistrations() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [selectedMission, setSelectedMission] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageIndex, setModalImageIndex] = useState(0);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    // Récupérer les missions auxquelles l'utilisateur est inscrit 
    const fetchRegistrations = async () => {
        try {
            const response = await api.get('/my-registrations');
            setRegistrations(response.data.registrations || []);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    // Gérer le désistement d'une mission
    const handleUnregister = async (missionId, missionTitle) => {
        if (!window.confirm(`Voulez-vous vraiment vous désister de la mission "${missionTitle}" ?`)) {
            return;
        }

        try {
            await api.delete(`/missions/${missionId}/unregister`);
            setMessage({ type: 'success', text: 'Désistement réussi !' });
            fetchRegistrations();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors du désistement' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // Ouvrir et fermer le modal avec les détails de la mission
    const openModal = (mission) => {
        setSelectedMission(mission);
        setModalImageIndex(0);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMission(null);
        document.body.style.overflow = 'auto';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]" style={{ backgroundColor: '#CCC7B9' }}>
                <div className="text-center">
                    <Heart className="w-12 h-12 animate-pulse mx-auto mb-4" style={{ color: '#653239' }} />
                    <p style={{ color: '#AF7A6D' }}>Chargement de vos inscriptions...</p>
                </div>
            </div>
        );
    }

    // Gérer la navigation dans les images du modal
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

    return (
        <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#CCC7B9' }}>
            <div className="container mx-auto max-w-6xl pt-20">
                {/* En-tête */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-5" style={{ color: '#653239', fontSize: "35px" }}>
                        Mes inscriptions
                    </h1>
                    <p className="text-lg" style={{ color: '#AF7A6D', fontSize: "25px", top:"-20px", position:"relative" }}>
                        {registrations.length} mission(s) à venir
                    </p>
                </div>

                {/* Message de confirmation */}
                {message && (
                    <div className={`max-w-md mx-auto mb-6 p-4 rounded-lg text-center ${
                        message.type === 'success' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Liste des inscriptions */}
                {registrations.length === 0 ? (
                    <div className="text-center py-12">
                        <Heart className="w-16 h-16 mx-auto mb-4" style={{ color: '#AF7A6D', fill: 'none' }} />
                        <p className="text-lg" style={{ color: '#AF7A6D' }}>Vous n'êtes inscrit à aucune mission.</p>
                        <Link to="/">
                            <button className="mt-4 px-6 py-2 rounded-lg transition hover:opacity-90" style={{ backgroundColor: '#653239', color: '#FFFFFF' }}>
                                Découvrir les missions
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {registrations.map((mission) => {
                            const isPast = new Date(mission.date) < new Date();
                            const isFull = mission.available_places <= 0;
                            
                            return (
                                <div 
                                    key={mission.id}
                                    className="rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden cursor-pointer"
                                    style={{ 
                                        backgroundColor: '#FFFFFF', 
                                        border: `1px solid #E2D4BA`,
                                        boxShadow: '0 20px 25px -5px rgba(101, 50, 57, 0.2)'
                                    }}
                                    onClick={() => openModal(mission)}
                                >
                                    {/* Image */}
                                    <div className="relative h-48 overflow-hidden">
                                        {mission.images && mission.images.length > 0 ? (
                                            <img 
                                                src={mission.images[0]?.url} 
                                                alt={mission.title} 
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#EAF9D9' }}>
                                                <Heart className="w-12 h-12" style={{ color: '#653239', fill: 'none' }} />
                                            </div>
                                        )}
                                        
                                        {/* Badge statut */}
                                        {isPast && (
                                            <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#E2D4BA', color: '#653239' }}>
                                                Passée
                                            </div>
                                        )}
                                        {isFull && !isPast && (
                                            <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: '#AF7A6D', color: '#FFFFFF' }}>
                                                Complète
                                            </div>
                                        )}
                                    </div>

                                    {/* Contenu */}
                                    <div className="p-5">
                                        <h2 className="text-xl font-bold mb-2 line-clamp-1" style={{ color: '#653239' }}>
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

                                        {/* Bouton désistement */}
                                        {!isPast && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleUnregister(mission.id, mission.title);
                                                }}
                                                className="w-full py-2 rounded-lg font-semibold transition duration-300 hover:opacity-90"
                                                style={{ backgroundColor: '#AF7A6D', color: '#FFFFFF' }}
                                            >
                                                Se désister
                                            </button>
                                        )}

                                        {isPast && (
                                            <div className="text-center py-2 rounded-lg text-sm" style={{ backgroundColor: '#E2D4BA', color: '#653239' }}>
                                                Mission terminée
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal - identique à celui du Dashboard */}
{isModalOpen && selectedMission && (
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

                {new Date(selectedMission.date) >= new Date() && (
                    <button
                        onClick={() => {
                            closeModal();
                            handleUnregister(selectedMission.id, selectedMission.title);
                        }}
                        className="w-full py-3 rounded-lg font-semibold transition duration-300 hover:opacity-90"
                        style={{ backgroundColor: '#AF7A6D', color: '#FFFFFF' }}
                    >
                        Se désister
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

export default MyRegistrations;