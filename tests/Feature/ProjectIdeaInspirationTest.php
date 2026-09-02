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
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class ProjectIdeaInspirationTest extends TestCase
{
    use RefreshDatabase;

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
}
