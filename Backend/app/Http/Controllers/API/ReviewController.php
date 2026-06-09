<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller {

    // GET /api/missions/{id}/reviews
    public function index($missionId) {
        $mission = Mission::findOrFail($missionId);
        $reviews = $mission->reviews()->with('user:id,name,avatar')->latest()->get();
        return response()->json($reviews);
    }

    // GET /api/missions/{id}/reviews/average
    public function average($missionId) {
        $mission = Mission::findOrFail($missionId);
        $avg = $mission->reviews()->avg('rating');
        $count = $mission->reviews()->count();
        return response()->json(['average' => round($avg, 1), 'count' => $count]);
    }

    // POST /api/missions/{id}/reviews
    public function store(Request $request, $missionId) {
        $user = auth()->user();
        $mission = Mission::findOrFail($missionId);

        // Vérifier que la mission est passée
        if (!$mission->isPast()) {
            return response()->json(['message' => 'Vous ne pouvez évaluer qu\'une mission terminée'], 403);
        }

        // Vérifier que l'utilisateur était inscrit
        $wasRegistered = $mission->volunteers()
            ->wherePivot('user_id', $user->id)
            ->wherePivot('status', 'confirmed')
            ->exists();

        if (!$wasRegistered) {
            return response()->json(['message' => 'Vous devez avoir participé à cette mission pour l\'évaluer'], 403);
        }

        // Vérifier doublon
        if (Review::where('user_id', $user->id)->where('mission_id', $missionId)->exists()) {
            return response()->json(['message' => 'Vous avez déjà évalué cette mission'], 409);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $review = Review::create([
            'user_id' => $user->id,
            'mission_id' => $missionId,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return response()->json(['message' => 'Évaluation ajoutée', 'review' => $review->load('user:id,name,avatar')], 201);
    }

    // PUT /api/reviews/{id}
    public function update(Request $request, $id) {
        $review = Review::findOrFail($id);
        if ($review->user_id !== auth()->id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);
        $review->update($request->only(['rating', 'comment']));
        return response()->json(['message' => 'Évaluation mise à jour', 'review' => $review]);
    }

    // DELETE /api/reviews/{id}
    public function destroy($id) {
        $review = Review::findOrFail($id);
        $user = auth()->user();
        if ($review->user_id !== $user->id && !$user->isAdmin() && !$user->isManager()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        $review->delete();
        return response()->json(['message' => 'Évaluation supprimée']);
    }
}