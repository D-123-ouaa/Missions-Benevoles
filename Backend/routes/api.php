<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\MissionController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\RegistrationController;
use Illuminate\Support\Facades\Route;

// Routes publiques (sans authentification)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/login', function() {
    return response()->json(['message' => 'Non authentifié'], 401);
})->name('login');

// Routes Missions publiques Read
Route::get('/missions', [MissionController::class, 'index']);
Route::get('/missions/{id}', [MissionController::class, 'show']);


// Routes protégées (avec authentification)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);
    
    // Routes Missions CUD
    Route::post('/missions', [MissionController::class, 'store']);
    Route::put('/missions/{id}', [MissionController::class, 'update']);
    Route::delete('/missions/{id}', [MissionController::class, 'destroy']);
    
    // Gestion des images des missions
    Route::post('/missions/{id}/images', [MissionController::class, 'addImages']);
    Route::delete('/missions/{missionId}/images/{imageId}', [MissionController::class, 'deleteImage']);
    
    // Routes Inscriptions
    Route::post('/missions/{mission}/register', [RegistrationController::class, 'register']);
    Route::delete('/missions/{mission}/unregister', [RegistrationController::class, 'unregister']);
    Route::get('/missions/{mission}/participants', [RegistrationController::class, 'participants']);
    Route::get('/missions/{mission}/export', [RegistrationController::class, 'export']);
    
    // Mes inscriptions
    Route::get('/my-registrations', [RegistrationController::class, 'myRegistrations']);
});