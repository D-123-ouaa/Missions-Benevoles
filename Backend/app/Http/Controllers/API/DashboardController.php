<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller {

    public function stats() {
        $user = auth()->user();
        if (!$user->isAdmin() && !$user->isManager()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $totalMissions = Mission::count();
        $totalVolunteers = User::where('role', 'volunteer')->count();
        $totalRegistrations = Registration::where('status', 'confirmed')->count();
        $totalPlaces = Mission::sum('available_places');
        $occupiedPlaces = Registration::where('status', 'confirmed')->count();
        $fillRate = $totalPlaces > 0 ? round(($occupiedPlaces / ($totalPlaces + $occupiedPlaces)) * 100, 1) : 0;

        return response()->json([
            'total_missions' => $totalMissions,
            'total_volunteers' => $totalVolunteers,
            'total_registrations' => $totalRegistrations,
            'fill_rate' => $fillRate,
        ]);
    }

    public function missionsPerMonth() {
        $data = Mission::selectRaw('MONTH(date) as month, COUNT(*) as count')
            ->whereYear('date', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function($row) {
                $monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
                return [
                    'month' => $monthNames[$row->month - 1],
                    'count' => (int) $row->count
                ];
            });
        
        // Ajouter les mois manquants avec count = 0
        $allMonths = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        $result = [];
        foreach ($allMonths as $month) {
            $found = $data->firstWhere('month', $month);
            $result[] = [
                'month' => $month,
                'count' => $found ? $found['count'] : 0
            ];
        }
        
        return response()->json($result);
    }

    public function topMissions() {
        $data = Mission::withCount(['volunteers' => function($query) {
            $query->where('registrations.status', 'confirmed');
        }])
        ->orderByDesc('volunteers_count')
        ->take(5)
        ->get(['id', 'title', 'date', 'location']);
        
        return response()->json($data);
    }

    public function registrationsTimeline() {
        $data = Registration::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('status', 'confirmed')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function($row) {
                return [
                    'date' => $row->date,
                    'count' => (int) $row->count
                ];
            });
        
        return response()->json($data);
    }
}