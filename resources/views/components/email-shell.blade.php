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
<body style="margin:0;padding:0;background-color:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0f172a;-webkit-text-size-adjust:100%;">
    <span style="display:none;font-size:1px;color:#eef2f7;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
        {{ $preheader }}
    </span>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#eef2f7;">
        <tr>
            <td align="center" style="padding:32px 16px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:640px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dbe3ee;">
                    <tr>
                        <td style="background-color:#0f172a;padding:18px 28px;">
                            <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#94a3b8;line-height:1.2;">
                                {{ $eyebrow }}
                            </div>
                            <div style="margin-top:6px;font-size:18px;font-weight:600;color:#ffffff;line-height:1.2;">
                                {{ $brand }}
                            </div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:28px;">
                            <div style="font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;line-height:1.2;">
                                {{ $section }}
                            </div>

                            <h1 style="margin:10px 0 14px 0;font-size:24px;font-weight:650;line-height:1.25;letter-spacing:-0.03em;color:#0f172a;">
                                {{ $title }}
                            </h1>

                            @if ($intro)
                                <p style="margin:0 0 18px 0;font-size:15px;line-height:1.6;color:#334155;">
                                    {{ $intro }}
                                </p>
                            @endif

                            @if ($projectTitle)
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 18px 0;border:1px solid #dbe3ee;border-radius:12px;background-color:#f8fafc;">
                                    <tr>
                                        <td style="padding:14px 16px;">
                                            <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;line-height:1.2;">
                                                {{ $projectLabel }}
                                            </div>
                                            <div style="margin-top:4px;font-size:15px;font-weight:600;line-height:1.5;color:#0f172a;word-break:break-word;">
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
                                        <td style="border-radius:10px;background-color:#0f172a;">
                                            <a href="{{ $ctaUrl }}" target="_blank" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">
                                                {{ $ctaLabel }}
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            @endif
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:18px 28px 22px;background-color:#f8fafc;border-top:1px solid #e5e7eb;">
                            <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b;">
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
