import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Users, Calendar as CalendarIcon, Star, Clock, Grid3x3, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function SimpleCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [missions, setMissions] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [missionsOfDay, setMissionsOfDay] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewType, setViewType] = useState('month'); // 'month' ou 'week'
    const navigate = useNavigate();

    useEffect(() => {
        fetchMissions();
    }, []);

    const fetchMissions = async () => {
        try {
            const response = await api.get('/missions?per_page=100');
            const missionsData = response.data.data || response.data;
            setMissions(Array.isArray(missionsData) ? missionsData : []);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMissionsForDate = (date) => {
        return missions.filter(mission => 
            new Date(mission.date).toDateString() === date.toDateString()
        );
    };

    // Générer les jours du mois
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        let startDay = firstDayOfMonth.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1;
        
        const days = [];
        
        // Jours du mois précédent
        const prevMonthDate = new Date(year, month, 0);
        const prevMonthDays = prevMonthDate.getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            const dateObj = new Date(year, month - 1, prevMonthDays - i);
            days.push({
                date: dateObj,
                isCurrentMonth: false,
                missions: getMissionsForDate(dateObj)
            });
        }
        
        // Jours du mois courant
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const dateObj = new Date(year, month, i);
            days.push({
                date: dateObj,
                isCurrentMonth: true,
                missions: getMissionsForDate(dateObj)
            });
        }
        
        // Jours du mois suivant
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            const dateObj = new Date(year, month + 1, i);
            days.push({
                date: dateObj,
                isCurrentMonth: false,
                missions: getMissionsForDate(dateObj)
            });
        }
        
        return days;
    };

    // Générer les jours de la semaine
    const getWeekDays = () => {
        const startOfWeek = new Date(currentDate);
        const dayOfWeek = startOfWeek.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(currentDate.getDate() - diff);
        
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const dateObj = new Date(startOfWeek);
            dateObj.setDate(startOfWeek.getDate() + i);
            weekDays.push({
                date: dateObj,
                missions: getMissionsForDate(dateObj)
            });
        }
        return weekDays;
    };

    const changeMonth = (increment) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
        setSelectedDate(null);
        setMissionsOfDay([]);
    };

    const changeWeek = (increment) => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (increment * 7));
        setCurrentDate(newDate);
        setSelectedDate(null);
        setMissionsOfDay([]);
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
        setMissionsOfDay(getMissionsForDate(today));
    };

    const handlePrevious = () => {
        if (viewType === 'month') {
            changeMonth(-1);
        } else {
            changeWeek(-1);
        }
    };

    const handleNext = () => {
        if (viewType === 'month') {
            changeMonth(1);
        } else {
            changeWeek(1);
        }
    };

    const getTitle = () => {
        if (viewType === 'month') {
            const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
            return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        } else {
            const weekDaysList = getWeekDays();
            const startWeek = weekDaysList[0]?.date;
            const endWeek = weekDaysList[6]?.date;
            if (startWeek && endWeek) {
                const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                const startMonth = startWeek.getMonth();
                const endMonth = endWeek.getMonth();
                if (startMonth === endMonth) {
                    return `${monthNames[startMonth]} ${startWeek.getFullYear()}`;
                } else {
                    return `${monthNames[startMonth]} - ${monthNames[endMonth]} ${startWeek.getFullYear()}`;
                }
            }
            return '';
        }
    };

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const weekDaysShort = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    const days = getDaysInMonth(currentDate);
    const weekDaysList = getWeekDays();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent" 
                         style={{ borderColor: '#653239' }}></div>
                    <CalendarIcon className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 animate-pulse" 
                                  style={{ color: '#653239' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête du calendrier */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl shadow-sm" style={{ backgroundColor: '#653239' }}>
                        <CalendarIcon className="w-6 h-6" style={{ color: '#EAF9D9' }} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold" style={{ color: '#653239' }}>
                            Calendrier des missions
                        </h2>
                        <p className="text-sm" style={{ color: '#AF7A6D' }}>
                            Visualisez toutes les missions par date
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 rounded-xl font-medium transition-all hover:scale-105"
                        style={{ backgroundColor: '#EAF9D9', color: '#653239' }}
                    >
                        Aujourd'hui
                    </button>
                    <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: '#E2D4BA' }}>
                        <button
                            onClick={() => setViewType('month')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                viewType === 'month' ? 'shadow-md' : 'opacity-60'
                            }`}
                            style={{
                                backgroundColor: viewType === 'month' ? '#653239' : 'transparent',
                                color: viewType === 'month' ? '#FFFFFF' : '#653239'
                            }}
                        >
                            <Grid3x3 className="w-4 h-4" />
                            Mois
                        </button>
                        <button
                            onClick={() => setViewType('week')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                                viewType === 'week' ? 'shadow-md' : 'opacity-60'
                            }`}
                            style={{
                                backgroundColor: viewType === 'week' ? '#653239' : 'transparent',
                                color: viewType === 'week' ? '#FFFFFF' : '#653239'
                            }}
                        >
                            <CalendarDays className="w-4 h-4" />
                            Semaine
                        </button>
                    </div>
                </div>
            </div>

            {/* Corps du calendrier */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Calendrier */}
                <div className="rounded-2xl shadow-xl overflow-hidden" 
                     style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D4BA' }}>
                    
                    {/* Navigation */}
                    <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: '#E2D4BA' }}>
                        <button 
                            onClick={handlePrevious}
                            className="p-2 rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
                        >
                            <ChevronLeft className="w-5 h-5" style={{ color: '#653239' }} />
                        </button>
                        <h3 className="text-xl font-bold" style={{ color: '#653239' }}>
                            {getTitle()}
                        </h3>
                        <button 
                            onClick={handleNext}
                            className="p-2 rounded-xl hover:bg-gray-100 transition-all hover:scale-105"
                        >
                            <ChevronRight className="w-5 h-5" style={{ color: '#653239' }} />
                        </button>
                    </div>

                    {/* Vue Mois */}
                    {viewType === 'month' && (
                        <>
                            {/* Jours de la semaine */}
                            <div className="grid grid-cols-7 gap-0.5 p-4">
                                {weekDaysShort.map(day => (
                                    <div key={day} className="text-center py-3">
                                        <span className="text-sm font-semibold" style={{ color: '#AF7A6D' }}>
                                            {day}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Grille des jours */}
                            <div className="grid grid-cols-7 gap-0.5 p-4 pt-0">
                                {days.map((day, index) => {
                                    const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                                    const hasMissionToday = day.missions.length > 0;
                                    const isToday = day.date.toDateString() === new Date().toDateString();
                                    const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                                    
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setSelectedDate(day.date);
                                                setMissionsOfDay(day.missions);
                                            }}
                                            className={`
                                                relative aspect-square p-2 rounded-xl transition-all duration-200
                                                ${!day.isCurrentMonth ? 'opacity-40' : ''}
                                                ${isSelected ? 'shadow-lg transform scale-95' : 'hover:scale-105'}
                                            `}
                                            style={{
                                                backgroundColor: isSelected 
                                                    ? '#653239' 
                                                    : (isToday 
                                                        ? '#EAF9D9' 
                                                        : (isWeekend && day.isCurrentMonth ? '#fafaf9' : 'transparent')),
                                                color: isSelected ? '#FFFFFF' : (isToday ? '#653239' : '#251e1f')
                                            }}
                                        >
                                            <span className="text-sm font-medium">{day.date.getDate()}</span>
                                            
                                            {hasMissionToday && !isSelected && (
                                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                                                    <div className="w-1.5 h-1.5 rounded-full" 
                                                         style={{ backgroundColor: isToday ? '#653239' : '#AF7A6D' }} />
                                                </div>
                                            )}
                                            
                                            {hasMissionToday && isSelected && (
                                                <div className="absolute -top-1 -right-1">
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                                                         style={{ backgroundColor: '#EAF9D9', color: '#653239' }}>
                                                        {day.missions.length}
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Vue Semaine */}
                    {viewType === 'week' && (
                        <div className="p-4">
                            <div className="grid grid-cols-7 gap-2">
                                {weekDaysList.map((day, idx) => {
                                    const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                                    const hasMissionToday = day.missions.length > 0;
                                    const isToday = day.date.toDateString() === new Date().toDateString();
                                    
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setSelectedDate(day.date);
                                                setMissionsOfDay(day.missions);
                                            }}
                                            className={`p-3 rounded-xl text-center transition-all ${
                                                isSelected ? 'shadow-md' : 'hover:shadow-sm'
                                            }`}
                                            style={{
                                                backgroundColor: isSelected 
                                                    ? '#653239' 
                                                    : (isToday ? '#EAF9D9' : '#fafaf9'),
                                                color: isSelected ? '#FFFFFF' : '#653239'
                                            }}
                                        >
                                            <div className="text-xs font-medium mb-1">
                                                {weekDaysShort[idx]}
                                            </div>
                                            <div className="text-xl font-bold">
                                                {day.date.getDate()}
                                            </div>
                                            {hasMissionToday && (
                                                <div className="mt-1">
                                                    <div className="w-1.5 h-1.5 rounded-full mx-auto" 
                                                         style={{ backgroundColor: isSelected ? '#EAF9D9' : '#AF7A6D' }} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    {/* Légende */}
                    <div className="flex justify-center gap-6 p-4 border-t" style={{ borderColor: '#E2D4BA', backgroundColor: '#fafaf9' }}>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EAF9D9' }}></div>
                            <span className="text-xs" style={{ color: '#AF7A6D' }}>Aujourd'hui</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#653239' }}></div>
                            <span className="text-xs" style={{ color: '#AF7A6D' }}>Sélectionné</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#AF7A6D' }}></div>
                            <span className="text-xs" style={{ color: '#AF7A6D' }}>Mission</span>
                        </div>
                    </div>
                </div>

                {/* Missions du jour */}
                <div className="rounded-2xl shadow-xl overflow-hidden" 
                     style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D4BA' }}>
                    
                    <div className="p-6 border-b" style={{ borderColor: '#E2D4BA', backgroundColor: '#fafaf9' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl" style={{ backgroundColor: '#EAF9D9' }}>
                                <CalendarIcon className="w-5 h-5" style={{ color: '#653239' }} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold" style={{ color: '#653239' }}>
                                    {selectedDate 
                                        ? selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                                        : 'Aucune date sélectionnée'
                                    }
                                </h3>
                                {selectedDate && missionsOfDay.length > 0 && (
                                    <p className="text-sm" style={{ color: '#AF7A6D' }}>
                                        {missionsOfDay.length} mission{missionsOfDay.length > 1 ? 's' : ''} prévue{missionsOfDay.length > 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        {!selectedDate ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" 
                                     style={{ backgroundColor: '#EAF9D9' }}>
                                    <CalendarIcon className="w-10 h-10" style={{ color: '#653239' }} />
                                </div>
                                <p className="font-medium" style={{ color: '#AF7A6D' }}>
                                    Cliquez sur une date
                                </p>
                            </div>
                        ) : missionsOfDay.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" 
                                     style={{ backgroundColor: '#fafaf9' }}>
                                    <Clock className="w-10 h-10" style={{ color: '#CCC7B9' }} />
                                </div>
                                <p className="font-medium" style={{ color: '#AF7A6D' }}>
                                    Aucune mission prévue
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {missionsOfDay.map((mission, idx) => (
                                    <div 
                                        key={mission.id}
                                        className="group p-5 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                                        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2D4BA' }}
                                        onClick={() => navigate(`/missions/${mission.id}`)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#653239' }}></div>
                                                    <span className="text-xs font-medium" style={{ color: '#AF7A6D' }}>
                                                        Mission #{idx + 1}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-lg" style={{ color: '#653239' }}>
                                                    {mission.title}
                                                </h4>
                                            </div>
                                            {mission.available_places <= 5 && mission.available_places > 0 && (
                                                <span className="px-2 py-1 rounded-lg text-xs font-semibold animate-pulse"
                                                      style={{ backgroundColor: '#fff0f0', color: '#cc0000' }}>
                                                    Plus que {mission.available_places}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-4 mb-3 text-sm" style={{ color: '#AF7A6D' }}>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4" />
                                                <span>{mission.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-4 h-4" />
                                                <span>{mission.available_places} places</span>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-3 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity"
                                             style={{ borderColor: '#E2D4BA' }}>
                                            <span className="text-xs" style={{ color: '#653239' }}>
                                                Cliquez pour voir les détails →
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #E2D4BA;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #653239;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
}

export default SimpleCalendar;