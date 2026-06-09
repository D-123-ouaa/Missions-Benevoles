<?php
namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            // 3 à 6 notifications par user
            $count = fake()->numberBetween(3, 6);
            for ($i = 0; $i < $count; $i++) {
                Notification::factory()->create(['user_id' => $user->id]);
            }
        }
    }
}