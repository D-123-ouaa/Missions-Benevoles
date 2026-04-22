import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Heart, Calendar, MapPin, Users, Image as ImageIcon, X, Plus, ArrowLeft } from 'lucide-react';

function AdminMissionEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        available_places: 1
    });
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);

    useEffect(() => {
        fetchMission();
    }, [id]);

    // Récupérer les détails de la mission
    const fetchMission = async () => {
        try {
            const response = await api.get(`/missions/${id}`);
            const mission = response.data.mission || response.data;
            setForm({
                title: mission.title || '',
                description: mission.description || '',
                date: mission.date ? mission.date.split('T')[0] : '',
                location: mission.location || '',
                available_places: mission.available_places || 1
            });
            setExistingImages(mission.images || []);
        } catch (error) {
            console.error('Erreur:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Gérer la sélection de nouvelles images
    const handleNewImages = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(files);
        setNewImagePreviews(files.map(f => URL.createObjectURL(f)));
    };

    // Supprimer une image nouvellement ajoutée avant soumission
    const removeNewImage = (index) => {
        const newImagesList = [...newImages];
        const newPreviewsList = [...newImagePreviews];
        newImagesList.splice(index, 1);
        newPreviewsList.splice(index, 1);
        setNewImages(newImagesList);
        setNewImagePreviews(newPreviewsList);
    };

    // Supprimer une image existante de la mission
    const removeExistingImage = async (imageId) => {
        if (!window.confirm('Supprimer cette image ?')) return;
        try {
            await api.delete(`/missions/${id}/images/${imageId}`);
            setExistingImages(existingImages.filter(img => img.id !== imageId));
        } catch (error) {
            setError("Erreur lors de la suppression de l'image");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        // 1. Mettre à jour les informations de la mission
        const missionData = {
            title: form.title,
            description: form.description,
            date: form.date,
            location: form.location,
            available_places: form.available_places
        };

        try {
            // Mettre à jour les données de la mission
            await api.put(`/missions/${id}`, missionData);
            
            // Ajouter les nouvelles images si présentes
            if (newImages.length > 0) {
                const formData = new FormData();
                newImages.forEach(img => formData.append('images[]', img));
                
                await api.post(`/missions/${id}/images`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            navigate('/');
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                const firstError = Object.values(errors)[0];
                setError(firstError[0]);
            } else {
                setError(err.response?.data?.message || "Erreur lors de la modification");
            }
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]" style={{ backgroundColor: '#CCC7B9' }}>
                <Heart className="w-12 h-12 animate-pulse" style={{ color: '#653239' }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10" style={{ backgroundColor: '#CCC7B9' }}>
            <div className="w-full max-w-md">
                {/* Logo et titre */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-17 h-17 rounded-2xl mb-4" style={{ backgroundColor: '#653239' }}>
                        <Heart className="w-8 h-8" style={{ color: '#EAF9D9', fill: 'none' }} />
                    </div>
                    <h2 className="text-1xl mb-2" style={{ color: '#653239', fontWeight: 'bold', fontSize: '30px' }}>Modifier la mission</h2>
                    <p style={{ color: '#453d3a82' }}>Modifiez les informations de la mission</p>
                </div>

                {/* Formulaire */}
                <div className="rounded-xl p-8 shadow-lg" style={{ backgroundColor: '#FFFFFF', border: `1px solid #E2D4BA` }}>
                    <p className="text-left text-xl font-semibold" style={{ color: '#251e1f', marginBottom: '25px' }}>
                        Modifier la mission
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Titre */}
                        <div>
                            <label className="block text-sm text-left" style={{ color: '#251e1f', marginBottom: "5px" }}>Titre *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Heart className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                </div>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.border = '3px solid #653239'}
                                    onBlur={(e) => e.target.style.border = '1px solid #E2D4BA'}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition"
                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f9a' }}
                                    placeholder="Collecte alimentaire"
                                    required
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm text-left" style={{ color: '#251e1f', marginBottom: "5px" }}>Description *</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows="4"
                                onFocus={(e) => e.target.style.border = '3px solid #653239'}
                                onBlur={(e) => e.target.style.border = '1px solid #E2D4BA'}
                                className="w-full pl-3 pr-4 py-2 rounded-lg border focus:outline-none transition"
                                style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f9a' }}
                                placeholder="Description détaillée de la mission..."
                                required
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm text-left" style={{ color: '#251e1f', marginBottom: "5px" }}>Date *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                </div>
                                <input
                                    type="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.border = '3px solid #653239'}
                                    onBlur={(e) => e.target.style.border = '1px solid #E2D4BA'}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition"
                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f9a' }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Lieu */}
                        <div>
                            <label className="block text-sm text-left" style={{ color: '#251e1f', marginBottom: "5px" }}>Lieu *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                </div>
                                <input
                                    type="text"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    onFocus={(e) => e.target.style.border = '3px solid #653239'}
                                    onBlur={(e) => e.target.style.border = '1px solid #E2D4BA'}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition"
                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f9a' }}
                                    placeholder="Mairie de Paris"
                                    required
                                />
                            </div>
                        </div>

                        {/* Places disponibles */}
                        <div>
                            <label className="block text-sm text-left" style={{ color: '#251e1f', marginBottom: "5px" }}>Places disponibles *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Users className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                </div>
                                <input
                                    type="number"
                                    name="available_places"
                                    value={form.available_places}
                                    onChange={handleChange}
                                    min="1"
                                    onFocus={(e) => e.target.style.border = '3px solid #653239'}
                                    onBlur={(e) => e.target.style.border = '1px solid #E2D4BA'}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition"
                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f9a' }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Images existantes */}
                        {existingImages.length > 0 && (
                            <div>
                                <label className="block text-sm text-left" style={{ color: '#251e1f', marginBottom: "5px" }}>Images actuelles</label>
                                <div className="flex gap-2 flex-wrap mt-2">
                                    {existingImages.map((img) => (
                                        <div key={img.id} className="relative group">
                                            <img src={img.url} alt="" className="w-20 h-20 object-cover rounded-lg border" style={{ borderColor: '#E2D4BA' }} />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(img.id)}
                                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs hidden group-hover:flex items-center justify-center"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Ajouter des images */}
                        <div>
                            <label className="block text-sm text-left" style={{ color: '#251e1f', marginBottom: "5px" }}>Ajouter des images</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <ImageIcon className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleNewImages}
                                    onFocus={(e) => e.target.style.border = '3px solid #653239'}
                                    onBlur={(e) => e.target.style.border = '1px solid #E2D4BA'}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none transition"
                                    style={{ borderColor: '#E2D4BA', backgroundColor: '#FFFFFF', color: '#251e1f9a' }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 text-left mt-1" style={{ color: '#251e1f9a' }}>
                                Formats acceptés : JPG, PNG, GIF (max 2MB par image)
                            </p>
                        </div>

                        {/* Aperçu nouvelles images */}
                        {newImagePreviews.length > 0 && (
                            <div className="flex gap-2 flex-wrap mt-2">
                                {newImagePreviews.map((preview, idx) => (
                                    <div key={idx} className="relative group">
                                        <img src={preview} alt={`Aperçu ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border" style={{ borderColor: '#E2D4BA' }} />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(idx)}
                                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8959588', color: '#cb0303', border: '1px solid #f6737387' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 rounded-lg font-semibold transition transform hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#653239', color: '#FFFFFF' }}
                        >
                            {submitting ? (
                                "Enregistrement en cours..."
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Enregistrer les modifications
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/" className="text-sm" style={{ color: '#251e1f' }}>
                            ← Retour à la liste des missions
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminMissionEdit;