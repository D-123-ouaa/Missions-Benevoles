<?php
namespace Database\Seeders;

use App\Models\Mission;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Database\Seeder;

class RegistrationSeeder extends Seeder
{
    public function run(): void
    {
        $volunteers = User::where('role', 'volunteer')->get();
        $missions = Mission::all();

        foreach ($missions as $mission) {
            // Inscrire entre 2 et 8 bénévoles aléatoires par mission
            $selected = $volunteers->random(min(fake()->numberBetween(2, 8), $volunteers->count()));

            foreach ($selected as $volunteer) {
                Registration::firstOrCreate(
                    ['user_id' => $volunteer->id, 'mission_id' => $mission->id],
                    [
                        'status' => 'confirmed',
                        'registered_at' => now()->subDays(fake()->numberBetween(1, 30)),
                    ]
                );
            }
        }
    }
}