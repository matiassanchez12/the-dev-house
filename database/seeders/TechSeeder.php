<?php

namespace Database\Seeders;

use App\Models\Tech;
use Illuminate\Database\Seeder;

class TechSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $timestamp = now();

        $techs = [
            ['name' => 'React', 'slug' => 'react', 'icon' => 'react.svg', 'category' => 'frontend'],
            ['name' => 'Vue.js', 'slug' => 'vuejs', 'icon' => 'vue.svg', 'category' => 'frontend'],
            ['name' => 'Angular', 'slug' => 'angular', 'icon' => 'angular.svg', 'category' => 'frontend'],
            ['name' => 'Next.js', 'slug' => 'nextjs', 'icon' => 'nextjs.svg', 'category' => 'frontend'],
            ['name' => 'Nuxt', 'slug' => 'nuxt', 'icon' => 'nuxt.svg', 'category' => 'frontend'],
            ['name' => 'Svelte', 'slug' => 'svelte', 'icon' => 'svelte.svg', 'category' => 'frontend'],
            ['name' => 'SvelteKit', 'slug' => 'sveltekit', 'icon' => 'sveltekit.svg', 'category' => 'frontend'],
            ['name' => 'Astro', 'slug' => 'astro', 'icon' => 'astro.svg', 'category' => 'frontend'],
            ['name' => 'Tailwind CSS', 'slug' => 'tailwind', 'icon' => 'tailwind.svg', 'category' => 'frontend'],
            ['name' => 'Bootstrap', 'slug' => 'bootstrap', 'icon' => 'bootstrap.svg', 'category' => 'frontend'],
            ['name' => 'Node.js', 'slug' => 'nodejs', 'icon' => 'nodejs.svg', 'category' => 'backend'],
            ['name' => 'Django', 'slug' => 'django', 'icon' => 'django.svg', 'category' => 'backend'],
            ['name' => 'FastAPI', 'slug' => 'fastapi', 'icon' => 'fastapi.svg', 'category' => 'backend'],
            ['name' => 'Laravel', 'slug' => 'laravel', 'icon' => 'laravel.svg', 'category' => 'backend'],
            ['name' => 'Symfony', 'slug' => 'symfony', 'icon' => 'symfony.svg', 'category' => 'backend'],
            ['name' => 'Express', 'slug' => 'express', 'icon' => 'express.svg', 'category' => 'backend'],
            ['name' => 'Ruby on Rails', 'slug' => 'ruby-on-rails', 'icon' => 'rubyonrails.svg', 'category' => 'backend'],
            ['name' => 'Spring Boot', 'slug' => 'spring-boot', 'icon' => 'spring.svg', 'category' => 'backend'],
            ['name' => '.NET', 'slug' => 'dotnet', 'icon' => 'dotnet.svg', 'category' => 'backend'],
            ['name' => 'Firebase', 'slug' => 'firebase', 'icon' => 'firebase.svg', 'category' => 'backend'],
            ['name' => 'Supabase', 'slug' => 'supabase', 'icon' => 'supabase.svg', 'category' => 'backend'],
            ['name' => 'TypeScript', 'slug' => 'typescript', 'icon' => 'typescript.svg', 'category' => 'languages'],
            ['name' => 'JavaScript', 'slug' => 'javascript', 'icon' => 'javascript.svg', 'category' => 'languages'],
            ['name' => 'PHP', 'slug' => 'php', 'icon' => 'php.svg', 'category' => 'languages'],
            ['name' => 'Python', 'slug' => 'python', 'icon' => 'python.svg', 'category' => 'languages'],
            ['name' => 'Go', 'slug' => 'go', 'icon' => 'go.svg', 'category' => 'languages'],
            ['name' => 'Rust', 'slug' => 'rust', 'icon' => 'rust.svg', 'category' => 'languages'],
            ['name' => 'Java', 'slug' => 'java', 'icon' => 'java.svg', 'category' => 'languages'],
            ['name' => 'C#', 'slug' => 'csharp', 'icon' => 'csharp.svg', 'category' => 'languages'],
            ['name' => 'C', 'slug' => 'c', 'icon' => 'c.svg', 'category' => 'languages'],
            ['name' => 'C++', 'slug' => 'cpp', 'icon' => 'cplusplus.svg', 'category' => 'languages'],
            ['name' => 'Ruby', 'slug' => 'ruby', 'icon' => 'ruby.svg', 'category' => 'languages'],
            ['name' => 'Kotlin', 'slug' => 'kotlin', 'icon' => 'kotlin.svg', 'category' => 'languages'],
            ['name' => 'Swift', 'slug' => 'swift', 'icon' => 'swift.svg', 'category' => 'languages'],
            ['name' => 'Flutter', 'slug' => 'flutter', 'icon' => 'flutter.svg', 'category' => 'mobile'],
            ['name' => 'React Native', 'slug' => 'react-native', 'icon' => 'react-native.svg', 'category' => 'mobile'],
            ['name' => 'iOS', 'slug' => 'ios', 'icon' => 'ios.svg', 'category' => 'mobile'],
            ['name' => 'Android', 'slug' => 'android', 'icon' => 'android.svg', 'category' => 'mobile'],
            ['name' => 'PostgreSQL', 'slug' => 'postgresql', 'icon' => 'postgresql.svg', 'category' => 'data'],
            ['name' => 'MySQL', 'slug' => 'mysql', 'icon' => 'mysql.svg', 'category' => 'data'],
            ['name' => 'MongoDB', 'slug' => 'mongodb', 'icon' => 'mongodb.svg', 'category' => 'data'],
            ['name' => 'Redis', 'slug' => 'redis', 'icon' => 'redis.svg', 'category' => 'data'],
            ['name' => 'Prisma', 'slug' => 'prisma', 'icon' => 'prisma.svg', 'category' => 'data'],
            ['name' => 'Docker', 'slug' => 'docker', 'icon' => 'docker.svg', 'category' => 'devops-cloud'],
            ['name' => 'Kubernetes', 'slug' => 'kubernetes', 'icon' => 'kubernetes.svg', 'category' => 'devops-cloud'],
            ['name' => 'AWS', 'slug' => 'aws', 'icon' => 'aws.svg', 'category' => 'devops-cloud'],
            ['name' => 'Azure', 'slug' => 'azure', 'icon' => 'azure.svg', 'category' => 'devops-cloud'],
            ['name' => 'GCP', 'slug' => 'gcp', 'icon' => 'gcp.svg', 'category' => 'devops-cloud'],
            ['name' => 'Terraform', 'slug' => 'terraform', 'icon' => 'terraform.svg', 'category' => 'devops-cloud'],
            ['name' => 'GraphQL', 'slug' => 'graphql', 'icon' => 'graphql.svg', 'category' => 'api-integration'],
            ['name' => 'REST API', 'slug' => 'rest-api', 'icon' => 'rest.svg', 'category' => 'api-integration'],
            ['name' => 'Figma', 'slug' => 'figma', 'icon' => 'figma.svg', 'category' => 'design-tooling'],
            ['name' => 'Git', 'slug' => 'git', 'icon' => 'git.svg', 'category' => 'design-tooling'],
        ];

        Tech::query()->upsert(
            array_map(
                fn (array $tech): array => [
                    ...$tech,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ],
                $techs,
            ),
            ['slug'],
            ['name', 'icon', 'category', 'updated_at'],
        );
    }
}
