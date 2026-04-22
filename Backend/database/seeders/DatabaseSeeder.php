<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,      // Vos utilisateurs existants
            MissionSeeder::class,   // Vos nouvelles missions
        ]);
    }
}