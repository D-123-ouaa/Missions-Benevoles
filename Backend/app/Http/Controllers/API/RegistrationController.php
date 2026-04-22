<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\Registration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class RegistrationController extends Controller
{
    // Faire l'inscription dans une mission (bénévole uniquement)
    // POST /api/missions/{mission}/register
    public function register(Request $request, $missionId)
    {
        $user = auth()->user();
        $mission = Mission::findOrFail($missionId);
        
        if ($user->role !== 'volunteer') {
            return response()->json(['message' => 'Seuls les bénévoles peuvent s\'inscrire'], 403);
        }
        
        if ($mission->date < now()) {
            return response()->json(['message' => 'Cette mission est déjà passée'], 400);
        }
        
        if ($mission->available_places <= 0) {
            return response()->json(['message' => 'Plus de places disponibles'], 400);
        }
        
        $existing = Registration::where('user_id', $user->id)
            ->where('mission_id', $mission->id)
            ->where('status', 'confirmed')
            ->exists();
            
        if ($existing) {
            return response()->json(['message' => 'Vous êtes déjà inscrit'], 409);
        }
        
        // Créer l'inscription
        $registration = Registration::create([
            'user_id' => $user->id,
            'mission_id' => $missionId,
            'status' => 'confirmed',
            'registered_at' => now(),
        ]);
        
        $mission->decrement('available_places');
        
        return response()->json([
            'registration' => $registration,
            'message' => 'Inscription réussie'
        ], 201);
    }
    
    // se désister d'une mission (bénévole uniquement)
    // DELETE /api/missions/{mission}/unregister
    public function unregister($missionId)
    {
        $user = auth()->user();
        $mission = Mission::findOrFail($missionId);
       
        $registration = Registration::where('user_id', $user->id)
            ->where('mission_id', $missionId)
            ->where('status', 'confirmed')
            ->first();
        
        if (!$registration) {
            return response()->json(['message' => 'Vous n\'êtes pas inscrit à cette mission'], 404);
        }
        
        $registration->status = 'cancelled';
        $registration->save();
        
        $mission->increment('available_places');
        
        return response()->json(['message' => 'Désistement réussi'], 200);
    }
    
    // Afficher les participants dans une mission (admin uniquement)
    // GET /api/missions/{mission}/participants
    public function participants($missionId)
    {
        $mission = Mission::findOrFail($missionId);
        
        $user = auth()->user();
        if ($user->role !== "admin") {
            return response()->json(['message' => 'Seuls les administrateurs peuvent voir les participants de la mission'], 403);
        }
        
        $participants = $mission->volunteers()
            ->wherePivot('status', 'confirmed')
            ->get(['users.id', 'users.name', 'users.email', 'users.phone']);
            
        return response()->json([
            'mission' => $mission->title,
            'participants' => $participants,
            'count' => $participants->count()
        ], 200);
    }
    
    // Afficher les inscriptions de l'utilisateur dans les missions (bénévole uniquement)
    // GET /api/my-registrations
    public function myRegistrations()
    {   
        $user = auth()->user();
        if ($user->role !== "volunteer") {
            return response()->json(['message' => 'Seuls les bénévoles peuvent voir leurs inscriptions'], 403);
        }
        
        $registrations = $user->missions()->wherePivot('status', 'confirmed')->withPivot('registered_at')->with('images')->orderBy('date', 'asc')->get();
            
        return response()->json([
            'registrations' => $registrations,
            'count' => $registrations->count()
        ], 200);
    }
    
    // Export fichier CSV des participants dans la mission (admin uniquement)
    // GET /api/missions/{mission}/export
    public function export($missionId)
    {
        $mission = Mission::findOrFail($missionId);
        
        $user = auth()->user();
        if ($user->role !== "admin") {
            return response()->json(['message' => 'Seuls les administrateurs peuvent faire l\'export des participants'], 403);
        }
        
        $participants = $mission->volunteers()
            ->wherePivot('status', 'confirmed')
            ->get(['users.id', 'users.name', 'users.email', 'users.phone']);
        
        // Créer le contenu CSV
        $csvContent = "Mission,Date,Lieu,Nom bénévole,Prénom,Email,Téléphone,Date inscription\n";
        
        foreach ($participants as $participant) {
            $fullName = $participant->name;
            $nameParts = explode(' ', $fullName, 2);
            $firstName = $nameParts[0];
            $lastName = $nameParts[1] ?? '';
            
            $csvContent .= '"' . $mission->title . '",';
            $csvContent .= '"' . $mission->date . '",';
            $csvContent .= '"' . $mission->location . '",';
            $csvContent .= '"' . $lastName . '",';
            $csvContent .= '"' . $firstName . '",';
            $csvContent .= '"' . $participant->email . '",';
            $csvContent .= '"' . $participant->phone . '",';
            $csvContent .= '"' . $participant->pivot->registered_at . "\"\n";
        }
        
        return response($csvContent, 200)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="participants_' . $mission->id . '.csv"');
    }
}