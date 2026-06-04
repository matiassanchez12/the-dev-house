<?php

namespace Tests\Feature;

use App\Models\Tech;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserDiscoveryTest extends TestCase
{
    use RefreshDatabase;

    /**
     * TEST 1: Guest can view user directory
     */
    public function test_guest_can_view_user_directory(): void
    {
        // Arrange: Create some users
        User::factory()->count(5)->create();

        // Act: Visit the users directory
        $response = $this->get('/users');

        // Assert: Should return 200 with paginated structure
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('users.data', 5)
                ->has('users.data.0.created_projects_count')
                ->has('users.meta.total')
                ->has('techs')
                ->has('filters')
        );
    }

    /**
     * TEST 2: Search by name returns matching users
     */
    public function test_search_by_name_returns_matching_users(): void
    {
        // Arrange
        User::factory()->create(['name' => 'John Doe']);
        User::factory()->create(['name' => 'Jane Smith']);
        User::factory()->create(['name' => 'Johnny Cash']);

        // Act: Search for "john"
        $response = $this->get('/users?q=john');

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('users.data', 2)
                ->where('filters.q', 'john')
        );
    }

    /**
     * TEST 3: Filter by tech returns users with that tech
     */
    public function test_filter_by_tech_returns_users_with_that_tech(): void
    {
        // Arrange
        $react = Tech::factory()->create(['slug' => 'react', 'name' => 'React']);
        $vue = Tech::factory()->create(['slug' => 'vue', 'name' => 'Vue']);

        $userReact = User::factory()->create(['name' => 'Frontend Dev']);
        $userReact->techs()->attach($react->id);

        $userVue = User::factory()->create(['name' => 'Vue Developer']);
        $userVue->techs()->attach($vue->id);

        $userNoTech = User::factory()->create(['name' => 'Backend Dev']);

        // Act: Filter by react tech
        $response = $this->get('/users?tech=react');

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('users.data', 1)
                ->where('filters.tech', 'react')
        );
    }

    /**
     * TEST 4: Combined search and tech filter
     */
    public function test_combined_search_and_tech_filter(): void
    {
        // Arrange
        $react = Tech::factory()->create(['slug' => 'react', 'name' => 'React']);

        $userJohnReact = User::factory()->create(['name' => 'John React Dev']);
        $userJohnReact->techs()->attach($react->id);

        $userJohnVue = User::factory()->create(['name' => 'John Vue Dev']);
        $vue = Tech::factory()->create(['slug' => 'vue']);
        $userJohnVue->techs()->attach($vue->id);

        $userJaneReact = User::factory()->create(['name' => 'Jane React Dev']);
        $userJaneReact->techs()->attach($react->id);

        // Act: Search "john" with tech "react"
        $response = $this->get('/users?q=john&tech=react');

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('users.data', 1)
                ->where('filters.q', 'john')
                ->where('filters.tech', 'react')
        );
    }

    /**
     * TEST 5: Pagination returns 12 users per page
     */
    public function test_pagination_returns_12_users_per_page(): void
    {
        // Arrange: Create 15 users
        User::factory()->count(15)->create();

        // Act
        $response = $this->get('/users');

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('users.meta.per_page', 12)
                ->has('users.data', 12)
        );
    }

    /**
     * TEST 6: Invalid tech filter returns empty
     */
    public function test_invalid_tech_filter_returns_empty(): void
    {
        // Arrange
        User::factory()->count(3)->create();

        // Act
        $response = $this->get('/users?tech=nonexistent');

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('users.data', 0)
                ->where('users.meta.total', 0)
        );
    }

    /**
     * TEST 7: User data structure in response
     */
    public function test_user_data_structure_includes_required_fields(): void
    {
        // Arrange
        $user = User::factory()->create([
            'name' => 'Test User',
            'bio' => 'This is a test bio that is longer than 100 characters to test truncation in the discovery view. It should be cut off at 100.',
            'avatar' => 'https://example.com/avatar.jpg',
        ]);
        $tech = Tech::factory()->create(['name' => 'React', 'slug' => 'react']);
        $user->techs()->attach($tech->id);

        // Act
        $response = $this->get('/users');

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('users.data', 1)
                ->has('users.data.0.techs')
        );

        // Verify specific user data via the inertia callback
        $response->assertInertia(
            fn ($page) => $page
                ->where('users.data.0.name', 'Test User')
                ->where('users.data.0.avatar', 'https://example.com/avatar.jpg')
        );
    }

    /**
     * TEST 8: Empty directory returns empty data
     */
    public function test_empty_directory_returns_empty_data(): void
    {
        // Act
        $response = $this->get('/users');

        // Assert
        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('users.data', 0)
                ->where('users.meta.total', 0)
        );
    }
}
