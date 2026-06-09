import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Users, Calendar, TrendingUp, Award, Download, Bell, UserCog, Plus, Heart, FileText, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [missionsPerMonth, setMissionsPerMonth] = useState([]);
    const [topMissions, setTopMissions] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const isSuperAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';
    const canViewDashboard = isSuperAdmin || isManager;

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                
                const [s, m, t, tl] = await Promise.all([
                    api.get('/admin/dashboard/stats'),
                    api.get('/admin/dashboard/missions-per-month'),
                    api.get('/admin/dashboard/top-missions'),
                    api.get('/admin/dashboard/registrations-timeline'),
                ]);
                
                setStats(s.data);
                setMissionsPerMonth(Array.isArray(m.data) ? m.data : []);
                setTopMissions(Array.isArray(t.data) ? t.data : []);
                setTimeline(Array.isArray(tl.data) ? tl.data : []);
                
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const exportCSV = async (missionId, title) => {
        try {
            const response = await api.get(`/missions/${missionId}/export/csv`, { 
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `participants_${title}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur export CSV:', error);
        }
    };

    const exportPDF = async (missionId, title) => {
        try {
            const response = await api.get(`/missions/${missionId}/export/pdf`, { 
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `rapport_mission_${title}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erreur export PDF:', error);
        }
    };

    if (!canViewDashboard) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]" style={{ backgroundColor: '#CCC7B9' }}>
                <div className="text-center p-8 rounded-2xl bg-white shadow-xl">
                    <Heart className="w-16 h-16 mx-auto mb-4" style={{ color: '#AF7A6D' }} />
                    <h2 className="text-2xl font-bold" style={{ color: '#653239' }}>Accès non autorisé</h2>
                    <p className="mt-2" style={{ color: '#AF7A6D' }}>Vous n'avez pas les droits pour accéder à cette page.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]" style={{ backgroundColor: '#CCC7B9' }}>
                <div className="text-center">
                    <Heart className="w-12 h-12 animate-pulse mx-auto mb-4" style={{ color: '#653239' }} />
                    <p style={{ color: '#AF7A6D' }}>Chargement...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]" style={{ backgroundColor: '#CCC7B9' }}>
                <div className="text-center p-8 rounded-2xl bg-white shadow-xl">
                    <p className="text-red-500"><XCircle className="w-5 h-5" /> Erreur: {error}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 rounded-lg" style={{ backgroundColor: '#653239', color: '#EAF9D9' }}>
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    const kpis = [
        { label: 'Total Missions', value: stats?.total_missions || 0, icon: Calendar, color: '#653239', bg: '#EAF9D9' },
        { label: 'Bénévoles', value: stats?.total_volunteers || 0, icon: Users, color: '#AF7A6D', bg: '#fafaf9' },
        { label: 'Inscriptions', value: stats?.total_registrations || 0, icon: TrendingUp, color: '#653239', bg: '#EAF9D9' },
        { label: 'Taux de remplissage', value: `${stats?.fill_rate || 0}%`, icon: Award, color: '#AF7A6D', bg: '#fafaf9' },
    ];

    return (
        <div className="min-h-screen pt-20 pb-10 px-4" style={{ backgroundColor: '#CCC7B9' }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-5" style={{ color: '#653239', fontSize: '35px' }}>
                                Tableau de bord
                            </h1>
                            <p className="text-lg" style={{ color: '#AF7A6D', fontSize: '20px', top: '-20px', position: 'relative' }}>
                                {isSuperAdmin ? 'Super Admin' : 'Manager'} • Vue d'ensemble
                            </p>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                            <Link to="/admin/missions/create">
                                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-lg" 
                                    style={{ backgroundColor: '#653239', color: '#EAF9D9' }}>
                                    <Plus className="w-4 h-4" /> Nouvelle mission
                                </button>
                            </Link>
                            {isSuperAdmin && (
                                <>
                                    <Link to="/admin/users">
                                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-lg" 
                                            style={{ backgroundColor: '#AF7A6D', color: '#EAF9D9' }}>
                                            <UserCog className="w-4 h-4" /> Utilisateurs
                                        </button>
                                    </Link>
                                    <Link to="/admin/notifications">
                                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-lg" 
                                            style={{ backgroundColor: '#E2D4BA', color: '#653239' }}>
                                            <Bell className="w-4 h-4" /> Envoyer Notifications
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {kpis.map((kpi, i) => (
                        <div key={i} className="group rounded-2xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" 
                            style={{ backgroundColor: '#FFFFFF' }}>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium uppercase tracking-wide" style={{ color: '#AF7A6D' }}>{kpi.label}</span>
                                <div className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: kpi.bg }}>
                                    <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                                </div>
                            </div>
                            <p className="text-4xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                        </div>
                    ))}
                </div>

                {/* Graphiques */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Missions par mois */}
                    <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: '#FFFFFF' }}>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#653239' }}>
                            <Calendar className="w-5 h-5" /> Missions par mois
                        </h2>
                        {!missionsPerMonth || missionsPerMonth.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[260px] text-center">
                                <Calendar className="w-12 h-12 mb-3 opacity-40" style={{ color: '#AF7A6D' }} />
                                <p style={{ color: '#AF7A6D' }}>Aucune donnée disponible</p>
                                <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                                    {JSON.stringify(missionsPerMonth, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={missionsPerMonth}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2D4BA" />
                                    <XAxis dataKey="month" tick={{ fill: '#AF7A6D', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#AF7A6D', fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#653239" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Inscriptions */}
                    <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: '#FFFFFF' }}>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#653239' }}>
                            <TrendingUp className="w-5 h-5" /> Inscriptions (30 derniers jours)
                        </h2>
                        {!timeline || timeline.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[260px] text-center">
                                <TrendingUp className="w-12 h-12 mb-3 opacity-40" style={{ color: '#AF7A6D' }} />
                                <p style={{ color: '#AF7A6D' }}>Aucune donnée disponible</p>
                                <pre className="text-xs mt-2 bg-gray-100 p-2 rounded">
                                    {JSON.stringify(timeline, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={timeline}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2D4BA" />
                                    <XAxis dataKey="date" tick={{ fill: '#AF7A6D', fontSize: 10 }}
                                        tickFormatter={(d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : ''} />
                                    <YAxis tick={{ fill: '#AF7A6D', fontSize: 12 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#653239" strokeWidth={3} dot={{ fill: '#653239', r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Top Missions */}
                <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: '#FFFFFF' }}>
                    <h2 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#653239' }}>
                        <Award className="w-6 h-6" /> Top 5 Missions les plus populaires
                    </h2>
                    {!topMissions || topMissions.length === 0 ? (
                        <div className="text-center py-8" style={{ color: '#AF7A6D' }}>
                            <Award className="w-12 h-12 mx-auto mb-3 opacity-40" />
                            <p>Aucune mission pour le moment</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #E2D4BA' }}>
                                        <th className="text-left py-3 px-3" style={{ color: '#653239' }}>#</th>
                                        <th className="text-left py-3 px-3" style={{ color: '#653239' }}>Mission</th>
                                        <th className="text-left py-3 px-3" style={{ color: '#653239' }}>Date</th>
                                        <th className="text-left py-3 px-3" style={{ color: '#653239' }}>Lieu</th>
                                        <th className="text-left py-3 px-3" style={{ color: '#653239' }}>Inscrits</th>
                                        <th className="text-left py-3 px-3" style={{ color: '#653239' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topMissions.map((m, i) => (
                                        <tr key={m.id} className="hover:bg-gray-50 transition" style={{ borderBottom: '1px solid #E2D4BA' }}>
                                            <td className="py-3 px-3 font-bold" style={{ color: '#AF7A6D' }}>#{i + 1}</td>
                                            <td className="py-3 px-3 font-medium" style={{ color: '#251e1f' }}>{m.title}</td>
                                            <td className="py-3 px-3" style={{ color: '#AF7A6D' }}>{new Date(m.date).toLocaleDateString('fr-FR')}</td>
                                            <td className="py-3 px-3" style={{ color: '#AF7A6D' }}>{m.location}</td>
                                            <td className="py-3 px-3">
                                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold" 
                                                    style={{ backgroundColor: '#EAF9D9', color: '#653239' }}>
                                                    {m.volunteers_count || m.inscriptions_count || 0}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="flex gap-2">
                                                    <Link to={`/admin/missions/show/${m.id}`}>
                                                        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90"
                                                            style={{ backgroundColor: '#653239', color: '#EAF9D9' }}>
                                                            Voir
                                                        </button>
                                                    </Link>
                                                    <button onClick={() => exportCSV(m.id, m.title)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90 flex items-center gap-1"
                                                        style={{ backgroundColor: '#E2D4BA', color: '#653239' }}>
                                                        <FileSpreadsheet className="w-3 h-3" /> CSV
                                                    </button>
                                                    <button onClick={() => exportPDF(m.id, m.title)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-90 flex items-center gap-1"
                                                        style={{ backgroundColor: '#AF7A6D', color: '#FFFFFF' }}>
                                                        <FileText className="w-3 h-3" /> PDF
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;