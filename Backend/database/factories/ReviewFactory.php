<?php
namespace Database\Factories;

use App\Models\Mission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    public function definition(): array
    {
        $comments = [
            'Excellente expérience, très bien organisée !',
            'Mission enrichissante, je recommande vivement.',
            'Bonne ambiance, équipe sympa.',
            'Organisation perfectible mais mission utile.',
            'Très satisfait de ma participation.',
            'Superbe initiative, bravo aux organisateurs !',
            'Mission bien préparée et encadrée.',
            null, null // quelques sans commentaire
        ];

        return [
            'user_id' => User::factory(),
            'mission_id' => Mission::factory(),
            'rating' => fake()->numberBetween(1, 5),
            'comment' => fake()->randomElement($comments),
        ];
    }
}