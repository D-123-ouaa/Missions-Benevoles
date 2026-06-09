<?php
namespace Database\Seeders;

use App\Models\Mission;
use App\Models\Registration;
use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        // Reviews uniquement sur les missions passées
        $pastMissions = Mission::where('date', '<', now())->get();

        foreach ($pastMissions as $mission) {
            // Récupérer les bénévoles inscrits à cette mission
            $registrations = Registration::where('mission_id', $mission->id)
                ->where('status', 'confirmed')
                ->get();

            foreach ($registrations as $reg) {
                // 70% de chance de laisser un avis
                if (fake()->boolean(70)) {
                    Review::firstOrCreate(
                        ['user_id' => $reg->user_id, 'mission_id' => $mission->id],
                        [
                            'rating' => fake()->numberBetween(1, 5),
                            'comment' => fake()->boolean(60)
                                ? fake()->randomElement([
                                    'Excellente expérience !',
                                    'Mission très bien organisée.',
                                    'Super ambiance, je reviendrai.',
                                    'Mission enrichissante.',
                                    'Bonne initiative, bravo !',
                                    'Organisation à améliorer mais mission utile.',
                                ])
                                : null,
                        ]
                    );
                }
            }
        }
    }
}