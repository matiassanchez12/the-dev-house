<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\TechSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class TechCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_tech_seeder_populates_the_curated_catalog_with_categories(): void
    {
        $this->seed(TechSeeder::class);

        $this->assertDatabaseHas('techs', [
            'name' => 'C++',
            'slug' => 'cpp',
            'category' => 'languages',
        ]);

        $this->assertDatabaseHas('techs', [
            'name' => 'Ruby on Rails',
            'slug' => 'ruby-on-rails',
            'category' => 'backend',
        ]);

        $this->assertDatabaseHas('techs', [
            'name' => 'SvelteKit',
            'slug' => 'sveltekit',
            'category' => 'frontend',
        ]);

        $this->assertDatabaseHas('techs', [
            'name' => 'Terraform',
            'slug' => 'terraform',
            'category' => 'devops-cloud',
        ]);

        $this->assertDatabaseHas('techs', [
            'name' => 'Supabase',
            'slug' => 'supabase',
            'category' => 'backend',
        ]);
    }

    public function test_shared_tech_catalog_exposes_categories_to_project_creation(): void
    {
        $this->seed(TechSeeder::class);

        $response = $this->actingAs(User::factory()->create())->get('/projects/create');

        $response->assertOk();

        $techs = collect($response->viewData('page')['props']['techs']);

        $this->assertTrue($techs->contains(fn (array $tech): bool => $tech['slug'] === 'react' && $tech['category'] === 'frontend'));
        $this->assertTrue($techs->contains(fn (array $tech): bool => $tech['slug'] === 'cpp' && $tech['category'] === 'languages'));
        $this->assertTrue($techs->contains(fn (array $tech): bool => $tech['slug'] === 'prisma' && $tech['category'] === 'data'));
    }

    public function test_category_migration_backfills_existing_and_custom_tech_rows(): void
    {
        Schema::table('techs', function ($table): void {
            $table->dropIndex(['category']);
            $table->dropColumn('category');
        });

        $timestamp = now();

        DB::table('techs')->insert([
            [
                'name' => 'React',
                'slug' => 'react',
                'icon' => 'react.svg',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            [
                'name' => 'Elixir',
                'slug' => 'elixir',
                'icon' => 'elixir.svg',
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
        ]);

        $migrationPath = glob(database_path('migrations/*_add_category_to_techs_table.php'))[0] ?? null;

        self::assertNotNull($migrationPath);

        $migration = require $migrationPath;
        $migration->up();

        $this->assertDatabaseHas('techs', [
            'name' => 'React',
            'slug' => 'react',
            'category' => 'frontend',
        ]);

        $this->assertDatabaseHas('techs', [
            'name' => 'Elixir',
            'slug' => 'elixir',
            'category' => 'languages',
        ]);
    }
}
