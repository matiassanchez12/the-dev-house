<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('techs', function (Blueprint $table): void {
            $table->string('category')->default('languages')->after('icon')->index();
        });

        $categoryMap = [
            'frontend' => [
                'angular',
                'astro',
                'bootstrap',
                'nextjs',
                'nuxt',
                'react',
                'svelte',
                'sveltekit',
                'tailwind',
                'vuejs',
            ],
            'backend' => [
                'django',
                'dotnet',
                'express',
                'fastapi',
                'firebase',
                'laravel',
                'nodejs',
                'ruby-on-rails',
                'spring-boot',
                'supabase',
                'symfony',
            ],
            'mobile' => [
                'android',
                'flutter',
                'ios',
                'react-native',
            ],
            'data' => [
                'mongodb',
                'mysql',
                'postgresql',
                'prisma',
                'redis',
            ],
            'devops-cloud' => [
                'aws',
                'azure',
                'docker',
                'gcp',
                'kubernetes',
                'terraform',
            ],
            'api-integration' => [
                'graphql',
                'rest-api',
            ],
            'design-tooling' => [
                'figma',
                'git',
            ],
            'languages' => [
                'c',
                'cpp',
                'csharp',
                'go',
                'java',
                'javascript',
                'kotlin',
                'php',
                'python',
                'ruby',
                'rust',
                'swift',
                'typescript',
            ],
        ];

        foreach ($categoryMap as $category => $slugs) {
            DB::table('techs')
                ->whereIn('slug', $slugs)
                ->update(['category' => $category]);
        }
    }

    public function down(): void
    {
        Schema::table('techs', function (Blueprint $table): void {
            $table->dropIndex(['category']);
            $table->dropColumn('category');
        });
    }
};
