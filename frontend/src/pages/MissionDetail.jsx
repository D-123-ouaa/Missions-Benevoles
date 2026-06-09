import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, MapPin, Users, Heart, ChevronLeft, ChevronRight, User, Clock, Star } from 'lucide-react';

function MissionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mission, setMission] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
    const [hoverRating, setHoverRating] = useState(0);
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        fetchMission();
        checkRegistration();
        fetchReviews();
    }, [id]);

    // Auto-défilement des images au hover
    useEffect(() => {
        let interval;
        if (isHovering && mission?.images && mission.images.length > 1) {
            interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % mission.images.length);
            }, 1500);
        }
        return () => clearInterval(interval);
    }, [isHovering, mission?.images]);

    // Récupérer les détails de la mission
    const fetchMission = async () => {
        try {
            const response = await api.get(`/missions/${id}`);
            setMission(response.data.mission || response.data);
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
            console.error('Erreur chargement avis:', error);
        }
    };

    // Vérifier si l'utilisateur est déjà inscrit à la mission
    const checkRegistration = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsRegistered(false);
            return;
        }
        try {
            const response = await api.get('/my-registrations');
            const registered = response.data.registrations?.some(m => m.id == id);
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

    // Soumettre un avis
    const submitReview = async () => {
        if (!reviewForm.rating) {
            setMessage({ type: 'error', text: 'Veuillez sélectionner une note' });
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        
        setSubmittingReview(true);
        try {
            await api.post(`/missions/${id}/reviews`, reviewForm);
            setMessage({ type: 'success', text: 'Merci pour votre avis !' });
            setReviewForm({ rating: 0, comment: '' });
            fetchReviews();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'envoi de l\'avis' });
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setSubmittingReview(false);
        }
    };

    // Gérer l'inscription à la mission
    const handleRegister = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        
        try {
            await api.post(`/missions/${id}/register`);
            setMessage({ type: 'success', text: 'Inscription réussie !' });
            setIsRegistered(true);
            fetchMission();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors de l\'inscription' });
            setTimeout(() => setMessage(''), 3000);
        }
    };
    
    // Gérer le désistement de la mission
    const handleUnregister = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        
        try {
            await api.delete(`/missions/${id}/unregister`);
            setMessage({ type: 'success', text: 'Désistement réussi' });
            setIsRegistered(false);
            fetchMission();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erreur lors du désistement' });
            setTimeout(() => setMessage(''), 3000);
        }
    };

    // Gérer la navigation dans les images
    const nextImage = () => {
        if (mission?.images) {
            setCurrentImageIndex((prev) => (prev + 1) % mission.images.length);
        }
    };

    const prevImage = () => {
        if (mission?.images) {
            setCurrentImageIndex((prev) => (prev - 1 + mission.images.length) % mission.images.length);
        }
    };

    // Calculer la note moyenne
    const averageRating = reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

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

    if (!mission) return null;

    const hasImages = mission.images && mission.images.length > 0;
    const isPast = new Date(mission.date) < new Date();
    const isFull = mission.available_places <= 0;

    return (
        <div className="min-h-screen py-20 px-4" style={{ backgroundColor: '#CCC7B9' }}>
            <div className="container mx-auto max-w-4xl">
                {/* Carte mission */}
                <div 
                    className="rounded-xl shadow-xl overflow-hidden"
                    style={{ backgroundColor: '#FFFFFF', border: `1px solid #E2D4BA` }}
                >
                    {/* Carrousel d'images */}
                    <div 
                        className="relative h-96 bg-gray-200"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => {
                            setIsHovering(false);
                            setCurrentImageIndex(0);
                        }}
                    >
                        {hasImages ? (
                            <>
                                <img 
                                    src={mission.images[currentImageIndex]?.url} 
                                    alt={mission.title} 
                                    className="w-full h-full object-cover transition-all duration-500"
                                />
                                
                                {/* Navigation flèches */}
                                {mission.images.length > 1 && (
                                    <>
                                        <button 
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
                                        >
                                            <ChevronLeft className="w-6 h-6 text-white" />
                                        </button>
                                        <button 
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
                                        >
                                            <ChevronRight className="w-6 h-6 text-white" />
                                        </button>
                                    </>
                                )}

                                {/* Indicateurs */}
                                {mission.images.length > 1 && (
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                        {mission.images.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentImageIndex(idx)}
                                                className={`transition-all rounded-full ${
                                                    idx === currentImageIndex 
                                                        ? 'w-8 h-2 bg-white' 
                                                        : 'w-2 h-2 bg-white/50'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Badge nombre d'images */}
                                <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                    {currentImageIndex + 1} / {mission.images.length}
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#EAF9D9' }}>
                                <Heart className="w-20 h-20" style={{ color: '#653239', fill: 'none' }} />
                            </div>
                        )}
                    </div>

                    {/* Contenu */}
                    <div className="p-8">
                        {/* Titre et statut */}
                        <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
                            <h1 className="text-3xl font-bold" style={{ color: '#653239' }}>
                                {mission.title}
                            </h1>
                            <div className="flex gap-2">
                                {isPast && (
                                    <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#E2D4BA', color: '#653239' }}>
                                        Mission passée
                                    </span>
                                )}
                                {isFull && !isPast && (
                                    <span className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: '#AF7A6D', color: '#FFFFFF' }}>
                                        Complet
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Note moyenne */}
                        {reviews.length > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex gap-1">
                                    {[1,2,3,4,5].map(star => (
                                        <Star 
                                            key={star} 
                                            className="w-4 h-4" 
                                            fill={star <= averageRating ? '#f59e0b' : 'none'}
                                            stroke={star <= averageRating ? '#f59e0b' : '#d1d5db'}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium" style={{ color: '#653239' }}>
                                    {averageRating} / 5 ({reviews.length} avis)
                                </span>
                            </div>
                        )}

                        {/* Description */}
                        <p className="text-gray-700 mb-6 leading-relaxed">
                            {mission.description}
                        </p>

                        {/* Informations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-6 border-b" style={{ borderColor: '#E2D4BA' }}>
                            <div className="flex items-center gap-3" style={{ color: '#AF7A6D' }}>
                                <Calendar className="w-5 h-5" />
                                <div>
                                    <p className="text-sm font-medium" style={{ color: '#653239' }}>Date</p>
                                    <p>{new Date(mission.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3" style={{ color: '#AF7A6D' }}>
                                <MapPin className="w-5 h-5" />
                                <div>
                                    <p className="text-sm font-medium" style={{ color: '#653239' }}>Lieu</p>
                                    <p>{mission.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3" style={{ color: '#AF7A6D' }}>
                                <Users className="w-5 h-5" />
                                <div>
                                    <p className="text-sm font-medium" style={{ color: '#653239' }}>Places disponibles</p>
                                    <p className="font-semibold" style={{ color: mission.available_places > 0 ? '#653239' : '#AF7A6D' }}>
                                        {mission.available_places} / {mission.available_places + (mission.volunteers?.length || 0)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3" style={{ color: '#AF7A6D' }}>
                                <User className="w-5 h-5" />
                                <div>
                                    <p className="text-sm font-medium" style={{ color: '#653239' }}>Inscrits</p>
                                    <p>{mission.volunteers?.length || 0} bénévole(s)</p>
                                </div>
                            </div>
                        </div>

                        {/* Message de confirmation/erreur */}
                        {message && (
                            <div className={`p-4 rounded-lg mb-6 ${
                                message.type === 'success' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                            }`} style={{ borderLeft: `4px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}` }}>
                                {message.text}
                            </div>
                        )}

                        {/* Bouton d'inscription/désistement */}
                        {!isPast && (
                            <button
                                onClick={isRegistered ? handleUnregister : handleRegister}
                                disabled={isFull && !isRegistered}
                                className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${
                                    isRegistered 
                                        ? 'hover:opacity-90' 
                                        : 'hover:opacity-90'
                                } ${isFull && !isRegistered ? 'opacity-50 cursor-not-allowed' : ''}`}
                                style={{ 
                                    backgroundColor: isRegistered ? '#AF7A6D' : '#653239', 
                                    color: '#FFFFFF' 
                                }}
                            >
                                {isRegistered ? 'Se désister' : (isFull ? 'Mission complète' : "S'inscrire")}
                            </button>
                        )}

                        {isPast && (
                            <div className="text-center py-3 rounded-lg" style={{ backgroundColor: '#E2D4BA', color: '#653239' }}>
                                Cette mission est déjà passée
                            </div>
                        )}

                        {/* Section Reviews - Avis des participants */}
                        <div className="mt-8 pt-6" style={{ borderTop: '1px solid #E2D4BA' }}>
                            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#653239' }}>
                                    <Star className="w-5 h-5 fill-current" />
                                    Avis des participants ({reviews.length})
                                </h3>
                            </div>

                            {/* Formulaire d'avis - seulement si mission passée ET utilisateur inscrit */}
                            {isPast && isRegistered && (
                                <div className="mb-6 p-5 rounded-xl" style={{ backgroundColor: '#EAF9D9', border: '1px solid #E2D4BA' }}>
                                    <p className="text-sm font-medium mb-3" style={{ color: '#653239' }}>
                                        Vous avez participé à cette mission ? Partagez votre expérience !
                                    </p>
                                    <div className="flex gap-2 mb-3">
                                        {[1,2,3,4,5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                className="focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <Star 
                                                    className="w-8 h-8" 
                                                    fill={(hoverRating || reviewForm.rating) >= star ? '#f59e0b' : 'none'}
                                                    stroke={(hoverRating || reviewForm.rating) >= star ? '#f59e0b' : '#d1d5db'}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={reviewForm.comment}
                                        onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        placeholder="Votre commentaire (optionnel)..."
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border text-sm focus:outline-none resize-none mb-3"
                                        style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF' }}
                                    />
                                    <button 
                                        onClick={submitReview} 
                                        disabled={!reviewForm.rating || submittingReview}
                                        className="px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 hover:opacity-90"
                                        style={{ backgroundColor: '#653239', color: '#EAF9D9' }}
                                    >
                                        {submittingReview ? 'Envoi en cours...' : 'Envoyer mon avis'}
                                    </button>
                                </div>
                            )}

                            {/* Liste des avis */}
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-8" style={{ color: '#AF7A6D' }}>
                                        <Star className="w-12 h-12 mx-auto mb-2 opacity-40" />
                                        <p className="text-sm">Aucun avis pour cette mission.</p>
                                        {isPast && isRegistered && (
                                            <p className="text-xs mt-1">Soyez le premier à donner votre avis !</p>
                                        )}
                                        {!isPast && (
                                            <p className="text-xs mt-1">Les avis apparaîtront après la mission.</p>
                                        )}
                                    </div>
                                ) : (
                                    reviews.map(review => (
                                        <div key={review.id} className="p-4 rounded-xl" style={{ backgroundColor: '#fafaf9', border: '1px solid #E2D4BA' }}>
                                            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                                                <span className="text-sm font-semibold" style={{ color: '#653239' }}>
                                                    {review.user?.name || 'Anonyme'}
                                                </span>
                                                <div className="flex gap-1">
                                                    {[1,2,3,4,5].map(star => (
                                                        <Star 
                                                            key={star} 
                                                            className="w-4 h-4" 
                                                            fill={review.rating >= star ? '#f59e0b' : 'none'}
                                                            stroke={review.rating >= star ? '#f59e0b' : '#d1d5db'}
                                                        />
                                                    ))}
                                                </div>
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
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bouton retour */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 rounded-lg transition hover:opacity-80"
                        style={{ backgroundColor: '#653239', color: '#FFFFFF' }}
                    >
                        ← Retour aux missions
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MissionDetail;