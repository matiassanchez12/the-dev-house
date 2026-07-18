@props([
    'brand' => 'The Dev House',
    'preheader' => '',
    'eyebrow' => null,
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
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:'Onest Variable','Geist Variable',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#e5e5e5;-webkit-text-size-adjust:100%;">
    <span style="display:none;font-size:1px;color:#020617;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
        {{ $preheader }}
    </span>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#0a0a0a;">
        <tr>
            <td align="center" style="padding:32px 16px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="640" style="max-width:640px;background-color:#111111;border-radius:16px;overflow:hidden;border:1px solid #262626;">
                    <tr>
                        <td style="background-color:#111111;padding:20px 28px;border-bottom:1px solid #262626;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td valign="middle" style="width:48px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="40" height="40" style="width:40px;height:40px;border-radius:12px;background-color:#171717;border:1px solid #262626;">
                                            <tr>
                                                <td align="center" valign="middle">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="22" height="22" role="img" aria-label="The Dev House" style="display:block;color:#f59e0b;fill:#f59e0b;">
                                                        <path d="M5 24 L20 9 L35 24 V38 H5 Z" />
                                                        <path d="M14 26 L10 32 L14 38" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                        <path d="M26 26 L30 32 L26 38" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                        <path d="M22 24 L16 38" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                                                    </svg>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td valign="middle" style="padding-left:12px;">
                                        <div style="font-size:18px;font-weight:700;color:#fafafa;line-height:1.2;">
                                            {{ $brand }}
                                        </div>
                                        @if ($eyebrow)
                                            <div style="margin-top:4px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#a3a3a3;line-height:1.2;">
                                                {{ $eyebrow }}
                                            </div>
                                        @endif
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:28px;">
                            <div style="font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#f59e0b;line-height:1.2;">
                                {{ $section }}
                            </div>

                            <h1 style="margin:10px 0 14px 0;font-size:24px;font-weight:650;line-height:1.25;letter-spacing:-0.03em;color:#fafafa;">
                                {{ $title }}
                            </h1>

                            @if ($intro)
                                <p style="margin:0 0 18px 0;font-size:15px;line-height:1.6;color:#d4d4d4;">
                                    {{ $intro }}
                                </p>
                            @endif

                            @if ($projectTitle)
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 18px 0;border:1px solid #262626;border-radius:12px;background-color:#171717;">
                                    <tr>
                                        <td style="padding:14px 16px;">
                                            <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#f59e0b;line-height:1.2;">
                                                {{ $projectLabel }}
                                            </div>
                                            <div style="margin-top:4px;font-size:15px;font-weight:600;line-height:1.5;color:#fafafa;word-break:break-word;">
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
                                        <td style="border-radius:10px;background-color:#d97706;">
                                            <a href="{{ $ctaUrl }}" target="_blank" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:700;color:#111111;text-decoration:none;border-radius:10px;">
                                                {{ $ctaLabel }}
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            @endif
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:18px 28px 22px;background-color:#111111;border-top:1px solid #262626;">
                            <p style="margin:0;font-size:12px;line-height:1.5;color:#a3a3a3;">
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
