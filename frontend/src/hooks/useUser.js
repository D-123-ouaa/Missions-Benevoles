import { useState, useEffect } from 'react';

export function useUser() {
    const [user, setUser] = useState(() => {
        const u = localStorage.getItem('user');
        if (u && u !== 'undefined' && u !== 'null') {
            try { return JSON.parse(u); } catch { return {}; }
        }
        return {};
    });

    // Écouter les changements du localStorage (entre composants)
    useEffect(() => {
        const handleStorage = () => {
            const u = localStorage.getItem('user');
            if (u && u !== 'undefined' && u !== 'null') {
                try { setUser(JSON.parse(u)); } catch { setUser({}); }
            } else {
                setUser({});
            }
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('user-updated', handleStorage);
        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('user-updated', handleStorage);
        };
    }, []);

    const updateUser = (newUserData) => {
        const updated = { ...user, ...newUserData };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
        // Déclencher l'event pour mettre à jour tous les composants
        window.dispatchEvent(new Event('user-updated'));
    };

    return { user, updateUser };
}