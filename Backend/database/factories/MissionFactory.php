<?php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class MissionFactory extends Factory
{
    public function definition(): array
    {
        $locations = [
            'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger',
            'Agadir', 'Meknès', 'Oujda', 'Kenitra', 'Tétouan'
        ];

        $titles = [
            'Distribution alimentaire', 'Nettoyage de plage', 'Aide aux devoirs',
            'Collecte de vêtements', 'Animation maison de retraite', 'Plantation d\'arbres',
            'Sensibilisation environnement', 'Aide aux réfugiés', 'Soutien scolaire',
            'Organisation événement caritatif', 'Visite hôpital pédiatrique',
            'Collecte de jouets', 'Maraude nocturne', 'Formation premiers secours'
        ];

        $isFuture = fake()->boolean(70); // 70% missions futures

        return [
            'title' => fake()->randomElement($titles) . ' - ' . fake()->city(),
            'description' => fake()->paragraphs(2, true),
            'date' => $isFuture
                ? fake()->dateTimeBetween('now', '+6 months')->format('Y-m-d')
                : fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
            'location' => fake()->randomElement($locations),
            'available_places' => fake()->numberBetween(5, 50),
        ];
    }

    public function future(): static
    {
        return $this->state([
            'date' => fake()->dateTimeBetween('now', '+6 months')->format('Y-m-d'),
        ]);
    }

    public function past(): static
    {
        return $this->state([
            'date' => fake()->dateTimeBetween('-3 months', '-1 day')->format('Y-m-d'),
        ]);
    }
}