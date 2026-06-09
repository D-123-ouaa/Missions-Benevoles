<?php
use Illuminate\Support\Facades\Schedule;
use App\Models\Notification;
use App\Models\ChatbotConversation;
use App\Models\Mission;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

// Rappels J-2 (chaque jour à 8h)
Schedule::call(function () {
    $targetDate = now()->addDays(2)->toDateString();
    $missions = Mission::whereDate('date', $targetDate)->with('volunteers')->get();

    foreach ($missions as $mission) {
        $volunteers = $mission->volunteers()->wherePivot('status', 'confirmed')->get();
        foreach ($volunteers as $volunteer) {
            // Email rappel
            \Illuminate\Support\Facades\Mail::to($volunteer->email)
                ->send(new \App\Mail\MissionReminderMail($volunteer, $mission));

            // Notification in-app
            \App\Models\Notification::create([
                'user_id' => $volunteer->id,
                'title' => 'Rappel mission dans 2 jours',
                'message' => "N'oubliez pas votre mission \"{$mission->title}\" le {$mission->date->format('d/m/Y')} à {$mission->location}.",
                'type' => 'reminder',
            ]);
        }
    }
})->dailyAt('08:00')->name('send-reminders');

// Nettoyage notifications lues de +30 jours (chaque jour à 3h)
Schedule::call(function () {
    Notification::where('is_read', true)
        ->where('updated_at', '<', now()->subDays(30))
        ->delete();
})->dailyAt('03:00')->name('clean-old-notifications');

// Suppression conversations chatbot inactives depuis 60 jours (chaque jour à 3h30)
Schedule::call(function () {
    ChatbotConversation::where('updated_at', '<', now()->subDays(60))->delete();
})->dailyAt('03:30')->name('clean-old-conversations');

// Nettoyage images orphelines (hebdomadaire)
Schedule::call(function () {
    \Illuminate\Support\Facades\Storage::disk('public')->deleteDirectory('missions/orphan');
})->weekly()->name('clean-orphan-images');