@php
    /** @var \App\Models\JoinRequest $joinRequest */
    $applicant = $joinRequest->applicant;
    $project = $joinRequest->project;
    $url = route('projects.show', $project->slug);
    $preheader = "{$applicant->name} pidió acceso a {$project->title}";
    $intro = "{$applicant->name} quiere sumarse a {$project->title}. Revisá el mensaje y resolvé la solicitud.";
@endphp

<x-email-shell
    :preheader="$preheader"
    section="Solicitud de acceso"
    title="Nueva solicitud de acceso"
    :intro="$intro"
    :project-title="$project->title"
    cta-label="Abrir solicitud"
    :cta-url="$url"
    :footer="'Email automático de The Dev House para ' . $project->title . '.'"
>
    @if ($joinRequest->message)
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 18px 0;border:1px solid #dbe3ee;border-radius:12px;background-color:#ffffff;">
            <tr>
                <td style="padding:14px 16px;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;line-height:1.2;">
                        Mensaje
                    </div>
                    <div style="margin-top:6px;font-size:14px;line-height:1.6;color:#334155;white-space:pre-wrap;">
                        {{ $joinRequest->message }}
                    </div>
                </td>
            </tr>
        </table>
    @endif

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 4px 0;border:1px solid #dbe3ee;border-radius:12px;background-color:#f8fafc;">
        <tr>
            <td style="padding:14px 16px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;line-height:1.2;">
                    Solicitante
                </div>
                <div style="margin-top:4px;font-size:15px;font-weight:600;line-height:1.5;color:#0f172a;">
                    {{ $applicant->name }}
                </div>
            </td>
        </tr>
    </table>
</x-email-shell>
