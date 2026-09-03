<?php

namespace Tests\Unit\Services;

use App\Enums\ProjectIdeaCategory;
use App\Enums\ProjectIdeaDifficulty;
use App\Helpers\ApiResourceTransformer;
use App\Models\ProjectIdea;
use App\Models\Tech;
use App\Services\ProjectIdeaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectIdeaServiceTest extends TestCase
{
    use RefreshDatabase;

    private ProjectIdeaService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ProjectIdeaService;
    }

    public function test_published_for_display_returns_only_published_ideas(): void
    {
        ProjectIdea::factory()->create([
            'slug' => 'published-a',
            'category' => ProjectIdeaCategory::HerramientasDev,
            'sort_order' => 1,
            'is_published' => true,
        ]);
        ProjectIdea::factory()->create([
            'slug' => 'published-b',
            'category' => ProjectIdeaCategory::Clones,
            'sort_order' => 1,
            'is_published' => true,
        ]);
        ProjectIdea::factory()->create([
            'slug' => 'draft',
            'category' => ProjectIdeaCategory::Aprendizaje,
            'sort_order' => 1,
            'is_published' => false,
        ]);

        $slugs = collect($this->service->publishedForDisplay())->pluck('slug')->all();

        $this->assertSame(['published-a', 'published-b'], $slugs);
    }

    public function test_published_for_display_orders_by_enum_order_then_sort_order(): void
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

        $slugs = collect($this->service->publishedForDisplay())->pluck('slug')->all();

        $this->assertSame(
            ['herramientas-1', 'clones-1', 'aprendizaje-1', 'aprendizaje-2'],
            $slugs,
        );
    }

    public function test_published_for_display_equals_transformer_over_same_query(): void
    {
        Tech::factory()->count(3)->create();
        ProjectIdea::factory()->count(4)->create(['is_published' => true]);
        ProjectIdea::factory()->count(2)->create(['is_published' => false]);
        ProjectIdea::all()->each(function (ProjectIdea $idea): void {
            $idea->techs()->attach(Tech::inRandomOrder()->take(2)->pluck('id')->all());
        });

        $expected = ApiResourceTransformer::projectIdeas(
            ProjectIdea::published()->with('techs:id')->orderBy('sort_order')->get(),
        );

        $this->assertEquals($expected, $this->service->publishedForDisplay());
    }

    public function test_featured_for_onboarding_returns_one_idea_per_category_in_enum_order(): void
    {
        foreach ([ProjectIdeaCategory::Aprendizaje, ProjectIdeaCategory::HerramientasDev, ProjectIdeaCategory::Clones] as $category) {
            ProjectIdea::factory()->create([
                'slug' => $category->value.'-low',
                'category' => $category,
                'sort_order' => 1,
            ]);
            ProjectIdea::factory()->create([
                'slug' => $category->value.'-high',
                'category' => $category,
                'sort_order' => 5,
            ]);
        }

        $featured = collect($this->service->featuredForOnboarding());

        $this->assertSame(
            ['herramientas-dev-low', 'clones-low', 'aprendizaje-low'],
            $featured->pluck('slug')->all(),
        );
        $this->assertSame(
            ['herramientas-dev', 'clones', 'aprendizaje'],
            $featured->pluck('category')->all(),
        );
    }

    public function test_featured_for_onboarding_tie_breaks_on_id_and_excludes_unpublished(): void
    {
        $unpublished = ProjectIdea::factory()->create([
            'slug' => 'unpublished-lowest',
            'category' => ProjectIdeaCategory::HerramientasDev,
            'sort_order' => 0,
            'is_published' => false,
        ]);

        $firstPublished = ProjectIdea::factory()->create([
            'slug' => 'published-tie-a',
            'category' => ProjectIdeaCategory::HerramientasDev,
            'sort_order' => 1,
        ]);
        $secondPublished = ProjectIdea::factory()->create([
            'slug' => 'published-tie-b',
            'category' => ProjectIdeaCategory::HerramientasDev,
            'sort_order' => 1,
        ]);

        $this->assertTrue($firstPublished->id < $secondPublished->id);

        $featured = collect($this->service->featuredForOnboarding());

        $this->assertSame(['published-tie-a'], $featured->pluck('slug')->all());
        $this->assertNotContains($unpublished->slug, $featured->pluck('slug')->all());
    }

    public function test_featured_for_onboarding_is_empty_when_no_published_ideas_exist(): void
    {
        ProjectIdea::factory()->count(3)->create(['is_published' => false]);

        $this->assertSame([], $this->service->featuredForOnboarding());
    }

    public function test_featured_for_onboarding_uses_same_payload_shape_as_published_for_display(): void
    {
        $tech = Tech::factory()->create();

        $idea = ProjectIdea::factory()->create([
            'slug' => 'featured-shape',
            'category' => ProjectIdeaCategory::HerramientasDev,
            'sort_order' => 1,
            'difficulty' => ProjectIdeaDifficulty::Avanzado,
            'prefill_vision' => null,
        ]);
        $idea->techs()->attach($tech->id);

        $row = collect($this->service->featuredForOnboarding())->firstWhere('slug', 'featured-shape');

        $this->assertSame(
            ['slug', 'title', 'summary', 'category', 'difficulty', 'prefillTitle', 'prefillDescription', 'prefillVision', 'techIds', 'illustrationUrl'],
            array_keys($row),
        );
        $this->assertSame('', $row['prefillVision']);
        $this->assertSame([$tech->id], $row['techIds']);
    }
}
