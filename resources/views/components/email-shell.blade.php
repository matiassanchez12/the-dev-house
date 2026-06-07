@props([
    'brand' => 'The Dev House',
    'preheader' => '',
    'eyebrow' => 'SYSTEM NOTIFICATION',
    'section' => 'Notification',
    'title' => '',
    'intro' => '',
    'projectLabel' => 'Proyecto',
    'projectTitle' => null,
    'ctaLabel' => null,
    'ctaUrl' => null,
    'footer' => 'Email automático de The Dev House.',
])
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>{{ $title }}</title>
</head>
<body style="margin:0;padding:0;background-color:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#e2e8f0;-webkit-text-size-adjust:100%;">
    <span style="display:none;font-size:1px;color:#020617;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
        {{ $preheader }}
    </span>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#020617;">
        <tr>
            <td align="center" style="padding:32px 16px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:640px;background-color:#0b1220;border-radius:16px;overflow:hidden;border:1px solid #1f2937;">
                    <tr>
                        <td style="background-color:#020617;padding:18px 28px;border-bottom:1px solid #1f2937;">
                            <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#64748b;line-height:1.2;">
                                {{ $eyebrow }}
                            </div>
                            <div style="margin-top:6px;font-size:18px;font-weight:600;color:#f8fafc;line-height:1.2;">
                                {{ $brand }}
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:28px;">
                            <div style="font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#94a3b8;line-height:1.2;">
                                {{ $section }}
                            </div>

                            <h1 style="margin:10px 0 14px 0;font-size:24px;font-weight:650;line-height:1.25;letter-spacing:-0.03em;color:#f8fafc;">
                                {{ $title }}
                            </h1>

                            @if ($intro)
                                <p style="margin:0 0 18px 0;font-size:15px;line-height:1.6;color:#cbd5e1;">
                                    {{ $intro }}
                                </p>
                            @endif

                            @if ($projectTitle)
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 18px 0;border:1px solid #1f2937;border-radius:12px;background-color:#111827;">
                                    <tr>
                                        <td style="padding:14px 16px;">
                                            <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#94a3b8;line-height:1.2;">
                                                {{ $projectLabel }}
                                            </div>
                                            <div style="margin-top:4px;font-size:15px;font-weight:600;line-height:1.5;color:#f8fafc;word-break:break-word;">
                                                {{ $projectTitle }}
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            @endif

                            {{ $slot }}

                            @if ($ctaUrl && $ctaLabel)
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 0 0;">
                                    <tr>
                                        <td style="border-radius:10px;background-color:#38bdf8;">
                                            <a href="{{ $ctaUrl }}" target="_blank" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:700;color:#020617;text-decoration:none;border-radius:10px;">
                                                {{ $ctaLabel }}
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            @endif
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:18px 28px 22px;background-color:#020617;border-top:1px solid #1f2937;">
                            <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">
                                {{ $footer }}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
