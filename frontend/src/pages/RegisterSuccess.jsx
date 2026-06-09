import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, Mail } from 'lucide-react';

function RegisterSuccess() {
    const { state } = useLocation();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center px-4" 
             style={{ backgroundColor: '#CCC7B9' }}>
            <div className="w-full max-w-md text-center p-8 rounded-xl shadow-lg" 
                 style={{ backgroundColor: '#FFFFFF' }}>
                
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" 
                     style={{ backgroundColor: '#653239' }}>
                    <Mail className="w-8 h-8" style={{ color: '#EAF9D9' }} />
                </div>

                <h2 className="text-2xl font-bold mb-3" style={{ color: '#653239' }}>
                    Vérifiez votre email !
                </h2>

                <p className="mb-2" style={{ color: '#AF7A6D' }}>
                    Un email de vérification a été envoyé à :
                </p>
                <p className="font-semibold mb-6 px-4 py-2 rounded-lg" 
                   style={{ backgroundColor: '#EAF9D9', color: '#653239' }}>
                    {state?.email || 'votre email'}
                </p>

                <p className="text-sm mb-8" style={{ color: '#AF7A6D' }}>
                    Cliquez sur le lien dans l'email pour activer votre compte, 
                    puis connectez-vous.
                </p>

                <button 
                    onClick={() => navigate('/login')}
                    className="w-full py-3 rounded-lg font-semibold"
                    style={{ backgroundColor: '#653239', color: '#EAF9D9' }}>
                    Aller à la connexion
                </button>
            </div>
        </div>
    );
}

export default RegisterSuccess;