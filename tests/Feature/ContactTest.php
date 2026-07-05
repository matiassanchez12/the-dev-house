<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_store_creates_feedback_without_sending_email(): void
    {
        Mail::fake();

        $response = $this->post('/contact', [
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'satisfaction' => '4',
            'understood_purpose' => 'yes',
            'would_join_project' => 'maybe',
            'missing_feature' => 'Me faltó ver proyectos con filtros más claros por experiencia.',
            'tech_stack' => 'Laravel, React y TypeScript',
            'preferred_project_type' => 'real',
            'improvements' => 'Mejoraría el onboarding y la claridad de los proyectos recomendados.',
        ]);

        $response->assertSessionHas('success');
        $response->assertRedirect();

        $this->assertDatabaseHas('contact_messages', [
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'satisfaction' => 4,
            'understood_purpose' => 'yes',
            'would_join_project' => 'maybe',
            'missing_feature' => 'Me faltó ver proyectos con filtros más claros por experiencia.',
            'tech_stack' => 'Laravel, React y TypeScript',
            'preferred_project_type' => 'real',
            'improvements' => 'Mejoraría el onboarding y la claridad de los proyectos recomendados.',
        ]);

        Mail::assertNothingSent();
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

    public function test_contact_store_validates_satisfaction(): void
    {
        $response = $this->post('/contact', [
            'name' => 'Juan',
            'email' => 'juan@example.com',
            'satisfaction' => '7',
            'understood_purpose' => 'yes',
            'would_join_project' => 'yes',
            'missing_feature' => 'Me faltó un listado más claro de proyectos para sumarme.',
            'tech_stack' => 'Laravel',
            'preferred_project_type' => 'real',
            'improvements' => 'Mejoraría la estructura de la landing y las recomendaciones.',
        ]);

        $response->assertSessionHasErrors('satisfaction');
    }

    public function test_contact_store_validates_feedback_questions(): void
    {
        $response = $this->post('/contact', [
            'name' => 'Juan',
            'email' => 'juan@example.com',
            'satisfaction' => '4',
            'understood_purpose' => 'tal vez',
            'would_join_project' => 'quizas',
            'missing_feature' => 'Corto',
            'tech_stack' => '',
            'preferred_project_type' => 'client-work',
            'improvements' => 'Breve',
        ]);

        $response->assertSessionHasErrors([
            'understood_purpose',
            'would_join_project',
            'missing_feature',
            'tech_stack',
            'preferred_project_type',
            'improvements',
        ]);
    }

    public function test_contact_store_persists_in_database(): void
    {
        $this->post('/contact', [
            'name' => 'María García',
            'email' => 'maria@test.com',
            'satisfaction' => '5',
            'understood_purpose' => 'yes',
            'would_join_project' => 'yes',
            'missing_feature' => 'Me faltó ver un filtro por nivel de seniority y dedicación.',
            'tech_stack' => 'Vue, Laravel y PostgreSQL',
            'preferred_project_type' => 'portfolio',
            'improvements' => 'Sumaría mejores filtros y una explicación más clara del valor para nuevos usuarios.',
        ]);

        $this->assertEquals(1, ContactMessage::count());

        $message = ContactMessage::first();
        $this->assertEquals('María García', $message->name);
        $this->assertEquals('maria@test.com', $message->email);
        $this->assertEquals(5, $message->satisfaction);
        $this->assertEquals('yes', $message->understood_purpose);
        $this->assertEquals('yes', $message->would_join_project);
        $this->assertEquals('Me faltó ver un filtro por nivel de seniority y dedicación.', $message->missing_feature);
        $this->assertEquals('Vue, Laravel y PostgreSQL', $message->tech_stack);
        $this->assertEquals('portfolio', $message->preferred_project_type);
        $this->assertEquals('Sumaría mejores filtros y una explicación más clara del valor para nuevos usuarios.', $message->improvements);
    }
}
