@php
    /** @var \App\Models\JoinRequest $joinRequest */
    $project = $joinRequest->project;
    $url = route('projects.show', $project->slug);
    $preheader = "Ya podés entrar a {$project->title}";
    $intro = "Tu solicitud fue aprobada. Ya tenés acceso a {$project->title}.";
@endphp

<x-email-shell
    :preheader="$preheader"
    section="Acceso aprobado"
    title="Acceso aprobado"
    :intro="$intro"
    :project-title="$project->title"
    cta-label="Abrir proyecto"
    :cta-url="$url"
    :footer="'Email automático de The Dev House para ' . $project->title . '.'"
>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0;">
        <tr>
            <td style="padding:0;border-radius:12px;background-color:#ffffff;">
                <div style="font-size:14px;line-height:1.6;color:#334155;">
                    Ya figurás dentro del equipo y podés entrar al proyecto cuando quieras.
                </div>
            </td>
        </tr>
    </table>
</x-email-shell>
