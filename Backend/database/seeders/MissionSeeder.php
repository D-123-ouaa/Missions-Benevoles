<?php

namespace Database\Seeders;

use App\Models\Mission;
use Illuminate\Database\Seeder;

class MissionSeeder extends Seeder
{
    public function run()
    {
        // Mission 1
        $mission1 = Mission::create([
            'title' => 'Distribution alimentaire',
            'description' => 'Mission citoyenne pour aider les plus démunis. Nulla cumque asperiores ea fugiat sit natus adipisci. Quaerat dolorum quod id est est qui facere. Numquam occaecati sint eum nostrum.',
            'date' => '2026-03-10',
            'location' => 'Mairie du 3ème arrondissement',
            'available_places' => 10,
        ]);
        $this->linkExistingImages($mission1->id);

        // Mission 2
        $mission2 = Mission::create([
            'title' => 'Jardinage collectif',
            'description' => 'Partagez vos connaissances et aidez les enfants en difficulté scolaire. Minima consequatur odio sit ipsam. Tenetur qui eos labore dolorem. Deserunt dolor et rerum et voluptas qui harum officia.',
            'date' => '2026-06-20',
            'location' => 'Place de la République',
            'available_places' => 8,
        ]);
        $this->linkExistingImages($mission2->id);

        // Mission 3
        $mission3 = Mission::create([
            'title' => 'Collecte de déchets',
            'description' => 'Grande marche solidaire pour soutenir une cause importante. Ipsam nemo assumenda doloribus necessitatibus qui sapiente praesentium. At rerum rerum quisquam est aliquid rerum soluta.',
            'date' => '2026-06-20',
            'location' => 'Place de la République',
            'available_places' => 20,
        ]);
        $this->linkExistingImages($mission3->id);

        // Mission 4
        $mission4 = Mission::create([
            'title' => 'Aide aux devoirs',
            'description' => 'Ensemble, rendons notre ville plus propre et agréable à vivre. Soluta labore sit sint et. Neque esse placeat consequatur ullam odit et et.',
            'date' => '2026-04-25',
            'location' => 'Centre social Saint-Martin',
            'available_places' => 1,
        ]);
        $this->linkExistingImages($mission4->id);

        // Mission 5
        $mission5 = Mission::create([
            'title' => 'Nettoyage de la Plage',
            'description' => 'Ensemble, rendons notre ville plus propre et agréable à vivre. Soluta labore sit sint et. Neque esse placeat consequatur ullam odit et et.',
            'date' => '2026-04-25',
            'location' => 'Centre social Saint-Martin',
            'available_places' => 15,
        ]);
        $this->linkExistingImages($mission5->id);

        // Mission 6
        $mission6 = Mission::create([
            'title' => 'Don Du Sang',
            'description' => 'Ensemble, rendons notre ville plus propre et agréable à vivre. Soluta labore sit sint et. Neque esse placeat consequatur ullam odit et et.',
            'date' => '2026-04-25',
            'location' => 'Centre social Saint-Martin',
            'available_places' => 40,
        ]);
        $this->linkExistingImages($mission6->id);

        // Mission 7
        $mission7 = Mission::create([
            'title' => 'Secours en montagne',
            'description' => 'Ensemble, rendons notre ville plus propre et agréable à vivre. Soluta labore sit sint et. Neque esse placeat consequatur ullam odit et et.',
            'date' => '2026-04-25',
            'location' => 'Centre social Saint-Martin',
            'available_places' => 1,
        ]);
        $this->linkExistingImages($mission7->id);

        // Mission 8
        $mission8 = Mission::create([
            'title' => 'Visite aux personnes âgées',
            'description' => 'Ensemble, rendons notre ville plus propre et agréable à vivre. Soluta labore sit sint et. Neque esse placeat consequatur ullam odit et et.',
            'date' => '2026-04-25',
            'location' => 'Centre social Saint-Martin',
            'available_places' => 5,
        ]);
        $this->linkExistingImages($mission8->id);
    }

    private function linkExistingImages($missionId)
    {
        $imageFolder = storage_path("app/public/missions/{$missionId}");
        
        if (!is_dir($imageFolder)) {
            return;
        }

        $files = scandir($imageFolder);
        $order = 1;

        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }

            Image::updateOrCreate(
                [
                    'mission_id' => $missionId,
                    'image_path' => "missions/{$missionId}/{$file}",
                ],
                [
                    'image_name' => $file,
                    'order' => $order++,
                ]
            );
        }
    }
}