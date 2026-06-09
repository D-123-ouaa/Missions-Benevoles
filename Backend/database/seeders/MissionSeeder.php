<?php
namespace Database\Seeders;

use App\Models\Mission;
use Illuminate\Database\Seeder;

class MissionSeeder extends Seeder
{
    public function run(): void
    {
        // 10 missions futures
        Mission::factory()->future()->count(10)->create();

        // 5 missions passées (pour tester les reviews)
        Mission::factory()->past()->count(5)->create();
    }
}