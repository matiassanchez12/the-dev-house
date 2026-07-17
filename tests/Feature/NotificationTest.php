<?php

namespace Tests\Feature;

use App\Models\JoinRequest;
use App\Models\Project;
use App\Models\User;
use App\Notifications\JoinRequestApproved;
use App\Notifications\JoinRequestReceived;
use App\Notifications\JoinRequestRejected;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_join_request_creates_notification_for_project_creator(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        $response = $this->actingAs($applicant)
            ->post(route('join-requests.store', $project), [
                'message' => 'Quiero unirme al proyecto',
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $creator->id,
            'notifiable_type' => User::class,
        ]);
    }

    public function test_join_request_approved_creates_notification_for_applicant(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($creator)
            ->post(route('join-requests.approve', $joinRequest));

        $response->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $applicant->id,
            'notifiable_type' => User::class,
        ]);
    }

    public function test_join_request_rejected_creates_notification_for_applicant(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($creator)
            ->post(route('join-requests.reject', $joinRequest));

        $response->assertRedirect();

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $applicant->id,
            'notifiable_type' => User::class,
        ]);
    }

    public function test_notification_data_has_correct_structure(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'title' => 'Test Project Alpha',
            'status' => 'open',
        ]);

        $this->actingAs($applicant)
            ->post(route('join-requests.store', $project), [
                'message' => 'Quiero participar',
            ]);

        $notification = $creator->notifications()->first();

        $this->assertNotNull($notification);

        $data = $notification->data;

        $this->assertEquals('join_request_received', $data['type']);
        $this->assertEquals($project->slug, $data['project_slug']);
        $this->assertEquals('Test Project Alpha', $data['project_title']);
        $this->assertEquals($applicant->id, $data['applicant_id']);
        $this->assertEquals($applicant->name, $data['applicant_name']);
    }

    public function test_join_request_received_uses_mail_channel(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        Notification::fake();

        $response = $this->actingAs($applicant)
            ->post(route('join-requests.store', $project), [
                'message' => 'Quiero unirme',
            ]);

        Notification::assertSentTo(
            $creator,
            JoinRequestReceived::class,
            fn ($notification, $channels) => in_array('mail', $channels)
        );
    }

    public function test_join_request_approved_uses_mail_channel(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $applicant->privacySetting()->create(['email_notifications_enabled' => true]);
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        Notification::fake();

        $response = $this->actingAs($creator)
            ->post(route('join-requests.approve', $joinRequest));

        Notification::assertSentTo(
            $applicant,
            JoinRequestApproved::class,
            fn ($notification, $channels) => in_array('mail', $channels, true)
        );
    }

    public function test_join_request_rejected_uses_mail_channel(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $applicant->privacySetting()->create(['email_notifications_enabled' => true]);
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        Notification::fake();

        $response = $this->actingAs($creator)
            ->post(route('join-requests.reject', $joinRequest));

        Notification::assertSentTo(
            $applicant,
            JoinRequestRejected::class,
            fn ($notification, $channels) => in_array('mail', $channels, true)
        );
    }

    public function test_join_request_received_to_mail_returns_valid_message(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'title' => 'Test Project Beta',
            'status' => 'open',
        ]);

        $this->actingAs($applicant)
            ->post(route('join-requests.store', $project), [
                'message' => 'Quiero participar',
            ]);

        $notification = $creator->notifications()->where('type', JoinRequestReceived::class)->first();

        $this->assertNotNull($notification);

        $jr = JoinRequest::find($notification->data['join_request_id']);

        $mailMessage = (new JoinRequestReceived($jr))->toMail($creator);

        $this->assertNotEmpty($mailMessage->subject);
        $this->assertStringContainsString('Test Project Beta', $mailMessage->subject);
        $this->assertEquals('emails.join-request-received', $mailMessage->view);
    }

    public function test_join_request_approved_to_mail_uses_custom_view(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id, 'status' => 'open']);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        $mailMessage = (new JoinRequestApproved($joinRequest))->toMail($applicant);

        $this->assertEquals('emails.join-request-approved', $mailMessage->view);
        $this->assertStringContainsString($project->title, $mailMessage->subject);
    }

    public function test_join_request_rejected_to_mail_uses_custom_view(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id, 'status' => 'open']);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        $mailMessage = (new JoinRequestRejected($joinRequest))->toMail($applicant);

        $this->assertEquals('emails.join-request-rejected', $mailMessage->view);
        $this->assertStringContainsString($project->title, $mailMessage->subject);
    }

    public function test_join_request_received_mail_renders_minimal_tech_layout(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'title' => 'Test Project Gamma',
            'status' => 'open',
        ]);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero participar',
            'status' => 'pending',
        ]);

        $html = view('emails.join-request-received', [
            'joinRequest' => $joinRequest,
        ])->render();

        $this->assertStringContainsString('SYSTEM NOTIFICATION', $html);
        $this->assertStringContainsString('Nueva solicitud de acceso', $html);
        $this->assertStringContainsString('Abrir solicitud', $html);
        $this->assertStringContainsString(route('projects.show', $project->slug), $html);
    }

    public function test_join_request_received_mail_uses_dark_theme_shell(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'title' => 'Test Project Dark',
            'status' => 'open',
        ]);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero participar',
            'status' => 'pending',
        ]);

        $html = view('emails.join-request-received', [
            'joinRequest' => $joinRequest,
        ])->render();

        $this->assertStringContainsString('background-color:#020617', $html);
        $this->assertStringContainsString('background-color:#0b1220', $html);
        $this->assertStringContainsString('background-color:#38bdf8', $html);
    }

    public function test_join_request_approved_mail_renders_minimal_tech_layout(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id, 'status' => 'open']);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        $html = view('emails.join-request-approved', [
            'joinRequest' => $joinRequest,
        ])->render();

        $this->assertStringContainsString('SYSTEM NOTIFICATION', $html);
        $this->assertStringContainsString('Acceso aprobado', $html);
        $this->assertStringContainsString('Abrir proyecto', $html);
        $this->assertStringContainsString(route('projects.show', $project->slug), $html);
    }

    public function test_join_request_rejected_mail_renders_minimal_tech_layout(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $creator->id, 'status' => 'open']);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        $html = view('emails.join-request-rejected', [
            'joinRequest' => $joinRequest,
        ])->render();

        $this->assertStringContainsString('SYSTEM NOTIFICATION', $html);
        $this->assertStringContainsString('Solicitud no aprobada', $html);
        $this->assertStringContainsString('Explorar proyectos', $html);
        $this->assertStringContainsString(route('projects.index'), $html);
    }

    public function test_authenticated_user_can_view_their_notifications_index(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $other->id, 'status' => 'open']);

        $this->actingAs($user)
            ->post(route('join-requests.store', $project), [
                'message' => 'Quiero unirme al proyecto',
            ]);

        $other->notify(new JoinRequestReceived(
            JoinRequest::where('user_id', $user->id)->first()
        ));

        $response = $this->actingAs($other)->get(route('notifications.index'));

        $response->assertOk();
    }

    public function test_authenticated_user_can_mark_notification_as_read(): void
    {
        $user = User::factory()->create();
        $notification = $user->notifications()->create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'type' => 'App\\Notifications\\JoinRequestReceived',
            'data' => ['type' => 'join_request_received'],
        ]);

        $this->assertNull($notification->fresh()->read_at);

        $response = $this->actingAs($user)
            ->patch(route('notifications.read', $notification->id));

        $response->assertRedirect();

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_authenticated_user_can_mark_all_notifications_as_read(): void
    {
        $user = User::factory()->create();
        $n1 = $user->notifications()->create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'type' => 'App\\Notifications\\JoinRequestReceived',
            'data' => ['type' => 'join_request_received'],
        ]);
        $n2 = $user->notifications()->create([
            'id' => \Illuminate\Support\Str::uuid()->toString(),
            'type' => 'App\\Notifications\\JoinRequestApproved',
            'data' => ['type' => 'join_request_approved'],
        ]);

        $n1->markAsRead();

        $response = $this->actingAs($user)
            ->post(route('notifications.read-all'));

        $response->assertRedirect();

        $this->assertNotNull($n1->fresh()->read_at);
        $this->assertNotNull($n2->fresh()->read_at);
    }

    public function test_unread_notifications_count_is_shared_via_inertia(): void
    {
        $user = User::factory()->create();
        for ($i = 0; $i < 3; $i++) {
            $user->notifications()->create([
                'id' => \Illuminate\Support\Str::uuid()->toString(),
                'type' => 'App\\Notifications\\JoinRequestReceived',
                'data' => ['type' => 'join_request_received'],
            ]);
        }

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertInertia(
            fn ($page) => $page->where('auth.user.unread_notifications_count', 3)
        );
    }

    public function test_latest_notifications_are_shared_via_inertia_for_the_navbar_dropdown(): void
    {
        $user = User::factory()->create();

        for ($i = 1; $i <= 6; $i++) {
            $user->notifications()->create([
                'id' => \Illuminate\Support\Str::uuid()->toString(),
                'type' => 'App\\Notifications\\JoinRequestReceived',
                'data' => [
                    'type' => 'join_request_received',
                    'project_id' => $i,
                    'project_slug' => "project-{$i}",
                    'project_title' => "Project {$i}",
                    'applicant_id' => $i,
                    'applicant_name' => "Applicant {$i}",
                ],
                'created_at' => now()->subMinutes(6 - $i),
                'updated_at' => now()->subMinutes(6 - $i),
            ]);
        }

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertInertia(
            fn ($page) => $page
                ->has('notifications', 5)
                ->where('notifications.0.data.project_title', 'Project 6')
                ->where('notifications.4.data.project_title', 'Project 2')
        );
    }

    public function test_user_routes_notifications_for_broadcast_to_private_user_channel(): void
    {
        $user = User::factory()->create();

        $this->assertEquals(
            'user.' . $user->id,
            $user->routeNotificationForBroadcast(new \stdClass()),
        );

        $this->assertEquals(
            'user.' . $user->id,
            $user->receivesBroadcastNotificationsOn(new \stdClass()),
        );
    }

    public function test_authenticated_user_can_authorize_own_private_notification_channel(): void
    {
        $user = User::factory()->create();

        $csrf = 'test-csrf-token';
        $socketId = '123.456';
        $channelName = 'private-user.' . $user->id;
        $expectedAuth = config('broadcasting.connections.testing.key') . ':' . hash_hmac(
            'sha256',
            $socketId . ':' . $channelName,
            config('broadcasting.connections.testing.secret'),
        );

        $response = $this->actingAs($user)
            ->withSession(['_token' => $csrf])
            ->withHeader('X-CSRF-TOKEN', $csrf)
            ->post('/broadcasting/auth', [
                'socket_id' => $socketId,
                'channel_name' => $channelName,
            ]);

        $response->assertOk();
        $response->assertExactJson(['auth' => $expectedAuth]);
    }

    public function test_user_cannot_authorize_another_users_private_notification_channel(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $csrf = 'test-csrf-token';

        $response = $this->actingAs($user)
            ->withSession(['_token' => $csrf])
            ->withHeader('X-CSRF-TOKEN', $csrf)
            ->post('/broadcasting/auth', [
                'socket_id' => '123.456',
                'channel_name' => 'private-user.' . $otherUser->id,
            ]);

        $response->assertForbidden();
    }

    public function test_join_request_received_uses_broadcast_channel(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        Notification::fake();

        $this->actingAs($applicant)
            ->post(route('join-requests.store', $project), [
                'message' => 'Quiero unirme',
            ]);

        Notification::assertSentTo(
            $creator,
            JoinRequestReceived::class,
            fn ($notification, $channels) => in_array('broadcast', $channels, true)
                && in_array('database', $channels, true)
                && in_array('mail', $channels, true),
        );
    }

    public function test_join_request_received_skips_mail_when_recipient_disables_optional_emails(): void
    {
        $creator = User::factory()->create();
        $creator->notificationSetting()->create(['collaboration_emails' => false]);
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        Notification::fake();

        $this->actingAs($applicant)
            ->post(route('join-requests.store', $project), [
                'message' => 'Quiero unirme',
            ]);

        Notification::assertSentTo(
            $creator,
            JoinRequestReceived::class,
            fn ($notification, $channels) => in_array('database', $channels, true)
                && in_array('broadcast', $channels, true)
                && ! in_array('mail', $channels, true),
        );
    }

    public function test_join_request_received_skips_mail_when_legacy_privacy_setting_is_false(): void
    {
        $creator = User::factory()->create();
        $creator->privacySetting()->create(['email_notifications_enabled' => false]);
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        Notification::fake();

        $this->actingAs($applicant)
            ->post(route('join-requests.store', $project), [
                'message' => 'Quiero unirme',
            ]);

        Notification::assertSentTo(
            $creator,
            JoinRequestReceived::class,
            fn ($notification, $channels) => in_array('database', $channels, true)
                && in_array('broadcast', $channels, true)
                && ! in_array('mail', $channels, true),
        );
    }

    public function test_join_request_approved_uses_broadcast_channel(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        Notification::fake();

        $this->actingAs($creator)
            ->post(route('join-requests.approve', $joinRequest));

        Notification::assertSentTo(
            $applicant,
            JoinRequestApproved::class,
            fn ($notification, $channels) => in_array('broadcast', $channels, true),
        );
    }

    public function test_join_request_approved_skips_mail_when_recipient_disables_optional_emails(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $applicant->notificationSetting()->create(['collaboration_emails' => false]);
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        Notification::fake();

        $this->actingAs($creator)
            ->post(route('join-requests.approve', $joinRequest));

        Notification::assertSentTo(
            $applicant,
            JoinRequestApproved::class,
            fn ($notification, $channels) => in_array('database', $channels, true)
                && in_array('broadcast', $channels, true)
                && ! in_array('mail', $channels, true),
        );
    }

    public function test_join_request_rejected_uses_broadcast_channel(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        Notification::fake();

        $this->actingAs($creator)
            ->post(route('join-requests.reject', $joinRequest));

        Notification::assertSentTo(
            $applicant,
            JoinRequestRejected::class,
            fn ($notification, $channels) => in_array('broadcast', $channels, true),
        );
    }

    public function test_join_request_rejected_skips_mail_when_recipient_disables_optional_emails(): void
    {
        $creator = User::factory()->create();
        $applicant = User::factory()->create();
        $applicant->notificationSetting()->create(['collaboration_emails' => false]);
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'open',
        ]);

        $joinRequest = JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => $applicant->id,
            'message' => 'Quiero unirme',
            'status' => 'pending',
        ]);

        Notification::fake();

        $this->actingAs($creator)
            ->post(route('join-requests.reject', $joinRequest));

        Notification::assertSentTo(
            $applicant,
            JoinRequestRejected::class,
            fn ($notification, $channels) => in_array('database', $channels, true)
                && in_array('broadcast', $channels, true)
                && ! in_array('mail', $channels, true),
        );
    }
}
