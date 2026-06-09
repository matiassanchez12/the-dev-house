<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'matias.sanchez.0097@gmail.com'],
            [
                'name' => 'Matias Sanchez',
                'slug' => 'matias-sanchez',
                'password' => Hash::make('12312312'),
                'bio' => 'Dueño de The Dev House.',
                'onboarding_completed_at' => now(),
            ]
        );

        User::create([
            'name' => 'Test User',
            'slug' => 'test-user',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'bio' => 'Cuenta de prueba para desarrollo.',
            'onboarding_completed_at' => now(),
        ]);

        User::create([
            'name' => 'Jane Doe',
            'slug' => 'jane-doe',
            'email' => 'jane@example.com',
            'password' => Hash::make('password'),
            'bio' => 'Desarrolladora full-stack apasionada por el código limpio.',
            'onboarding_completed_at' => now(),
        ]);

        User::create([
            'name' => 'John Smith',
            'slug' => 'john-smith',
            'email' => 'john@example.com',
            'password' => Hash::make('password'),
            'bio' => 'Especialista en backend con experiencia en sistemas distribuidos.',
            'onboarding_completed_at' => now(),
        ]);
    }
}
