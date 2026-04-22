<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    // Afficher le profil de l'utilisateur connecté
    public function show(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'avatar' => $user->avatar,
            'avatar_url' => $user->avatar_url,  
            'created_at' => $user->created_at,
        ]);
    }

    // Modifier les informations de l'utilisateur connecté
    public function update(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'phone' => 'sometimes|string|max:20', 
        ]);

        $user->update($request->only(['name', 'email', 'phone']));

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url,
            ]
        ]);
    }

    // Modifier l'avatar de l'utilisateur connecté
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $user = $request->user();

        // Supprimer l'ancien avatar
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Stocker le nouvel avatar
        $file = $request->file('avatar');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('avatars', $filename, 'public');

        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Avatar mis à jour avec succès',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url, 
            ]
        ]);
    }

    // Supprimer l'avatar de l'utilisateur connecté
    public function deleteAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
            $user->update(['avatar' => null]);
        }

        return response()->json([
            'message' => 'Avatar supprimé avec succès',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => null,
                'avatar_url' => $user->avatar_url, 
            ]
        ]);
    }

    // Modifier le mot de passe de l'utilisateur connecté
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'message' => 'Mot de passe modifié avec succès'
        ]);
    }

    // Supprimer le compte de l'utilisateur connecté
    public function destroy(Request $request)
    {
        $user = $request->user();
        
        // Supprimer l'avatar s'il existe
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }
        
        // Supprimer les tokens
        $user->tokens()->delete();
        
        // Supprimer l'utilisateur
        $user->delete();

        return response()->json([
            'message' => 'Compte supprimé avec succès'
        ]);
    }
}