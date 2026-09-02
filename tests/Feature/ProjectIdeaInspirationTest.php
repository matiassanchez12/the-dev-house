<?php

namespace Tests\Feature;

use App\Enums\ProjectIdeaCategory;
use App\Models\ProjectIdea;
use App\Models\Tech;
use App\Models\User;
use Database\Seeders\ProjectIdeaSeeder;
use Database\Seeders\TechSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class ProjectIdeaInspirationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // The seeder now writes illustration assets through the media disk;
        // fake it so no test touches real storage/app/public.
        Storage::fake('public');
        config(['filesystems.media_disk' => 'public']);
    }

    private function fakeIllustrationSource(string $slug): void
    {
        $path = database_path("seeders/assets/project-ideas/{$slug}.webp");

        if (! is_dir(dirname($path))) {
            mkdir(dirname($path), 0777, true);
        }

        file_put_contents($path, 'fake-webp-bytes');
    }

    private function removeIllustrationSource(string $slug): void
    {
        $path = database_path("seeders/assets/project-ideas/{$slug}.webp");

        if (is_file($path)) {
            unlink($path);
        }
    }

    protected function tearDown(): void
    {
        // Strip any illustration source a test wrote; the repo ships zero .webp here.
        $dir = database_path('seeders/assets/project-ideas');

        if (is_dir($dir)) {
            foreach (glob($dir.'/*.webp') ?: [] as $file) {
                @unlink($file);
            }
        }

        parent::tearDown();
    }

    private function openCreatePage(): TestResponse
    {
        return $this->actingAs(User::factory()->create())->get('/projects/create');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function ideasPayload(TestResponse $response): array
    {
        return $response->viewData('page')['props']['projectIdeas'];
    }

    public function test_create_page_receives_only_published_ideas(): void
    {
        ProjectIdea::factory()->count(2)->create(['is_published' => true]);
        ProjectIdea::factory()->create(['is_published' => false]);

        $response = $this->openCreatePage();

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
                ->component('projects/create')
                ->has('projectIdeas', 2)
        );
    }

    public function test_ideas_are_ordered_by_category_enum_order_then_sort_order(): void
    {
        ProjectIdea::factory()->create([
            'slug' => 'aprendizaje-2',
            'category' => ProjectIdeaCategory::Aprendizaje,
            'sort_order' => 2,
        ]);
        ProjectIdea::factory()->create([
            'slug' => 'herramientas-1',
            'category' => ProjectIdeaCategory::HerramientasDev,
            'sort_order' => 1,
        ]);
        ProjectIdea::factory()->create([
            'slug' => 'aprendizaje-1',
            'category' => ProjectIdeaCategory::Aprendizaje,
            'sort_order' => 1,
        ]);
        ProjectIdea::factory()->create([
            'slug' => 'clones-1',
            'category' => ProjectIdeaCategory::Clones,
            'sort_order' => 1,
        ]);

        $slugs = collect($this->ideasPayload($this->openCreatePage()))->pluck('slug')->all();

        $this->assertSame(
            ['herramientas-1', 'clones-1', 'aprendizaje-1', 'aprendizaje-2'],
            $slugs,
        );
    }

    public function test_idea_payload_exposes_linked_tech_ids_and_empty_list_when_unlinked(): void
    {
        $techs = Tech::factory()->count(2)->create();

        $linked = ProjectIdea::factory()->create([
            'slug' => 'linked-idea',
            'category' => ProjectIdeaCategory::HerramientasDev,
            'sort_order' => 1,
        ]);
        $linked->techs()->attach($techs->pluck('id')->all());

        ProjectIdea::factory()->create([
            'slug' => 'unlinked-idea',
            'category' => ProjectIdeaCategory::HerramientasDev,
            'sort_order' => 2,
        ]);

        $payload = collect($this->ideasPayload($this->openCreatePage()));

        $this->assertEqualsCanonicalizing(
            $techs->pluck('id')->map(fn ($id): int => (int) $id)->all(),
            $payload->firstWhere('slug', 'linked-idea')['techIds'],
        );
        $this->assertSame([], $payload->firstWhere('slug', 'unlinked-idea')['techIds']);
    }

    public function test_idea_payload_uses_camel_case_prefill_keys_and_blank_vision_when_null(): void
    {
        ProjectIdea::factory()->create([
            'slug' => 'camel-idea',
            'category' => ProjectIdeaCategory::HerramientasDev,
            'sort_order' => 1,
            'prefill_title' => 'Prefill title',
            'prefill_description' => 'Prefill description',
            'prefill_vision' => null,
        ]);

        $idea = collect($this->ideasPayload($this->openCreatePage()))->firstWhere('slug', 'camel-idea');

        $this->assertSame('Prefill title', $idea['prefillTitle']);
        $this->assertSame('Prefill description', $idea['prefillDescription']);
        $this->assertSame('', $idea['prefillVision']);
    }

    public function test_model_casts_category_and_nullable_difficulty(): void
    {
        $idea = ProjectIdea::factory()->create([
            'category' => ProjectIdeaCategory::Clones,
            'difficulty' => null,
        ])->fresh();

        $this->assertInstanceOf(ProjectIdeaCategory::class, $idea->category);
        $this->assertSame(ProjectIdeaCategory::Clones, $idea->category);
        $this->assertNull($idea->difficulty);
    }

    public function test_seeder_is_idempotent_and_covers_every_category(): void
    {
        $this->seed(TechSeeder::class);

        $this->seed(ProjectIdeaSeeder::class);
        $ideaCountAfterFirstRun = ProjectIdea::count();
        $pivotCountAfterFirstRun = DB::table('project_idea_tech')->count();

        $this->seed(ProjectIdeaSeeder::class);

        $this->assertSame(15, $ideaCountAfterFirstRun);
        $this->assertSame($ideaCountAfterFirstRun, ProjectIdea::count());
        $this->assertSame($pivotCountAfterFirstRun, DB::table('project_idea_tech')->count());

        foreach (ProjectIdeaCategory::cases() as $category) {
            $this->assertGreaterThanOrEqual(
                1,
                ProjectIdea::query()
                    ->where('is_published', true)
                    ->where('category', $category->value)
                    ->count(),
                "Category {$category->value} must have at least one published idea",
            );
        }
    }

    public function test_seeder_skips_unknown_tech_slugs_without_error(): void
    {
        Tech::factory()->create(['slug' => 'go']);
        Tech::factory()->create(['slug' => 'typescript']);
        Tech::factory()->create(['slug' => 'git']);

        $this->seed(ProjectIdeaSeeder::class);

        $this->assertSame(15, ProjectIdea::count());

        $cliScaffold = ProjectIdea::where('slug', 'cli-scaffold-proyectos')->first();
        $this->assertNotNull($cliScaffold);
        $this->assertEqualsCanonicalizing(
            Tech::whereIn('slug', ['go', 'typescript', 'git'])->pluck('id')->all(),
            $cliScaffold->techs->pluck('id')->all(),
        );

        $dashboard = ProjectIdea::where('slug', 'dashboard-metricas-repos')->first();
        $this->assertNotNull($dashboard);
        $this->assertCount(0, $dashboard->techs);
    }

    // === Phase 1: illustration_path column ===

    public function test_illustration_path_column_is_nullable_and_mass_assignable(): void
    {
        $this->assertTrue(Schema::hasColumn('project_ideas', 'illustration_path'));
        $this->assertContains('illustration_path', (new ProjectIdea)->getFillable());

        $idea = ProjectIdea::factory()->create();
        $this->assertNull($idea->fresh()->illustration_path);

        $idea->update(['illustration_path' => 'project-ideas/example.webp']);
        $this->assertSame('project-ideas/example.webp', $idea->fresh()->illustration_path);
    }

    public function test_illustration_path_factory_default_is_null(): void
    {
        $this->assertNull(ProjectIdea::factory()->make()->illustration_path);
    }

    public function test_illustration_path_migration_rolls_back_and_reapplies(): void
    {
        $migration = require database_path(
            'migrations/2026_09_02_000300_add_illustration_path_to_project_ideas_table.php'
        );

        $migration->down();
        $this->assertFalse(Schema::hasColumn('project_ideas', 'illustration_path'));

        $migration->up();
        $this->assertTrue(Schema::hasColumn('project_ideas', 'illustration_path'));
    }

    // === Phase 2: seeder asset pipeline ===

    public function test_seeder_copies_present_illustration_assets_and_leaves_others_null(): void
    {
        $this->seed(TechSeeder::class);
        $this->fakeIllustrationSource('cli-scaffold-proyectos');

        $this->seed(ProjectIdeaSeeder::class);

        Storage::disk('public')->assertExists('project-ideas/cli-scaffold-proyectos.webp');
        $this->assertSame(
            'project-ideas/cli-scaffold-proyectos.webp',
            ProjectIdea::where('slug', 'cli-scaffold-proyectos')->value('illustration_path'),
        );
        $this->assertNull(
            ProjectIdea::where('slug', 'dashboard-metricas-repos')->value('illustration_path'),
        );
    }

    public function test_reseed_picks_up_a_newly_added_asset_without_changing_row_or_pivot_counts(): void
    {
        $this->seed(TechSeeder::class);
        $this->seed(ProjectIdeaSeeder::class);

        $this->assertNull(
            ProjectIdea::where('slug', 'clon-trello-kanban')->value('illustration_path'),
        );

        $ideaCount = ProjectIdea::count();
        $pivotCount = DB::table('project_idea_tech')->count();

        $this->fakeIllustrationSource('clon-trello-kanban');
        $this->seed(ProjectIdeaSeeder::class);

        $this->assertSame($ideaCount, ProjectIdea::count());
        $this->assertSame($pivotCount, DB::table('project_idea_tech')->count());
        $this->assertSame(
            'project-ideas/clon-trello-kanban.webp',
            ProjectIdea::where('slug', 'clon-trello-kanban')->value('illustration_path'),
        );
    }

    public function test_removing_a_source_asset_never_nulls_a_live_illustration_path(): void
    {
        $this->seed(TechSeeder::class);
        $this->fakeIllustrationSource('gestor-snippets-equipo');
        $this->seed(ProjectIdeaSeeder::class);

        $this->assertSame(
            'project-ideas/gestor-snippets-equipo.webp',
            ProjectIdea::where('slug', 'gestor-snippets-equipo')->value('illustration_path'),
        );

        $this->removeIllustrationSource('gestor-snippets-equipo');
        $this->seed(ProjectIdeaSeeder::class);

        $this->assertSame(
            'project-ideas/gestor-snippets-equipo.webp',
            ProjectIdea::where('slug', 'gestor-snippets-equipo')->value('illustration_path'),
        );
    }

    // === Phase 9.1: payload exposes illustrationUrl ===

    public function test_ideas_payload_exposes_illustration_url_when_set_and_null_otherwise(): void
    {
        ProjectIdea::factory()->create([
            'slug' => 'with-illustration',
            'category' => ProjectIdeaCategory::HerramientasDev,
            'sort_order' => 1,
            'illustration_path' => 'project-ideas/with-illustration.webp',
        ]);
        ProjectIdea::factory()->create([
            'slug' => 'without-illustration',
            'category' => ProjectIdeaCategory::HerramientasDev,
            'sort_order' => 2,
            'illustration_path' => null,
        ]);

        $payload = collect($this->ideasPayload($this->openCreatePage()));

        $withUrl = $payload->firstWhere('slug', 'with-illustration')['illustrationUrl'];
        $this->assertIsString($withUrl);
        $this->assertSame(
            Storage::disk('public')->url('project-ideas/with-illustration.webp'),
            $withUrl,
        );
        $this->assertNull($payload->firstWhere('slug', 'without-illustration')['illustrationUrl']);
    }
}
