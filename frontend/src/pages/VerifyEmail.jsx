import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Heart, CircleCheck, XCircle, Loader } from 'lucide-react';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading | success | error
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const url = searchParams.get('url');
        if (!url) {
            setStatus('error');
            setMessage('Lien de vérification invalide.');
            return;
        }

        // Extraire id et hash depuis l'URL backend
        const match = url.match(/verify-email\/(\d+)\/([a-f0-9]+)/);
        if (!match) {
            setStatus('error');
            setMessage('Lien de vérification invalide.');
            return;
        }

        const [, id, hash] = match;
        // Reconstruire les query params depuis l'URL signée
        const urlObj = new URL(decodeURIComponent(url));
        const expires = urlObj.searchParams.get('expires');
        const signature = urlObj.searchParams.get('signature');

        api.get(`/auth/verify-email/${id}/${hash}?expires=${expires}&signature=${signature}`)
            .then(() => {
                setStatus('success');
                setMessage('Votre email a été vérifié avec succès !');
                setTimeout(() => navigate('/login'), 3000);
            })
            .catch((err) => {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Lien invalide ou expiré.');
            });
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#CCC7B9' }}>
            <div className="w-full max-w-md text-center p-8 rounded-xl shadow-lg" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ backgroundColor: '#653239' }}>
                    <Heart className="w-8 h-8" style={{ color: '#EAF9D9' }} />
                </div>

                {status === 'loading' && (
                    <>
                        <Loader className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: '#653239' }} />
                        <p style={{ color: '#653239' }}>Vérification en cours...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CircleCheck className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <h2 className="text-xl font-bold mb-2" style={{ color: '#653239' }}>Email vérifié !</h2>
                        <p className="mb-4" style={{ color: '#AF7A6D' }}>{message}</p>
                        <p className="text-sm" style={{ color: '#AF7A6D' }}>Redirection vers la connexion...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <h2 className="text-xl font-bold mb-2" style={{ color: '#653239' }}>Erreur</h2>
                        <p className="mb-6" style={{ color: '#AF7A6D' }}>{message}</p>
                        <button onClick={() => navigate('/login')} className="px-6 py-2 rounded-lg font-semibold" style={{ backgroundColor: '#653239', color: '#EAF9D9' }}>
                            Retour à la connexion
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;