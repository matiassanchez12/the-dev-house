<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('mail:test-resend {email?}', function (?string $email = null): int {
    $recipient = $email ?: 'matias.sanchez.0097@gmail.com';
    $defaultMailer = (string) config('mail.default');
    $fromAddress = (string) config('mail.from.address');
    $fromName = (string) config('mail.from.name');
    $resendApiKey = (string) env('RESEND_API_KEY', '');

    if ($defaultMailer !== 'resend') {
        $this->error("MAIL_MAILER actual: {$defaultMailer}");
        $this->error('Esta prueba requiere MAIL_MAILER="resend" antes de enviar.');

        return 1;
    }

    if ($resendApiKey === '') {
        $this->error('Falta RESEND_API_KEY en el entorno.');

        return 1;
    }

    if ($fromAddress === '') {
        $this->error('Falta MAIL_FROM_ADDRESS en el entorno.');

        return 1;
    }

    $this->info('Enviando email de prueba...');
    $this->line("Mailer: {$defaultMailer}");
    $this->line("From: {$fromName} <{$fromAddress}>");
    $this->line("To: {$recipient}");

    try {
        Mail::raw(
            "Prueba de Resend desde Laravel.\n\nSi recibiste este email, la integración básica está funcionando.",
            static function ($message) use ($recipient): void {
                $message
                    ->to($recipient)
                    ->subject('Prueba de Resend desde Laravel');
            }
        );
    } catch (Throwable $exception) {
        $this->error('Falló el envío.');
        $this->line($exception::class);
        $this->line($exception->getMessage());

        return 1;
    }

    $this->info('Email enviado correctamente.');

    return 0;
})->purpose('Send a minimal Resend test email');
