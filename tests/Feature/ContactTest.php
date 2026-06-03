<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_store_creates_message(): void
    {
        $response = $this->post('/contact', [
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'reason' => 'colaboracion',
            'message' => 'Quiero colaborar con un proyecto.',
        ]);

        $response->assertSessionHas('success');
        $response->assertRedirect();

        $this->assertDatabaseHas('contact_messages', [
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'reason' => 'colaboracion',
            'message' => 'Quiero colaborar con un proyecto.',
        ]);
    }

    public function test_contact_store_validates_name(): void
    {
        $response = $this->post('/contact', [
            'name' => '',
            'email' => 'juan@example.com',
            'reason' => 'colaboracion',
            'message' => 'Quiero colaborar con un proyecto.',
        ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_contact_store_validates_email(): void
    {
        $response = $this->post('/contact', [
            'name' => 'Juan',
            'email' => 'invalid',
            'reason' => 'colaboracion',
            'message' => 'Quiero colaborar con un proyecto.',
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_contact_store_validates_reason(): void
    {
        $response = $this->post('/contact', [
            'name' => 'Juan',
            'email' => 'juan@example.com',
            'reason' => '',
            'message' => 'Quiero colaborar con un proyecto.',
        ]);

        $response->assertSessionHasErrors('reason');
    }

    public function test_contact_store_validates_message_length(): void
    {
        $response = $this->post('/contact', [
            'name' => 'Juan',
            'email' => 'juan@example.com',
            'reason' => 'colaboracion',
            'message' => 'Corto',
        ]);

        $response->assertSessionHasErrors('message');
    }

    public function test_contact_store_persists_in_database(): void
    {
        $this->post('/contact', [
            'name' => 'María García',
            'email' => 'maria@test.com',
            'reason' => 'consulta',
            'message' => 'Tengo una consulta sobre la plataforma.',
        ]);

        $this->assertEquals(1, ContactMessage::count());

        $message = ContactMessage::first();
        $this->assertEquals('María García', $message->name);
        $this->assertEquals('maria@test.com', $message->email);
        $this->assertEquals('consulta', $message->reason);
        $this->assertEquals('Tengo una consulta sobre la plataforma.', $message->message);
    }
}
