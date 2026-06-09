import { useState } from 'react';
import api from '../api/axios';
import { Bell, Send, XCircle, CircleCheck, Heart } from 'lucide-react';


function AdminNotifications() {
    const [form, setForm] = useState({ title: '', message: '' });
    const [status, setStatus] = useState('');

    const handleBroadcast = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/notifications/broadcast', form);
            setStatus('success');
            setForm({ title: '', message: '' });
            setTimeout(() => setStatus(''), 3000);
        } catch {
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-10 px-4" style={{ backgroundColor: '#CCC7B9' }}>
            <div className="max-w-2xl mx-auto">

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-17 h-17 rounded-2xl mb-4" style={{ backgroundColor: '#653239' }}>
                        <Heart className="w-8 h-8" style={{ color: '#EAF9D9', fill: 'none' }} />
                    </div>
                    <h2 className="text-1xl mb-2" style={{ color: '#653239', fontWeight: 'bold', fontSize: '30px' }}>Envoyer une notification</h2>
                    <p style={{ color: '#453d3a82' }}>Diffuser un message à tous les utilisateurs</p>
                </div>

                <div className="rounded-xl p-8 shadow" style={{ backgroundColor: '#FFFFFF' }}>
                    <form onSubmit={handleBroadcast} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#653239' }}>Titre</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                required
                                className="w-full px-4 py-3 rounded-lg border focus:outline-none"
                                style={{ borderColor: '#E2D4BA' }}
                                placeholder="Ex: Nouvelle mission disponible !"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#653239' }}>Message</label>
                            <textarea
                                value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value })}
                                required
                                rows={5}
                                className="w-full px-4 py-3 rounded-lg border focus:outline-none resize-none"
                                style={{ borderColor: '#E2D4BA' }}
                                placeholder="Contenu de la notification..."
                            />
                        </div>

                        {status === 'success' && (
                            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#EAF9D9', color: '#653239' }}>
                                <CircleCheck className="w-5 h-5" /> Notification envoyée à tous les utilisateurs !
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#fff0f0', color: '#8B0000' }}>
                                <XCircle className="w-5 h-5" /> Erreur lors de l'envoi.
                            </div>
                        )}

                        <button type="submit" className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2" style={{ backgroundColor: '#653239', color: '#EAF9D9' }}>
                            <Send className="w-5 h-5" /> Envoyer à tous
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminNotifications;