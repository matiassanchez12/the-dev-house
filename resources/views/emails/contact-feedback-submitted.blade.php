@php
    /** @var \App\Models\ContactMessage $contactMessage */

    $satisfactionLabels = [
        1 => '1/5 - Muy insatisfecho',
        2 => '2/5 - Insatisfecho',
        3 => '3/5 - Neutral',
        4 => '4/5 - Satisfecho',
        5 => '5/5 - Muy satisfecho',
    ];

    $understoodPurposeLabels = [
        'yes' => 'Sí, totalmente',
        'partly' => 'Más o menos',
        'no' => 'No del todo',
    ];

    $wouldJoinProjectLabels = [
        'yes' => 'Sí',
        'maybe' => 'Tal vez',
        'no' => 'No',
    ];

    $projectTypeLabels = [
        'practice' => 'Práctica',
        'portfolio' => 'Portfolio',
        'real' => 'Reales',
    ];

    $intro = "{$contactMessage->name} dejó feedback sobre la app y podés responderle directamente a {$contactMessage->email}.";
@endphp

<x-email-shell
    :preheader="'Nuevo feedback de ' . $contactMessage->name"
    section="Feedback de producto"
    title="Nuevo feedback recibido"
    :intro="$intro"
    project-label="Usuario"
    :project-title="$contactMessage->name"
    footer="Email automático de The Dev House con feedback del formulario público."
>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 18px 0;border:1px solid #1f2937;border-radius:12px;background-color:#111827;">
        <tr>
            <td style="padding:14px 16px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;line-height:1.2;">
                    Email
                </div>
                <div style="margin-top:4px;font-size:15px;font-weight:600;line-height:1.5;color:#f8fafc;word-break:break-word;">
                    {{ $contactMessage->email }}
                </div>
            </td>
        </tr>
    </table>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 18px 0;border:1px solid #1f2937;border-radius:12px;background-color:#111827;">
        <tr>
            <td style="padding:14px 16px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;line-height:1.2;">
                    Satisfacción general
                </div>
                <div style="margin-top:4px;font-size:15px;font-weight:600;line-height:1.5;color:#f8fafc;">
                    {{ $satisfactionLabels[$contactMessage->satisfaction] ?? $contactMessage->satisfaction }}
                </div>
            </td>
        </tr>
    </table>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 18px 0;border-collapse:separate;border-spacing:0 12px;">
        <tr>
            <td style="padding:14px 16px;border:1px solid #1f2937;border-radius:12px;background-color:#111827;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;line-height:1.2;">
                    ¿Entendió para qué sirve?
                </div>
                <div style="margin-top:6px;font-size:14px;line-height:1.6;color:#e2e8f0;">
                    {{ $understoodPurposeLabels[$contactMessage->understood_purpose] ?? $contactMessage->understood_purpose }}
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding:14px 16px;border:1px solid #1f2937;border-radius:12px;background-color:#111827;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;line-height:1.2;">
                    ¿Se sumaría a un proyecto?
                </div>
                <div style="margin-top:6px;font-size:14px;line-height:1.6;color:#e2e8f0;">
                    {{ $wouldJoinProjectLabels[$contactMessage->would_join_project] ?? $contactMessage->would_join_project }}
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding:14px 16px;border:1px solid #1f2937;border-radius:12px;background-color:#111827;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;line-height:1.2;">
                    ¿Qué le faltó?
                </div>
                <div style="margin-top:6px;font-size:14px;line-height:1.6;color:#e2e8f0;white-space:pre-wrap;">
                    {{ $contactMessage->missing_feature }}
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding:14px 16px;border:1px solid #1f2937;border-radius:12px;background-color:#111827;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;line-height:1.2;">
                    Stack que usa
                </div>
                <div style="margin-top:6px;font-size:14px;line-height:1.6;color:#e2e8f0;white-space:pre-wrap;">
                    {{ $contactMessage->tech_stack }}
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding:14px 16px;border:1px solid #1f2937;border-radius:12px;background-color:#111827;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;line-height:1.2;">
                    Tipo de proyecto preferido
                </div>
                <div style="margin-top:6px;font-size:14px;line-height:1.6;color:#e2e8f0;">
                    {{ $projectTypeLabels[$contactMessage->preferred_project_type] ?? $contactMessage->preferred_project_type }}
                </div>
            </td>
        </tr>
        <tr>
            <td style="padding:14px 16px;border:1px solid #1f2937;border-radius:12px;background-color:#111827;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;line-height:1.2;">
                    ¿Qué mejoraría?
                </div>
                <div style="margin-top:6px;font-size:14px;line-height:1.6;color:#e2e8f0;white-space:pre-wrap;">
                    {{ $contactMessage->improvements }}
                </div>
            </td>
        </tr>
    </table>
</x-email-shell>
