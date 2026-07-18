<?php

declare(strict_types=1);

namespace Tests\Unit\Mail;

use App\Mail\ContactFeedbackSubmitted;
use App\Models\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class ContactFeedbackSubmittedTest extends TestCase
{
    use RefreshDatabase;

    public function test_contact_feedback_submitted_uses_branded_subject_and_view(): void
    {
        $contactMessage = $this->makeContactMessage('Juan Pérez', 'juan@example.com');

        $mailable = new ContactFeedbackSubmitted($contactMessage);
        $mailMessage = $mailable->envelope();
        $html = $mailable->render();

        self::assertSame('The Dev House: feedback recibido', $mailMessage->subject);
        self::assertSame('juan@example.com', $mailMessage->replyTo[0]->address);
        self::assertSame('Juan Pérez', $mailMessage->replyTo[0]->name);
        self::assertSame('emails.contact-feedback-submitted', $mailable->content()->view);
        self::assertStringContainsString('The Dev House', $html);
        self::assertStringContainsString('Nuevo feedback recibido', $html);
        self::assertStringContainsString('Juan Pérez', $html);
        self::assertStringContainsString('juan@example.com', $html);
        self::assertStringContainsString('Satisfacción general', $html);
    }

    public function test_contact_feedback_submitted_subject_stays_constant_for_other_feedback_data(): void
    {
        $contactMessage = $this->makeContactMessage('María García', 'maria@example.com');

        $mailMessage = (new ContactFeedbackSubmitted($contactMessage))->envelope();

        self::assertSame('The Dev House: feedback recibido', $mailMessage->subject);
    }

    private function makeContactMessage(string $name, string $email): ContactMessage
    {
        return ContactMessage::create([
            'name' => $name,
            'email' => $email,
            'satisfaction' => 5,
            'understood_purpose' => 'yes',
            'would_join_project' => 'maybe',
            'missing_feature' => 'Más claridad en los proyectos abiertos.',
            'tech_stack' => 'Laravel, React y TypeScript',
            'preferred_project_type' => 'real',
            'improvements' => 'Sumaría un onboarding más claro y directo.',
        ]);
    }
}
