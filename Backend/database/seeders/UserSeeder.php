<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Admin Principal',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'phone' => '0612345678',
        ]);
        
        // Bénévoles
        User::create([
            'name' => 'Jean Dupont',
            'email' => 'jean@example.com',
            'password' => Hash::make('password'),
            'role' => 'volunteer',
            'phone' => '0698765432',
        ]);
        
        User::create([
            'name' => 'Marie Martin',
            'email' => 'marie@example.com',
            'password' => Hash::make('password'),
            'role' => 'volunteer',
            'phone' => '0678912345',
        ]);
    }
}
