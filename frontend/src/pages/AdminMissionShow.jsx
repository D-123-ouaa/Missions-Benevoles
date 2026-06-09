import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, MapPin, User, Edit, Users, Heart, Trash2, ArrowLeft, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';

function AdminMissionShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mission, setMission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [modalImageIndex, setModalImageIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [showParticipants, setShowParticipants] = useState(false);
    const [isPast, setIsPast] = useState(false);
    
    // États pour les avis
    const [reviews, setReviews] = useState([]);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [hoverRating, setHoverRating] = useState(0);

    // Récupérer le rôle de l'utilisateur connecté
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const canManageAllReviews = user?.role === 'admin' || user?.role === 'manager';

    useEffect(() => {
        fetchMission();
        fetchParticipants();
        fetchReviews();
    }, [id]);

    // Récupérer les détails de la mission
    const fetchMission = async () => {
        try {
            const response = await api.get(`/missions/${id}`);
            const missionData = response.data.mission || response.data;
            setMission(missionData);
            
            const missionDate = new Date(missionData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            setIsPast(missionDate < today);
            
        } catch (error) {
            console.error('Erreur:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    // Récupérer les avis de la mission
    const fetchReviews = async () => {
        try {
            const response = await api.get(`/missions/${id}/reviews`);
            setReviews(response.data);
        } catch (error) {
            console.error('Erreur fetchReviews:', error);
            setReviews([]);
        }
    };

    // Récupérer les participants
    const fetchParticipants = async () => {
        try {
            const response = await api.get(`/missions/${id}/participants`);
            let participantsData = [];
            if (response.data.participants) {
                participantsData = response.data.participants;
            } else if (Array.isArray(response.data)) {
                participantsData = response.data;
            } else if (response.data.data) {
                participantsData = response.data.data;
            }
            setParticipants(participantsData);
        } catch (error) {
            console.error('Erreur fetchParticipants:', error);
            setParticipants([]);
        }
    };

    // Supprimer la mission
    const handleDelete = async () => {
        if (!window.confirm('Supprimer définitivement cette mission ?')) return;
        try {
            await api.delete(`/missions/${id}`);
            navigate('/');
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
        }
    };

    // Gestion des images
    const openImageModal = (index) => {
        setModalImageIndex(index);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeImageModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = 'auto';
    };

    const nextImage = () => {
        if (mission?.images) {
            setModalImageIndex((prev) => (prev + 1) % mission.images.length);
        }
    };

    const prevImage = () => {
        if (mission?.images) {
            setModalImageIndex((prev) => (prev - 1 + mission.images.length) % mission.images.length);
        }
    };

    // Exports
    const exportCSV = async () => {
        try {
            const response = await api.get(`/missions/${id}/export/csv`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `participants_${mission?.title || 'mission'}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'export' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const exportPDF = async () => {
        try {
            const response = await api.get(`/missions/${id}/export/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `rapport_mission_${mission?.title || 'mission'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'export PDF' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const confirmDeleteReview = (review) => {
        setReviewToDelete(review);
        setIsDeleteConfirmOpen(true);
    };

    const deleteReview = async () => {
        try {
            await api.delete(`/reviews/${reviewToDelete.id}`);
            await fetchReviews();
            setIsDeleteConfirmOpen(false);
            setReviewToDelete(null);
            setMessage({ type: 'success', text: 'Avis supprimé avec succès !' });
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la suppression' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // Calculer la note moyenne
    const averageRating = reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]" style={{ backgroundColor: '#CCC7B9' }}>
                <Heart className="w-12 h-12 animate-pulse" style={{ color: '#653239' }} />
            </div>
        );
    }

    if (!mission) return null;

    const totalPlaces = mission.total_places || (mission.available_places + (mission.volunteers?.length || 0));
    const registeredCount = mission.volunteers?.length || 0;

    return (
        <div className="min-h-screen py-8 px-4 pt-24" style={{ backgroundColor: '#CCC7B9' }}>
            <div className="container mx-auto max-w-4xl">
                {/* Bouton retour */}
                <Link to="/">
                    <button className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg transition hover:opacity-80" style={{ backgroundColor: '#653239', color: '#FFFFFF' }}>
                        <ArrowLeft className="w-5 h-5" /> Retour à la liste
                    </button>
                </Link>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="rounded-xl overflow-hidden shadow-lg" style={{ backgroundColor: '#FFFFFF', border: `1px solid #E2D4BA` }}>
                    {/* Images */}
                    <div className="relative h-96 bg-gray-200">
                        {mission.images && mission.images.length > 0 ? (
                            <>
                                <img src={mission.images[0]?.url} alt={mission.title} className="w-full h-full object-cover cursor-pointer" onClick={() => openImageModal(0)} />
                                {mission.images.length > 1 && (
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {mission.images.map((img, idx) => (
                                                <img key={idx} src={img.url} alt="" className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80" onClick={() => openImageModal(idx)} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#EAF9D9' }}>
                                <Heart className="w-20 h-20" style={{ color: '#653239', fill: 'none' }} />
                            </div>
                        )}
                    </div>

                    <div className="p-8">
                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h1 className="font-bold" style={{ color: '#653239', fontSize: '30px' }}>{mission.title}</h1>
                            </div>
                            <div className="flex gap-3">
                                <Link to={`/admin/missions/edit/${mission.id}`}>
                                    <button 
                                        disabled={isPast}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                            isPast 
                                                ? 'opacity-50 cursor-not-allowed' 
                                                : 'hover:opacity-80'
                                        }`}
                                        style={{ 
                                            backgroundColor: isPast ? '#E2D4BA' : '#AF7A6D', 
                                            color: '#FFFFFF' 
                                        }}
                                    >
                                        <Edit className="w-4 h-4" /> Modifier
                                    </button>
                                </Link>
                                <button 
                                    onClick={handleDelete} 
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition hover:opacity-80"
                                    style={{ backgroundColor: '#653239', color: '#FFFFFF' }}
                                >
                                    <Trash2 className="w-4 h-4" /> Supprimer
                                </button>
                            </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed" style={{ marginBottom: '25px' }}>{mission.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-6 border-b" style={{ borderColor: '#E2D4BA' }}>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5" style={{ color: '#AF7A6D' }} />
                                <div>
                                    <p className="text-sm font-medium text-left" style={{ color: '#653239' }}>Date</p>
                                    <p>{new Date(mission.date).toLocaleDateString('fr-FR')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5" style={{ color: '#AF7A6D' }} />
                                <div>
                                    <p className="text-sm font-medium text-left" style={{ color: '#653239' }}>Lieu</p>
                                    <p>{mission.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5" style={{ color: '#AF7A6D' }} />
                                <div>
                                    <p className="text-sm font-medium text-left" style={{ color: '#653239' }}>Places disponibles</p>
                                    <p>{mission.available_places} / {totalPlaces}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5" style={{ color: '#AF7A6D' }} />
                                <div>
                                    <p className="text-sm font-medium text-left" style={{ color: '#653239' }}>Inscrits</p>
                                    <p>{registeredCount} bénévole(s)</p>
                                </div>
                            </div>
                        </div>

                        {/* Boutons participants et exports */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => setShowParticipants(!showParticipants)} 
                                className="flex-1 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 hover:scale-105 hover:shadow-lg"
                                style={{ 
                                    backgroundColor: showParticipants ? '#653239' : '#EAF9D9', 
                                    color: showParticipants ? '#FFFFFF' : '#653239',
                                    border: showParticipants ? 'none' : '1px solid #653239'
                                }}
                            >
                                <Users className="w-5 h-5" />
                                <span>{showParticipants ? 'Masquer les participants' : 'Voir les participants'}</span>
                            </button>
                            <button 
                                onClick={exportCSV} 
                                className="flex-1 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 hover:scale-105 hover:shadow-lg"
                                style={{ backgroundColor: '#FFFFFF', color: '#AF7A6D', border: '2px solid #AF7A6D' }}
                            >
                                📥 Exporter CSV
                            </button>
                            <button 
                                onClick={exportPDF} 
                                className="flex-1 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 hover:scale-105 hover:shadow-lg"
                                style={{ backgroundColor: '#653239', color: '#FFFFFF' }}
                            >
                                📄 Exporter PDF
                            </button>
                        </div>

                        {showParticipants && (
                            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#EAF9D9', border: `1px solid #E2D4BA` }}>
                                <h3 className="font-semibold mb-3" style={{ color: '#653239' }}>
                                    Participants inscrits ({participants.length})
                                </h3>
                                {participants.length === 0 && registeredCount > 0 ? (
                                    <div>
                                        <p style={{ color: '#AF7A6D' }}>Chargement des participants...</p>
                                        {mission.volunteers && mission.volunteers.length > 0 && (
                                            <div className="mt-2 space-y-2">
                                                <p className="text-sm font-medium" style={{ color: '#653239' }}>Liste des bénévoles inscrits :</p>
                                                {mission.volunteers.map((vol) => (
                                                    <div key={vol.id} className="p-2 rounded flex justify-between items-center" style={{ backgroundColor: '#FFFFFF' }}>
                                                        <div>
                                                            <span className="font-medium">{vol.name}</span>
                                                            <br />
                                                            <span className="text-xs" style={{ color: '#AF7A6D' }}>{vol.email}</span>
                                                        </div>
                                                        {vol.phone && <span className="text-sm" style={{ color: '#AF7A6D' }}>{vol.phone}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : participants.length === 0 ? (
                                    <p style={{ color: '#AF7A6D' }}>Aucun participant pour le moment.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {participants.map((p) => (
                                            <div key={p.id} className="p-2 rounded flex justify-between items-center" style={{ backgroundColor: '#FFFFFF' }}>
                                                <div>
                                                    <span className="font-medium">{p.name}</span>
                                                    <br />
                                                    <span className="text-xs" style={{ color: '#AF7A6D' }}>{p.email}</span>
                                                </div>
                                                {p.phone && <span className="text-sm" style={{ color: '#AF7A6D' }}>{p.phone}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SECTION AVIS - AJOUTÉE */}
                        <div className="mt-8 pt-6 border-t" style={{ borderColor: '#E2D4BA' }}>
                            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#653239' }}>
                                    <Star className="w-5 h-5 fill-current" />
                                    Avis des participants ({reviews.length})
                                </h3>
                                {reviews.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            {[1,2,3,4,5].map(star => (
                                                <Star key={star} className="w-4 h-4" 
                                                    fill={star <= averageRating ? '#f59e0b' : 'none'}
                                                    stroke={star <= averageRating ? '#f59e0b' : '#d1d5db'} 
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm font-medium" style={{ color: '#653239' }}>
                                            {averageRating} / 5
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Liste des avis avec boutons modifier/supprimer pour admin/manager */}
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-8" style={{ color: '#AF7A6D' }}>
                                        <Star className="w-12 h-12 mx-auto mb-2 opacity-40" />
                                        <p className="text-sm">Aucun avis pour cette mission.</p>
                                    </div>
                                ) : (
                                    reviews.map(review => {
                                        const isOwner = user?.id === review.user_id;
                                        const canDelete = isOwner || canManageAllReviews;
                                        
                                        return (
                                            <div key={review.id} className="p-4 rounded-xl" style={{ backgroundColor: '#fafaf9', border: '1px solid #E2D4BA' }}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-sm font-semibold" style={{ color: '#653239' }}>
                                                                {review.user?.name || 'Anonyme'}
                                                            </span>
                                                            {review.user?.role === 'admin' && (
                                                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#653239', color: '#FFF' }}>
                                                                    Admin
                                                                </span>
                                                            )}
                                                            {review.user?.role === 'manager' && (
                                                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#AF7A6D', color: '#FFF' }}>
                                                                    Manager
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-1 mt-1">
                                                            {[1,2,3,4,5].map(s => (
                                                                <Star key={s} className="w-4 h-4" 
                                                                    fill={review.rating >= s ? '#f59e0b' : 'none'}
                                                                    stroke={review.rating >= s ? '#f59e0b' : '#d1d5db'} 
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Boutons d'action pour admin/manager */}
                                                    {(canDelete) && (
                                                        <div className="flex gap-1">
                                                            {canDelete && (
                                                                <button 
                                                                    onClick={() => confirmDeleteReview(review)} 
                                                                    className="p-1.5 rounded-lg hover:bg-red-100 transition"
                                                                    title="Supprimer"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {review.comment && (
                                                    <p className="text-sm mt-2" style={{ color: '#AF7A6D' }}>
                                                        {review.comment}
                                                    </p>
                                                )}
                                                <p className="text-xs mt-2" style={{ color: '#CCC7B9' }}>
                                                    {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmation suppression */}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsDeleteConfirmOpen(false)}>
                    <div className="bg-white rounded-2xl p-6 w-96 max-w-[90%]" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-red-100">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2" style={{ color: '#653239' }}>Confirmer la suppression</h3>
                            <p className="text-sm mb-6" style={{ color: '#AF7A6D' }}>
                                Êtes-vous sûr de vouloir supprimer cet avis ?
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={deleteReview} 
                                    className="flex-1 py-2 rounded-xl font-semibold transition hover:opacity-90"
                                    style={{ backgroundColor: '#ef4444', color: '#FFFFFF' }}
                                >
                                    Supprimer
                                </button>
                                <button 
                                    onClick={() => setIsDeleteConfirmOpen(false)} 
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

            {/* Modal image */}
            {isModalOpen && mission?.images && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={closeImageModal}>
                    <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeImageModal} className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 hover:bg-white/40 transition">
                            <X className="w-6 h-6 text-white" />
                        </button>
                        <img src={mission.images[modalImageIndex]?.url} alt={mission.title} className="w-full h-auto rounded-lg" />
                        {mission.images.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70">
                                    <ChevronLeft className="w-8 h-8 text-white" />
                                </button>
                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70">
                                    <ChevronRight className="w-8 h-8 text-white" />
                                </button>
                            </>
                        )}
                        <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                            {modalImageIndex + 1} / {mission.images.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminMissionShow;