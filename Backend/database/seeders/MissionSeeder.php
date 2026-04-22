<?php

namespace Database\Seeders;

use App\Models\Mission;
use Illuminate\Database\Seeder;

class MissionSeeder extends Seeder
{
    public function run(): void
    {
        // Créer 10 missions sans images
        Mission::factory()
            ->count(8)
            ->create();
        
        $this->command->info('8 missions créées sans images');
    }
}