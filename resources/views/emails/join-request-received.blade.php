@php
    /** @var \App\Models\JoinRequest $joinRequest */
    $applicant = $joinRequest->applicant;
    $project = $joinRequest->project;
    $creator = $project->creator;
    $url = route('projects.show', $project->slug);
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Nueva solicitud para {{ $project->title }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f6f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1f1f1f;-webkit-text-size-adjust:100%;">
    <span style="display:none;font-size:1px;color:#f6f6f6;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
        {{ $applicant->name }} quiere unirse a {{ $project->title }}
    </span>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f6f6f6;">
        <tr>
            <td align="center" style="padding:32px 16px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">

                    {{-- Header / Brand --}}
                    <tr>
                        <td style="background-color:#DC4A13;padding:20px 32px;">
                            <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">The Dev House</span>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:32px;">
                            <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#1f1f1f;line-height:1.3;">
                                Nueva solicitud para unirse a tu proyecto
                            </h1>

                            <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#3a3a3a;">
                                Hola <strong>{{ $creator->name }}</strong>,
                            </p>

                            <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#3a3a3a;">
                                <strong>{{ $applicant->name }}</strong> quiere unirse a <strong>{{ $project->title }}</strong>.
                            </p>

                            @if ($joinRequest->message)
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f9f9f9;border-left:3px solid #DC4A13;border-radius:6px;margin:16px 0;">
                                    <tr>
                                        <td style="padding:14px 16px;font-size:14px;line-height:1.6;color:#3a3a3a;font-style:italic;">
                                            {{ $joinRequest->message }}
                                        </td>
                                    </tr>
                                </table>
                            @endif

                            <p style="margin:16px 0 0 0;font-size:14px;line-height:1.6;color:#6b6b6b;">
                                Revisá la solicitud y decidí si querés sumarlo al equipo.
                            </p>

                            {{-- CTA --}}
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 8px 0;">
                                <tr>
                                    <td style="border-radius:8px;background-color:#DC4A13;">
                                        <a href="{{ $url }}" target="_blank" style="display:inline-block;padding:12px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
                                            Ver solicitud
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="padding:20px 32px;background-color:#fafafa;border-top:1px solid #e5e5e5;">
                            <p style="margin:0;font-size:12px;line-height:1.5;color:#8a8a8a;">
                                Recibiste este email porque sos el creador de <strong>{{ $project->title }}</strong> en The Dev House.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
