<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Super Admin fixe (pour tes tests)
        User::firstOrCreate(['email' => 'admin@test.com'], [
            'name' => 'Super Admin',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '0600000001',
            'is_active' => true,
        ]);

        // Manager fixe
        User::firstOrCreate(['email' => 'manager@test.com'], [
            'name' => 'Manager Test',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'phone' => '0600000002',
            'is_active' => true,
        ]);

        // Bénévole fixe
        User::firstOrCreate(['email' => 'benevole@test.com'], [
            'name' => 'Bénévole Test',
            'password' => Hash::make('password'),
            'role' => 'volunteer',
            'phone' => '0600000003',
            'is_active' => true,
        ]);

        // 15 bénévoles aléatoires
        User::factory()->volunteer()->count(15)->create();

        // 3 managers aléatoires
        User::factory()->manager()->count(3)->create();
    }
}