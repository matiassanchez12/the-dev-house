<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'bio' => 'Cuenta de prueba para desarrollo.',
            'onboarding_completed_at' => now(),
        ]);

        User::factory()->count(2)->create([
            'bio' => fake()->text(200),
            'onboarding_completed_at' => now(),
        ]);
    }
}
