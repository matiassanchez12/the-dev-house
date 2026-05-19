<?php

namespace Database\Seeders;

use App\Models\Tech;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TechSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $techs = [
            ['name' => 'React', 'slug' => 'react', 'icon' => 'react.svg'],
            ['name' => 'Vue.js', 'slug' => 'vuejs', 'icon' => 'vue.svg'],
            ['name' => 'Angular', 'slug' => 'angular', 'icon' => 'angular.svg'],
            ['name' => 'Node.js', 'slug' => 'nodejs', 'icon' => 'nodejs.svg'],
            ['name' => 'Python', 'slug' => 'python', 'icon' => 'python.svg'],
            ['name' => 'Django', 'slug' => 'django', 'icon' => 'django.svg'],
            ['name' => 'FastAPI', 'slug' => 'fastapi', 'icon' => 'fastapi.svg'],
            ['name' => 'Laravel', 'slug' => 'laravel', 'icon' => 'laravel.svg'],
            ['name' => 'Symfony', 'slug' => 'symfony', 'icon' => 'symfony.svg'],
            ['name' => 'Express', 'slug' => 'express', 'icon' => 'express.svg'],
            ['name' => 'Next.js', 'slug' => 'nextjs', 'icon' => 'nextjs.svg'],
            ['name' => 'Nuxt', 'slug' => 'nuxt', 'icon' => 'nuxt.svg'],
            ['name' => 'TypeScript', 'slug' => 'typescript', 'icon' => 'typescript.svg'],
            ['name' => 'JavaScript', 'slug' => 'javascript', 'icon' => 'javascript.svg'],
            ['name' => 'PHP', 'slug' => 'php', 'icon' => 'php.svg'],
            ['name' => 'Go', 'slug' => 'go', 'icon' => 'go.svg'],
            ['name' => 'Rust', 'slug' => 'rust', 'icon' => 'rust.svg'],
            ['name' => 'Java', 'slug' => 'java', 'icon' => 'java.svg'],
            ['name' => 'Spring Boot', 'slug' => 'spring-boot', 'icon' => 'spring.svg'],
            ['name' => 'C#', 'slug' => 'csharp', 'icon' => 'csharp.svg'],
            ['name' => '.NET', 'slug' => 'dotnet', 'icon' => 'dotnet.svg'],
            ['name' => 'Flutter', 'slug' => 'flutter', 'icon' => 'flutter.svg'],
            ['name' => 'React Native', 'slug' => 'react-native', 'icon' => 'react-native.svg'],
            ['name' => 'iOS', 'slug' => 'ios', 'icon' => 'ios.svg'],
            ['name' => 'Android', 'slug' => 'android', 'icon' => 'android.svg'],
            ['name' => 'Docker', 'slug' => 'docker', 'icon' => 'docker.svg'],
            ['name' => 'Kubernetes', 'slug' => 'kubernetes', 'icon' => 'kubernetes.svg'],
            ['name' => 'AWS', 'slug' => 'aws', 'icon' => 'aws.svg'],
            ['name' => 'Azure', 'slug' => 'azure', 'icon' => 'azure.svg'],
            ['name' => 'GCP', 'slug' => 'gcp', 'icon' => 'gcp.svg'],
            ['name' => 'PostgreSQL', 'slug' => 'postgresql', 'icon' => 'postgresql.svg'],
            ['name' => 'MySQL', 'slug' => 'mysql', 'icon' => 'mysql.svg'],
            ['name' => 'MongoDB', 'slug' => 'mongodb', 'icon' => 'mongodb.svg'],
            ['name' => 'Redis', 'slug' => 'redis', 'icon' => 'redis.svg'],
            ['name' => 'GraphQL', 'slug' => 'graphql', 'icon' => 'graphql.svg'],
            ['name' => 'REST API', 'slug' => 'rest-api', 'icon' => 'rest.svg'],
            ['name' => 'Tailwind CSS', 'slug' => 'tailwind', 'icon' => 'tailwind.svg'],
            ['name' => 'Bootstrap', 'slug' => 'bootstrap', 'icon' => 'bootstrap.svg'],
            ['name' => 'Figma', 'slug' => 'figma', 'icon' => 'figma.svg'],
            ['name' => 'Git', 'slug' => 'git', 'icon' => 'git.svg'],
        ];

        foreach ($techs as $tech) {
            Tech::firstOrCreate(
                ['slug' => $tech['slug']],
                $tech
            );
        }
    }
}
