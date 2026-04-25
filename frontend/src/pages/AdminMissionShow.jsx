import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, MapPin, User, Users, Heart, Edit, Trash2, ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';

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
    const [isPast, setIsPast] = useState(false); // 👈 AJOUTÉ

    useEffect(() => {
        fetchMission();
        fetchParticipants();
    }, [id]);

    // Récupérer les détails de la mission
    const fetchMission = async () => {
        try {
            const response = await api.get(`/missions/${id}`);
            const missionData = response.data.mission || response.data;
            setMission(missionData);
            
            // 👈 Vérifier si la mission est passée
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

    // Récupérer les participants de la mission
    const fetchParticipants = async () => {
        try {
            const response = await api.get(`/missions/${id}/participants`);
            setParticipants(response.data.participants || []);
        } catch (error) {
            console.error('Erreur:', error);
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

    // Gérer l'ouverture et la fermeture du modal d'image
    const openImageModal = (index) => {
        setModalImageIndex(index);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeImageModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = 'auto';
    };

    // Gérer la navigation entre les images dans le modal
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

    // Exporter les participants au format CSV
    const exportCSV = async () => {
        try {
            const response = await api.get(`/missions/${id}/export`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `participants_${mission.title}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'export' });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]" style={{ backgroundColor: '#CCC7B9' }}>
                <Heart className="w-12 h-12 animate-pulse" style={{ color: '#653239' }} />
            </div>
        );
    }

    if (!mission) return null;

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
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <h1 className="text-3xl font-bold" style={{ color: '#653239' }}>{mission.title}</h1>
                            <div className="flex gap-3 mt-8">
                                {/* 👈 BOUTON MODIFIER MODIFIÉ */}
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
                                        <Edit className="w-5 h-5" /> Modifier
                                    </button>
                                </Link>
                                <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 rounded-lg transition hover:opacity-80" style={{ backgroundColor: '#653239', color: '#FFFFFF' }}>
                                    <Trash2 className="w-5 h-5" /> Supprimer
                                </button>
                            </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed" style={{ marginBottom: '25px' }}>{mission.description}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 pb-6 border-b" style={{ borderColor: '#E2D4BA' }}>
                            <div className="flex items-center gap-3"><Calendar className="w-5 h-5" style={{ color: '#AF7A6D' }} /><div><p className="text-sm font-medium text-left" style={{ color: '#653239' }}>Date</p><p>{new Date(mission.date).toLocaleDateString('fr-FR')}</p></div></div>
                            <div className="flex items-center gap-3"><MapPin className="w-5 h-5" style={{ color: '#AF7A6D' }} /><div><p className="text-sm font-medium text-left" style={{ color: '#653239' }}>Lieu</p><p>{mission.location}</p></div></div>
                            <div className="flex items-center gap-3"><User className="w-5 h-5" style={{ color: '#AF7A6D' }} /><div><p className="text-sm font-medium text-left" style={{ color: '#653239' }}>Places disponibles</p><p>{mission.available_places} / {mission.total_places || mission.available_places + (mission.volunteers?.length || 0)}</p></div></div>
                            <div className="flex items-center gap-3"><Users className="w-5 h-5" style={{ color: '#AF7A6D' }} /><div><p className="text-sm font-medium text-left" style={{ color: '#653239' }}>Inscrits</p><p>{mission.volunteers?.length || 0} bénévole(s)</p></div></div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => setShowParticipants(!showParticipants)} className="flex-1 py-3 rounded-lg font-semibold transition hover:opacity-90 flex items-center justify-center gap-2" style={{ backgroundColor: '#653239', color: '#FFFFFF' }}>
                                <Users className="w-5 h-5" /> Voir les participants
                            </button>
                            <button onClick={exportCSV} className="flex-1 py-3 rounded-lg font-semibold transition hover:opacity-90 flex items-center justify-center gap-2" style={{ backgroundColor: '#AF7A6D', color: '#FFFFFF' }}>
                                📥 Exporter CSV
                            </button>
                        </div>

                        {showParticipants && (
                            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#EAF9D9', border: `1px solid #E2D4BA` }}>
                                <h3 className="font-semibold mb-3" style={{ color: '#653239' }}>Participants inscrits ({participants.length})</h3>
                                {participants.length === 0 ? (
                                    <p style={{ color: '#AF7A6D' }}>Aucun participant pour le moment.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {participants.map((p) => (
                                            <div key={p.id} className="p-2 rounded flex justify-between items-center" style={{ backgroundColor: '#FFFFFF' }}>
                                                <div><span className="font-medium">{p.name}</span><br /><span className="text-xs" style={{ color: '#AF7A6D' }}>{p.email}</span></div>
                                                {p.phone && <span className="text-sm" style={{ color: '#AF7A6D' }}>{p.phone}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal image */}
            {isModalOpen && mission?.images && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={closeImageModal}>
                    <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeImageModal} className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 hover:bg-white/40 transition"><X className="w-6 h-6 text-white" /></button>
                        <img src={mission.images[modalImageIndex]?.url} alt={mission.title} className="w-full h-auto rounded-lg" />
                        {mission.images.length > 1 && (<><button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70"><ChevronLeft className="w-8 h-8 text-white" /></button><button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70"><ChevronRight className="w-8 h-8 text-white" /></button></>)}
                        <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">{modalImageIndex + 1} / {mission.images.length}</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminMissionShow;