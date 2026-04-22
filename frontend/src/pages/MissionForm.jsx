// components/MissionForm.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

function MissionForm({ missionId, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        available_places: ''
    });
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Charger la mission existante
    useEffect(() => {
        if (missionId) {
            fetchMission();
        }
    }, [missionId]);

    // Récupérer les données de la mission à modifier
    const fetchMission = async () => {
        try {
            const response = await api.get(`/missions/${missionId}`);
            setFormData({
                title: response.data.title,
                description: response.data.description,
                date: response.data.date.split('T')[0],
                location: response.data.location,
                available_places: response.data.available_places
            });
            setExistingImages(response.data.images || []);
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    // Gérer les changements des champs texte
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Gérer la sélection des nouvelles images
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        setNewImages([...newImages, ...files]);
        
        // Créer les URLs de prévisualisation
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...urls]);
    };

    // Supprimer une nouvelle image (avant upload)
    const removeNewImage = (index) => {
        URL.revokeObjectURL(previewUrls[index]);
        setNewImages(newImages.filter((_, i) => i !== index));
        setPreviewUrls(previewUrls.filter((_, i) => i !== index));
    };

    // Supprimer une image existante
    const deleteExistingImage = async (imageId) => {
        if (window.confirm('Supprimer cette image ?')) {
            try {
                await api.delete(`/missions/${missionId}/images/${imageId}`);
                setExistingImages(existingImages.filter(img => img.id !== imageId));
            } catch (error) {
                console.error('Erreur suppression:', error);
            }
        }
    };

    // Soumettre le formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Mettre à jour les informations de la mission
            await api.put(`/missions/${missionId}`, formData);

            // 2. Ajouter les nouvelles images
            if (newImages.length > 0) {
                const formDataImages = new FormData();
                newImages.forEach(image => {
                    formDataImages.append('images[]', image);
                });

                await api.post(`/missions/${missionId}/images`, formDataImages, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            alert('Mission mise à jour avec succès !');
            if (onSuccess) onSuccess();
            
            // Reset nouvelles images
            setNewImages([]);
            setPreviewUrls([]);
            
        } catch (error) {
            console.error('Erreur:', error);
            setError(error.response?.data?.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-[#653239]">
                {missionId ? 'Modifier la mission' : 'Créer une mission'}
            </h2>

            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded">
                    {error}
                </div>
            )}

            {/* Champs texte */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Titre *</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#653239] focus:ring-[#653239]"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#653239] focus:ring-[#653239]"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date *</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#653239] focus:ring-[#653239]"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Lieu *</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#653239] focus:ring-[#653239]"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Places disponibles *</label>
                <input
                    type="number"
                    name="available_places"
                    value={formData.available_places}
                    onChange={handleChange}
                    required
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#653239] focus:ring-[#653239]"
                />
            </div>

            {/* Images existantes */}
            {existingImages.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Images actuelles ({existingImages.length})
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        {existingImages.map((image) => (
                            <div key={image.id} className="relative group">
                                <img
                                    src={image.url}
                                    alt="Mission"
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => deleteExistingImage(image.id)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload nouvelles images */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ajouter des images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#653239] transition">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                    />
                    <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center"
                    >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-gray-500">Cliquez ou glissez vos images</span>
                        <span className="text-xs text-gray-400">JPG, PNG, GIF (max 2MB)</span>
                    </label>
                </div>

                {/* Prévisualisation nouvelles images */}
                {previewUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                        {previewUrls.map((url, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(index)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={onSuccess}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-[#653239] text-white rounded-md hover:bg-[#7a4350] disabled:opacity-50"
                >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>
        </form>
    );
}

export default MissionForm;