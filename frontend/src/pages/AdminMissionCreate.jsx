import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Heart, Calendar, MapPin, Users, Image as ImageIcon, X, Plus } from 'lucide-react';

function AdminMissionCreate() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        available_places: 1
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        setImagePreviews(files.map(f => URL.createObjectURL(f)));
    };

    // Supprimer une image sélectionnée avant soumission
    const removeImage = (index) => {
        const newImages = [...images];
        const newPreviews = [...imagePreviews];
        newImages.splice(index, 1);
        newPreviews.splice(index, 1);
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData();
        Object.keys(form).forEach(key => formData.append(key, form[key]));
        images.forEach(img => formData.append('images[]', img));

        try {
            await api.post('/missions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/');
        } catch (err) {
            const errors = err.response?.data?.errors;
            if (errors) {
                const firstError = Object.values(errors)[0];
                setError(firstError[0]);
            } else {
                setError(err.response?.data?.message || "Erreur lors de la création");
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10" style={{ backgroundColor: '#CCC7B9' }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-17 h-17 rounded-2xl mb-4" style={{ backgroundColor: '#653239' }}>
                        <Heart className="w-8 h-8" style={{ color: '#EAF9D9', fill: 'none' }} />
                    </div>
                    <h2 className="text-1xl mb-2" style={{ color: '#653239', fontWeight: 'bold', fontSize: '30px' }}>Créer une mission</h2>
                    <p style={{ color: '#453d3a82' }}>Ajoutez une nouvelle mission pour les bénévoles</p>
                </div>

                <div className="rounded-xl p-8 shadow-lg" style={{ backgroundColor: '#FFFFFF', border: `1px solid #E2D4BA` }}>
                    <p className="text-left text-xl font-semibold" style={{ color: '#251e1f', marginBottom: '25px' }}>
                        Nouvelle mission
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        <div>
                            <label className="block text-sm text-left" style={{ color: '#251e1f', marginBottom: "5px" }}>Images</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <ImageIcon className="h-5 w-5" style={{ color: '#251e1f9a' }} />
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
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

                        {imagePreviews.length > 0 && (
                            <div className="flex gap-2 flex-wrap mt-2">
                                {imagePreviews.map((preview, idx) => (
                                    <div key={idx} className="relative group">
                                        <img src={preview} alt={`Aperçu ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border" style={{ borderColor: '#E2D4BA' }} />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
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
                            disabled={loading}
                            className="w-full py-3 rounded-lg font-semibold transition transform hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ backgroundColor: '#653239', color: '#FFFFFF' }}
                        >
                            {loading ? (
                                "Création en cours..."
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Créer la mission
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

export default AdminMissionCreate;