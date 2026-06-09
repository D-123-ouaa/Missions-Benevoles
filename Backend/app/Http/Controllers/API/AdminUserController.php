<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends Controller {

    private function checkSuperAdmin() {
        if (!auth()->user()->isAdmin()) {
            abort(response()->json(['message' => 'Réservé au Super Admin'], 403));
        }
    }

    public function index() {
        $this->checkSuperAdmin();
        return response()->json(User::orderBy('created_at', 'desc')->get());
    }

    public function show($id) {
        $this->checkSuperAdmin();
        return response()->json(User::findOrFail($id));
    }

    public function store(Request $request) {
        $this->checkSuperAdmin();
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,manager,volunteer',
            'phone' => 'nullable|string|max:20',
        ]);
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
        ]);
        return response()->json(['message' => 'Utilisateur créé', 'user' => $user], 201);
    }

    public function update(Request $request, $id) {
        $this->checkSuperAdmin();
        $user = User::findOrFail($id);
        $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
        ]);
        $user->update($request->only(['name', 'email', 'phone']));
        return response()->json(['message' => 'Utilisateur mis à jour', 'user' => $user]);
    }

    public function updateRole(Request $request, $id) {
        $this->checkSuperAdmin();
        $request->validate(['role' => 'required|in:admin,manager,volunteer']);
        $user = User::findOrFail($id);
        $user->update(['role' => $request->role]);
        return response()->json(['message' => 'Rôle mis à jour']);
    }

    public function updateStatus(Request $request, $id) {
        $this->checkSuperAdmin();
        $request->validate(['is_active' => 'required|boolean']);
        \Log::info('updateStatus called', [
            'id' => $id,
            'is_active' => $request->is_active,
            'user' => auth()->user()->email
        ]);
        $user = User::findOrFail($id);
        $user->is_active = $request->is_active;
        $user->save();
        return response()->json([
            'message' => 'Statut mis à jour',
            'user_id' => $user->id,
            'is_active' => $user->is_active
        ]);
    }

    public function updatePassword(Request $request, $id)
    {
        $this->checkSuperAdmin();
        
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);
        
        $user = User::findOrFail($id);
        $user->password = Hash::make($request->password);
        $user->save();
        
        return response()->json(['message' => 'Mot de passe mis à jour']);
    }

    public function destroy($id) {
        $this->checkSuperAdmin();
        if (auth()->id() == $id) {
            return response()->json(['message' => 'Vous ne pouvez pas vous supprimer vous-même'], 400);
        }
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}