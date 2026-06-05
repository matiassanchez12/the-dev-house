@php
    /** @var \App\Models\JoinRequest $joinRequest */
    $project = $joinRequest->project;
    $url = route('projects.index');
    $preheader = "La solicitud para {$project->title} no avanzó";
    $intro = "El equipo decidió seguir con otro perfil para {$project->title}.";
@endphp

<x-email-shell
    :preheader="$preheader"
    section="Solicitud cerrada"
    title="Solicitud no aprobada"
    :intro="$intro"
    :project-title="$project->title"
    cta-label="Explorar proyectos"
    :cta-url="$url"
    :footer="'Email automático de The Dev House para ' . $project->title . '.'"
>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0;">
        <tr>
            <td style="padding:0;border-radius:12px;background-color:#ffffff;">
                <div style="font-size:14px;line-height:1.6;color:#334155;">
                    Si querés seguir aplicando, podés revisar otros proyectos abiertos.
                </div>
            </td>
        </tr>
    </table>
</x-email-shell>
