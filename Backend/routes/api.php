<?php
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\MissionController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\RegistrationController;
use App\Http\Controllers\API\ReviewController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\ChatbotController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\AdminUserController;
use Illuminate\Support\Facades\Route;

// ─── PUBLIC ────────────────────────────────────────────
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);
Route::get('/login', fn() => response()->json(['message' => 'Non authentifié'], 401))->name('login');
Route::get('/auth/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed'])
    ->name('verification.verify');
Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification']);

Route::get('/missions',      [MissionController::class, 'index']);
Route::get('/missions/{id}', [MissionController::class, 'show']);
Route::get('/missions/{id}/reviews',         [ReviewController::class, 'index']);
Route::get('/missions/{id}/reviews/average', [ReviewController::class, 'average']);

// ─── AUTHENTIFIÉ ───────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'user']);
    Route::put('/auth/me',      [ProfileController::class, 'update']);
    Route::put('/auth/me/password', [ProfileController::class, 'updatePassword']);
    Route::post('/auth/me/avatar',  [ProfileController::class, 'updateAvatar']);
    Route::delete('/auth/me/avatar',[ProfileController::class, 'deleteAvatar']);

    // Profile (anciens endpoints conservés)
    Route::get('/profile',    [ProfileController::class, 'show']);
    Route::put('/profile',    [ProfileController::class, 'update']);
    Route::post('/profile/avatar',   [ProfileController::class, 'updateAvatar']);
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar']);
    Route::put('/profile/password',  [ProfileController::class, 'updatePassword']);
    Route::delete('/profile',        [ProfileController::class, 'destroy']);

    // Missions CRUD
    Route::post('/missions',       [MissionController::class, 'store']);
    Route::put('/missions/{id}',   [MissionController::class, 'update']);
    Route::delete('/missions/{id}',[MissionController::class, 'destroy']);

    // Images missions
    Route::get('/missions/{id}/images',                          [MissionController::class, 'getImages']);
    Route::post('/missions/{id}/images',                         [MissionController::class, 'addImages']);
    Route::delete('/missions/{missionId}/images/{imageId}',      [MissionController::class, 'deleteImage']);
    Route::put('/missions/{missionId}/images/{imageId}/main',    [MissionController::class, 'setMainImage']);
    Route::patch('/missions/{missionId}/images/reorder',         [MissionController::class, 'reorderImages']);

    // Inscriptions
    Route::post('/missions/{mission}/register',   [RegistrationController::class, 'register']);
    Route::delete('/missions/{mission}/unregister',[RegistrationController::class, 'unregister']);
    Route::get('/missions/{mission}/participants', [RegistrationController::class, 'participants']);
    Route::get('/my-registrations',               [RegistrationController::class, 'myRegistrations']);

    // Exports
    Route::get('/missions/{id}/export/csv', [RegistrationController::class, 'exportCsv']);
    Route::get('/missions/{id}/export/pdf', [RegistrationController::class, 'exportPdf']);

    // Reviews
    Route::post('/missions/{id}/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}',           [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}',        [ReviewController::class, 'destroy']);

    // Notifications
    Route::get('/notifications',                 [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count',    [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{id}/read',       [NotificationController::class, 'markRead']);
    Route::put('/notifications/read-all',        [NotificationController::class, 'markAllRead']);
    Route::delete('/notifications/{id}',         [NotificationController::class, 'destroy']);
    Route::post('/admin/notifications/broadcast',[NotificationController::class, 'broadcast']);

    // Chatbot
    Route::post('/chatbot/message',              [ChatbotController::class, 'message']);
    Route::get('/chatbot/conversations',         [ChatbotController::class, 'conversations']);
    Route::post('/chatbot/conversations', [ChatbotController::class, 'createConversation']);
    Route::delete('/chatbot/conversations/{id}', [ChatbotController::class, 'destroyConversation']);
    Route::get('/chatbot/commands',              [ChatbotController::class, 'commands']);
    Route::get('/chatbot/test-openai',              [ChatbotController::class, 'testOpenAI']);
    Route::get('/chatbot/debug',              [ChatbotController::class, 'debug']);

    // Dashboard
    Route::get('/admin/dashboard/stats',                  [DashboardController::class, 'stats']);
    Route::get('/admin/dashboard/missions-per-month',     [DashboardController::class, 'missionsPerMonth']);
    Route::get('/admin/dashboard/top-missions',           [DashboardController::class, 'topMissions']);
    Route::get('/admin/dashboard/registrations-timeline', [DashboardController::class, 'registrationsTimeline']);

    // Admin Users (Super Admin)
    Route::get('/admin/users',               [AdminUserController::class, 'index']);
    Route::get('/admin/users/{id}',          [AdminUserController::class, 'show']);
    Route::post('/admin/users',              [AdminUserController::class, 'store']);
    Route::put('/admin/users/{id}',          [AdminUserController::class, 'update']);
    Route::put('/admin/users/{id}/role',     [AdminUserController::class, 'updateRole']);
    Route::put('/admin/users/{id}/status',   [AdminUserController::class, 'updateStatus']);
    Route::delete('/admin/users/{id}',       [AdminUserController::class, 'destroy']);
    Route::put('/admin/users/{id}/password', [AdminUserController::class, 'updatePassword']);

    // Inscriptions admin
    Route::get('/users/{userId}/registrations',           [RegistrationController::class, 'userRegistrations']);
    Route::delete('/admin/registrations/{registrationId}',[RegistrationController::class, 'forceDelete']);
    Route::delete('/admin/reviews/{id}',                  [ReviewController::class, 'adminDestroy']);
});