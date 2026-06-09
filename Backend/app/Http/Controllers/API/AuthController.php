<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeMail;
use App\Models\User;
use App\Notifications\CustomVerifyEmail;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    // Inscription
    public function register(Request $request)
    {
        $request->validate([
            'name'                  => 'required|string|max:255',
            'email'                 => 'required|string|email|max:255|unique:users',
            'password'              => 'required|string|min:8|confirmed',
            'phone'                 => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'volunteer',
            'phone'    => $request->phone,
        ]);

        // Envoyer email de vérification personnalisé
        $user->notify(new CustomVerifyEmail());

        return response()->json([
            'message' => 'Inscription réussie. Vérifiez votre email pour activer votre compte.',
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
            ]
        ], 201);
    }

    // Connexion
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email ou mot de passe incorrect'], 401);
        }

        // Vérifier si l'email est vérifié
        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Veuillez vérifier votre email avant de vous connecter.',
                'email_verified' => false,
            ], 403);
        }

        // Vérifier si le compte est actif
        if (!$user->is_active) {
            return response()->json(['message' => 'Votre compte a été désactivé.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'role'       => $user->role,
                'avatar'     => $user->avatar,
                'avatar_url' => $user->avatar_url,
                'created_at' => $user->created_at,
            ],
            'token'   => $token,
            'message' => 'Connexion réussie'
        ]);
    }

    // Déconnexion
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie']);
    }

    // Récupérer l'utilisateur connecté
    public function user(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id'             => $user->id,
            'name'           => $user->name,
            'email'          => $user->email,
            'phone'          => $user->phone,
            'role'           => $user->role,
            'avatar'         => $user->avatar,
            'avatar_url'     => $user->avatar_url,
            'email_verified' => $user->hasVerifiedEmail(),
            'created_at'     => $user->created_at,
        ]);
    }

    // Vérification email
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Lien de vérification invalide'], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié']);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
            // Envoyer email de bienvenue après vérification
            Mail::to($user->email)->send(new WelcomeMail($user));
        }

        return response()->json(['message' => 'Email vérifié avec succès !']);
    }

    // Renvoyer l'email de vérification
    public function resendVerification(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable'], 404);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié']);
        }

        $user->notify(new CustomVerifyEmail());

        return response()->json(['message' => 'Email de vérification renvoyé']);
    }
}