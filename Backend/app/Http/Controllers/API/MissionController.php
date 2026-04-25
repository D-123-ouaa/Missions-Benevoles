<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MissionController extends Controller
{
    // Aficher toutes les missions avec pagination
    public function index(Request $request)
    {   
        $query = Mission::with(['images', 'volunteers' => function($q) {
            $q->wherePivot('status', 'confirmed');
        }]);

        // Filtre par date (si le champ n'est pas vide)
        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        // Filtre par lieu (si le champ n'est pas vide)
        if ($request->filled('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        $missions = $query->orderBy('date', 'asc')->paginate(6);
        return response()->json([
            'data' => $missions->items(),
            'current_page' => $missions->currentPage(),
            'last_page' => $missions->lastPage(),
            'total' => $missions->total(),
            'per_page' => $missions->perPage(),
        ]);
    }

    // Ajouter une nouvelle mission (admin uniquement)
    public function store(Request $request)
    {
        Gate::authorize('create', Mission::class);
        
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'date' => 'required|date',
            'location' => 'required|string|max:255',
            'available_places' => 'required|integer|min:1',
            'images' => 'sometimes|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $mission = Mission::create([
            'title' => $request->title,
            'description' => $request->description,
            'date' => $request->date,
            'location' => $request->location,
            'available_places' => $request->available_places,
        ]);

        if ($request->hasFile('images')) {
            $this->storeMissionImages($mission, $request->file('images'));
        }

        return response()->json([
            'message' => 'Mission créée avec succès',
            'mission' => $mission->load('images')
        ], 201);
    }

    // Afficher les détails d'une mission spécifique
    public function show($id)
    {
        $mission = Mission::with(['images', 'volunteers' => function($q) {
            $q->wherePivot('status', 'confirmed')->select('users.id', 'users.name', 'users.email');
        }])->findOrFail($id);
        
        return response()->json($mission);
    }

    // Modifier une mission (admin uniquement)
    public function update(Request $request, $id)
    {
        $mission = Mission::findOrFail($id);
        Gate::authorize('update', $mission);

        if ($mission->date < now()) {
            return response()->json([
                'message' => 'Impossible de modifier une mission déjà passée'
            ], 403);
        }

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'date' => 'sometimes|date',
            'location' => 'sometimes|string|max:255',
            'available_places' => 'sometimes|integer|min:1',
        ]);
        
        $mission->update($request->all());
        return response()->json([
            'message' => 'Mission mise à jour avec succès',
        ]);
    }

    // Supprimer une mission (admin uniquement)
    public function destroy($id)
    {
        $mission = Mission::findOrFail($id);
        Gate::authorize('delete', $mission);

        $mission->registrations()->delete();

        foreach ($mission->images as $image) {
            $image->delete(); 
        }
        
        $mission->delete();
        return response()->json(['message' => 'Mission supprimée']);
    }

    // ========== GESTION DES IMAGES (admin uniquement) ==========

    // Ajouter des images à une mission
    public function addImages(Request $request, $id)
    {
        $mission = Mission::findOrFail($id);
        
        $user = auth()->user();
        if ($user->role !== "admin") {
            return response()->json(['message' => 'Seuls les administrateurs peuvent faire l\'export des participants'], 403);
        }

        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $storedImages = $this->storeMissionImages($mission, $request->file('images'));

        return response()->json([
            'message' => 'Images ajoutées avec succès',
            'images' => $storedImages
        ], 201);
    }

   // Supprimer une image spécifique
    public function deleteImage($missionId, $imageId)
    {
        $mission = Mission::findOrFail($missionId);
        $image = Image::findOrFail($imageId);
        
        if ($image->mission_id !== $mission->id) {
            return response()->json(['message' => 'Image non trouvée'], 404);
        }
        
        if (!auth()->user()->isAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        
        if (Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }
        
        $image->delete();
        
        return response()->json(['message' => 'Image supprimée avec succès']);
    }

    // Méthode privée pour stocker les images
    private function storeMissionImages($mission, $images)
    {
        $currentMaxOrder = $mission->images()->max('order') ?? -1;
        $storedImages = [];

        foreach ($images as $index => $image) {
            $filename = Str::random(40) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('missions/' . $mission->id, $filename, 'public');
            
            $missionImage = Image::create([
                'mission_id' => $mission->id,
                'image_path' => $path,
                'image_name' => $image->getClientOriginalName(),
                'order' => $currentMaxOrder + $index + 1
            ]);

            $storedImages[] = $missionImage;
        }

        return $storedImages;
    }
}