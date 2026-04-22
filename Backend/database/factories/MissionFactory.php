<?php

namespace Database\Factories;

use App\Models\Mission;
use Illuminate\Database\Eloquent\Factories\Factory;

class MissionFactory extends Factory
{
    protected $model = Mission::class;

    public function definition(): array
    {
        // Liste de titres réalistes
        $titles = [
            'Nettoyage de la plage',
            'Distribution alimentaire',
            'Aide aux devoirs',
            'Visite aux personnes âgées',
            'Collecte de déchets',
            'Atelier de sensibilisation',
            'Don du sang',
            'Jardinage collectif',
            'Secours en montagne'
        ];

        // Liste de lieux
        $locations = [
            'Plage du Prado, Marseille',
            'Centre ville, Lyon',
            'Parc Montsouris, Paris',
            'Vieux port, La Rochelle',
            'Centre social, Lille',
            'Mairie de quartier, Toulouse',
            'Espace culturel, Bordeaux',
            'Gare Saint-Jean, Bordeaux'
        ];

        // Descriptions variées
        $descriptions = [
            'Rejoignez-nous pour une journée de nettoyage et de préservation de notre environnement.',
            'Mission citoyenne pour aider les plus démunis.',
            'Partagez vos connaissances et aidez les enfants en difficulté scolaire.',
            'Apportez du réconfort et de la joie aux personnes isolées.',
            'Ensemble, rendons notre ville plus propre et agréable à vivre.',
            'Sensibilisation à l\'environnement et aux gestes éco-citoyens.',
            'Grande marche solidaire pour soutenir une cause importante.',
            'Venez donner votre sang et sauver des vies.'
        ];

        return [
            'title' => $this->faker->randomElement($titles) . ' - ' . $this->faker->city(),
            'description' => $this->faker->randomElement($descriptions) . ' ' . $this->faker->paragraph(2),
            'date' => $this->faker->dateTimeBetween('now', '+6 months'),
            'location' => $this->faker->randomElement($locations),
            'available_places' => $this->faker->numberBetween(5, 50),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}