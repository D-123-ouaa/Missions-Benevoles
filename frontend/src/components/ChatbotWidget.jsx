import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, History, Command, Trash2, Plus } from 'lucide-react';
import api from '../api/axios';

function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Bonjour ! 👋 Je suis votre assistant. Tapez **aide** pour voir les commandes disponibles.' }
    ]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);
    const token = localStorage.getItem('token');
    const [showCommands, setShowCommands] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [commands, setCommands] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Charger les commandes disponibles
    const fetchCommands = async () => {
        try {
            const res = await api.get('/chatbot/commands');
            setCommands(res.data.commands || []);
        } catch (error) {
            console.error('Erreur chargement commandes:', error);
        }
    };

    // Charger l'historique des conversations
    const fetchConversations = async () => {
        setLoadingHistory(true);
        try {
            const res = await api.get('/chatbot/conversations');
            setConversations(res.data);
        } catch (error) {
            console.error('Erreur chargement historique:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    // Supprimer une conversation
    const deleteConversation = async (id) => {
        if (!confirm('Supprimer cette conversation ?')) return;
        try {
            await api.delete(`/chatbot/conversations/${id}`);
            if (currentConversationId === id) {
                startNewConversation();
            }
            fetchConversations();
        } catch (error) {
            console.error('Erreur suppression:', error);
        }
    };

    // Charger une conversation existante
    const loadConversation = (conversation) => {
        if (conversation.messages && conversation.messages.length > 0) {
            setMessages(conversation.messages);
            setCurrentConversationId(conversation.id);
            setShowHistory(false);
        }
    };

    // Démarrer une nouvelle conversation
    const startNewConversation = () => {
        setMessages([
            { role: 'bot', content: 'Bonjour ! 👋 Je suis votre assistant. Tapez **aide** pour voir les commandes disponibles.' }
        ]);
        setCurrentConversationId(null);
        setShowHistory(false);
        setShowCommands(false);
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        
        // Ajouter le message utilisateur à l'affichage
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post('/chatbot/message', { message: userMsg });
            const botResponse = res.data.response;
            
            // Ajouter la réponse du bot
            setMessages(prev => [...prev, { role: 'bot', content: botResponse }]);
            
            // La conversation est automatiquement sauvegardée par le backend
            // On recharge l'historique pour mettre à jour l'ID
            const convRes = await api.get('/chatbot/conversations');
            if (convRes.data && convRes.data.length > 0) {
                setCurrentConversationId(convRes.data[0].id);
            }
            
        } catch (error) {
            console.error('Erreur:', error);
            setMessages(prev => [...prev, { role: 'bot', content: "Désolé, une erreur s'est produite." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => { 
        if (e.key === 'Enter' && !e.shiftKey) { 
            e.preventDefault(); 
            sendMessage(); 
        } 
    };

    const formatMsg = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>');
    };

    if (!token) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Bouton flottant */}
            <button
                onClick={() => setOpen(!open)}
                className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition hover:scale-105"
                style={{ backgroundColor: '#653239' }}
            >
                {open ? <X className="w-6 h-6" style={{ color: '#EAF9D9' }} /> : <MessageCircle className="w-6 h-6" style={{ color: '#EAF9D9' }} />}
            </button>

            {/* Fenêtre chat */}
            {open && (
                <div className="absolute bottom-16 right-0 w-80 sm:w-96 rounded-xl shadow-2xl overflow-hidden"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D4BA' }}>
                    
                    {/* Header avec boutons */}
                    <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#653239' }}>
                        <div className="flex items-center gap-3">
                            <Bot className="w-6 h-6" style={{ color: '#EAF9D9' }} />
                            <div>
                                <p className="font-semibold text-sm" style={{ color: '#EAF9D9' }}>Assistant</p>
                                <p className="text-xs" style={{ color: '#E2D4BA' }}>En ligne</p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            {/* Bouton Nouvelle conversation */}
                            <button 
                                onClick={startNewConversation}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition"
                                title="Nouvelle conversation"
                            >
                                <Plus className="w-4 h-4" style={{ color: '#EAF9D9' }} />
                            </button>
                            
                            {/* Bouton Commandes - Toggle */}
                            <button 
                                onClick={() => {
                                    if (!showCommands) {
                                        fetchCommands();
                                    }
                                    setShowCommands(!showCommands);
                                    if (showCommands) setShowHistory(false);
                                }}
                                className={`p-1.5 rounded-lg transition ${showCommands ? 'bg-white/20' : 'hover:bg-white/10'}`}
                                title="Commandes"
                            >
                                <Command className="w-4 h-4" style={{ color: '#EAF9D9' }} />
                            </button>
                            
                            {/* Bouton Historique - Toggle */}
                            <button 
                                onClick={() => {
                                    if (!showHistory) {
                                        fetchConversations();
                                    }
                                    setShowHistory(!showHistory);
                                    if (showHistory) setShowCommands(false);
                                }}
                                className={`p-1.5 rounded-lg transition ${showHistory ? 'bg-white/20' : 'hover:bg-white/10'}`}
                                title="Historique"
                            >
                                <History className="w-4 h-4" style={{ color: '#EAF9D9' }} />
                            </button>
                        </div>
                    </div>

                    {/* Panneau Commandes */}
                    {showCommands && (
                        <div className="border-b" style={{ borderColor: '#E2D4BA', backgroundColor: '#fafaf9' }}>
                            <div className="flex justify-between items-center px-4 py-2">
                                <span className="text-sm font-semibold" style={{ color: '#653239' }}>Commandes disponibles</span>
                                <button onClick={() => setShowCommands(false)} className="text-xs hover:underline" style={{ color: '#AF7A6D' }}>
                                    Fermer
                                </button>
                            </div>
                            <div className="px-2 pb-2 flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                                {commands.map((cmd, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setInput(cmd);
                                            setShowCommands(false);
                                        }}
                                        className="px-2 py-1 rounded-full text-xs transition hover:opacity-80"
                                        style={{ backgroundColor: '#EAF9D9', color: '#653239' }}
                                    >
                                        {cmd.length > 25 ? cmd.substring(0, 25) + '...' : cmd}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Panneau Historique */}
                    {showHistory && (
                        <div className="border-b" style={{ borderColor: '#E2D4BA', backgroundColor: '#fafaf9' }}>
                            <div className="flex justify-between items-center px-4 py-2">
                                <span className="text-sm font-semibold" style={{ color: '#653239' }}>Historique des conversations</span>
                                <button onClick={() => setShowHistory(false)} className="text-xs hover:underline" style={{ color: '#AF7A6D' }}>
                                    Fermer
                                </button>
                            </div>
                            <div className="max-h-48 overflow-y-auto px-2 pb-2">
                                {loadingHistory ? (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent mx-auto" style={{ borderColor: '#653239' }}></div>
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <p className="text-xs text-center py-4" style={{ color: '#AF7A6D' }}>Aucune conversation sauvegardée</p>
                                ) : (
                                    conversations.map(conv => (
                                        <div key={conv.id} className={`flex items-center justify-between py-2 px-2 rounded-lg cursor-pointer group ${currentConversationId === conv.id ? 'bg-gray-100' : 'hover:bg-gray-100'}`}>
                                            <div onClick={() => loadConversation(conv)} className="flex-1">
                                                <p className="text-xs truncate" style={{ color: '#251e1f' }}>
                                                    {conv.messages?.[0]?.content?.substring(0, 50) || 'Nouvelle conversation'}
                                                </p>
                                                <p className="text-[10px]" style={{ color: '#AF7A6D' }}>
                                                    {new Date(conv.created_at).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 transition"
                                            >
                                                <Trash2 className="w-3 h-3 text-red-400" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="h-72 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: '#fafaf9' }}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'bot' && (
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EAF9D9' }}>
                                        <Bot className="w-4 h-4" style={{ color: '#653239' }} />
                                    </div>
                                )}
                                <div
                                    className="max-w-[75%] px-3 py-2 rounded-xl text-sm"
                                    style={{
                                        backgroundColor: msg.role === 'user' ? '#653239' : '#FFFFFF',
                                        color: msg.role === 'user' ? '#EAF9D9' : '#251e1f',
                                        border: msg.role === 'bot' ? '1px solid #E2D4BA' : 'none'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: formatMsg(msg.content) }}
                                />
                                {msg.role === 'user' && (
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#AF7A6D' }}>
                                        <User className="w-4 h-4" style={{ color: '#EAF9D9' }} />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-2">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EAF9D9' }}>
                                    <Bot className="w-4 h-4" style={{ color: '#653239' }} />
                                </div>
                                <div className="px-3 py-2 rounded-xl text-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D4BA' }}>
                                    <span className="animate-pulse" style={{ color: '#AF7A6D' }}>...</span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 flex gap-2" style={{ borderTop: '1px solid #E2D4BA' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Tapez votre message..."
                            className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none"
                            style={{ borderColor: '#E2D4BA' }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            className="p-2 rounded-lg transition disabled:opacity-50"
                            style={{ backgroundColor: '#653239' }}
                        >
                            <Send className="w-4 h-4" style={{ color: '#EAF9D9' }} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatbotWidget;