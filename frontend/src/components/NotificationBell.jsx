import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X, CircleCheck, Timer, XCircle } from 'lucide-react';
import api from '../api/axios';

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const fetchNotifications = async () => {
        try {
            const [nRes, cRes] = await Promise.all([
                api.get('/notifications'),
                api.get('/notifications/unread-count'),
            ]);
            setNotifications(nRes.data);
            setUnread(cRes.data.count);
        } catch {}
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); 
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const markRead = async (id) => {
        await api.put(`/notifications/${id}/read`);
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnread(prev => Math.max(0, prev - 1));
    };

    const markAllRead = async () => {
        await api.put('/notifications/read-all');
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        setUnread(0);
    };

    const deleteNotif = async (id) => {
        await api.delete(`/notifications/${id}`);
        const wasUnread = notifications.find(n => n.id === id)?.is_read === false;
        setNotifications(notifications.filter(n => n.id !== id));
        if (wasUnread) setUnread(prev => Math.max(0, prev - 1));
    };

    const typeColors = {
        registration: '#EAF9D9',
        reminder: '#fff8e1',
        cancellation: '#fff0f0',
        info: '#f0f4ff'
    };

    // ✅ CORRECTION : Utiliser des fonctions qui retournent des composants React
    const getTypeIcon = (type) => {
        const iconProps = { className: "w-5 h-5" };
        switch (type) {
            case 'registration':
                return <CircleCheck {...iconProps} style={{ color: '#22c55e' }} />;
            case 'reminder':
                return <Timer {...iconProps} style={{ color: '#f59e0b' }} />;
            case 'cancellation':
                return <XCircle {...iconProps} style={{ color: '#ef4444' }} />;
            case 'info':
                return <Bell {...iconProps} style={{ color: '#3b82f6' }} />;
            default:
                return <Bell {...iconProps} style={{ color: '#AF7A6D' }} />;
        }
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen(!open)} className="relative p-2 rounded-full hover:bg-white/10 transition">
                <Bell className="w-6 h-6" style={{ color: '#EAF9D9' }} />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                        style={{ backgroundColor: '#ff4444', color: '#fff' }}>
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-xl z-50 overflow-hidden"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D4BA' }}>
                    {/* Header */}
                    <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '1px solid #E2D4BA' }}>
                        <h3 className="font-semibold" style={{ color: '#653239' }}>
                            Notifications {unread > 0 && <span className="text-xs px-2 py-0.5 rounded-full ml-1" style={{ backgroundColor: '#EAF9D9', color: '#653239' }}>{unread}</span>}
                        </h3>
                        {unread > 0 && (
                            <button onClick={markAllRead} className="text-xs flex items-center gap-1 hover:underline" style={{ color: '#AF7A6D' }}>
                                <Check className="w-3 h-3" /> Tout lire
                            </button>
                        )}
                    </div>

                    {/* Liste */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="text-center py-8" style={{ color: '#AF7A6D' }}>
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">Aucune notification</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className="px-4 py-3 flex gap-3 hover:bg-gray-50 transition"
                                    style={{
                                        backgroundColor: n.is_read ? '#FFFFFF' : (typeColors[n.type] || '#f5f5f5'),
                                        borderBottom: '1px solid #E2D4BA'
                                    }}>
                                    {/* ✅ Utilisation correcte de l'icône */}
                                    <div className="flex-shrink-0">
                                        {getTypeIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: '#251e1f' }}>{n.title}</p>
                                        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#AF7A6D' }}>{n.message}</p>
                                        <p className="text-xs mt-1" style={{ color: '#CCC7B9' }}>
                                            {new Date(n.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {!n.is_read && (
                                            <button onClick={() => markRead(n.id)} className="p-1 rounded hover:bg-green-100">
                                                <Check className="w-3 h-3 text-green-600" />
                                            </button>
                                        )}
                                        <button onClick={() => deleteNotif(n.id)} className="p-1 rounded hover:bg-red-100">
                                            <Trash2 className="w-3 h-3 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;