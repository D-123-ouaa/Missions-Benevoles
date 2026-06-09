<?php
namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    protected $model = \App\Models\Notification::class;

    public function definition(): array
    {
        $types = [
            'registration' => [
                'title' => 'Inscription confirmée',
                'message' => 'Votre inscription à la mission a été confirmée.'
            ],
            'reminder' => [
                'title' => 'Rappel mission dans 2 jours',
                'message' => 'N\'oubliez pas votre mission qui approche !'
            ],
            'cancellation' => [
                'title' => 'Mission annulée',
                'message' => 'La mission à laquelle vous étiez inscrit a été annulée.'
            ],
            'info' => [
                'title' => 'Information importante',
                'message' => 'Une mise à jour concerne votre mission.'
            ],
        ];

        $type = fake()->randomElement(array_keys($types));

        return [
            'user_id' => User::factory(),
            'title' => $types[$type]['title'],
            'message' => $types[$type]['message'],
            'type' => $type,
            'is_read' => fake()->boolean(30),
        ];
    }
}