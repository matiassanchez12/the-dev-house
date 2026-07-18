@php
    /** @var \App\Models\ProjectInvitation $projectInvitation */
    $project = $projectInvitation->project;
    $inviter = $project->creator;
    $url = route('projects.show', (string) $project->slug);
    $preheader = "{$inviter->name} te invitó a colaborar en {$project->title}";
    $intro = "{$inviter->name} quiere sumarte a {$project->title}. Revisá la invitación y decidí si querés participar.";
@endphp

<x-email-shell
    :preheader="$preheader"
    section="Invitación a proyecto"
    title="Te invitaron a un proyecto"
    :intro="$intro"
    :project-title="$project->title"
    cta-label="Abrir proyecto"
    :cta-url="$url"
    :footer="'Email automático de The Dev House para ' . $project->title . '.'"
>
    @if ($projectInvitation->message)
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 18px 0;border:1px solid #262626;border-radius:12px;background-color:#171717;">
            <tr>
                <td style="padding:14px 16px;">
                    <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#f59e0b;line-height:1.2;">
                        Mensaje
                    </div>
                    <div style="margin-top:6px;font-size:14px;line-height:1.6;color:#d4d4d4;white-space:pre-wrap;">
                        {{ $projectInvitation->message }}
                    </div>
                </td>
            </tr>
        </table>
    @endif

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 4px 0;border:1px solid #262626;border-radius:12px;background-color:#171717;">
        <tr>
            <td style="padding:14px 16px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#f59e0b;line-height:1.2;">
                    Invitado por
                </div>
                <div style="margin-top:4px;font-size:15px;font-weight:600;line-height:1.5;color:#fafafa;">
                    {{ $inviter->name }}
                </div>
            </td>
        </tr>
    </table>
</x-email-shell>
