# Proposal: Social Links Onboarding

## Intent

El onboarding actual tiene 4 pasos (techs → bio → avatar → recomendaciones) pero no permite al usuario agregar sus redes sociales. Los social links son esenciales para que otros desarrolladores puedan conocer el trabajo previo de un usuario y conectar fuera de la plataforma.

## Scope

### In Scope
- Migración: tabla `social_links` (id, user_id, platform, url, timestamps)
- Modelo `SocialLink` con relación `belongsTo User`
- Nuevo paso 2.5 en onboarding (después de bio, antes de avatar) → total 5 pasos
- UI: iconos de plataformas (GitHub, LinkedIn, Twitter, Website) + inputs URL con validación por plataforma
- `SocialLinkRequest` FormRequest + `saveSocialLinks` en `OnboardingService`
- Preview de links guardados en el mismo paso (cómo se verán en el perfil)
- Ruta: `POST /onboarding/step-2b`

### Out of Scope
- Edición de social links fuera del onboarding (perfil settings)
- Validación de que la URL exista (no hacer HTTP requests)
- Más plataformas que las 4 definidas
- Social links en la página de perfil público (se hará en cambio futuro)

## Capabilities

### New Capabilities
- `social-links`: Tabla, modelo, relación, CRUD de social links en onboarding. Cubre migración, modelo `SocialLink`, `SocialLinkRequest`, método en `OnboardingService`, paso UI en onboarding.

### Modified Capabilities
- `app`: Onboarding flow cambia de 4 a 5 pasos. `OnboardingController` agrega `saveStep2b`. `OnboardingService` agrega `saveSocialLinks`. Frontend `onboarding/index.tsx` agrega paso intermedio.

## Approach

**Database**: Migración con enum `platform` (github, linkedin, twitter, website). Índice compuesto `(user_id, platform)` UNIQUE para evitar duplicados por plataforma.

**Backend**: `SocialLinkRequest` con validación: platform (required, in:github,linkedin,twitter,website), url (required, url, max:2048). `OnboardingService::saveSocialLinks()` usa `upsert` o `sync` para crear/actualizar.

**Frontend**: Paso nuevo entre bio y avatar. Grid de 4 plataformas con icono + input. Validación en tiempo real con regex por plataforma (GitHub: `github.com/...`, LinkedIn: `linkedin.com/in/...`, Twitter: `x.com/...` o `twitter.com/...`). Preview debajo con links renderizados como badges clickeables.

**Step renumbering**: Los pasos 3 y 4 existentes se convierten en 4 y 5. `totalSteps` pasa de 4 a 5.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `database/migrations/*_create_social_links_table.php` | New | Migración con tabla social_links |
| `app/Models/SocialLink.php` | New | Modelo con fillable, casts, belongsTo User |
| `app/Http/Requests/Onboarding/SaveStep2bRequest.php` | New | Validación de platform + url |
| `app/Services/OnboardingService.php` | Modified | Nuevo método saveSocialLinks |
| `app/Http/Controllers/OnboardingController.php` | Modified | Nuevo método saveStep2b, renumerar pasos 3→4, 4→5 |
| `routes/web.php` | Modified | Nueva ruta POST /onboarding/step-2b |
| `resources/js/pages/onboarding/index.tsx` | Modified | Paso 2.5 UI, totalSteps 5, renumerar pasos |
| `resources/js/types/index.ts` | Modified | Agregar SocialLink al tipo User |
| `app/Models/User.php` | Modified | Relación socialLinks, fillable |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Step renumbering rompe UX si usuario está a mitad de onboarding | Low | `hasCompletedOnboarding` protege; usuarios en medio simplemente ven un paso más |
| Validación de URL muy estricta rechaza URLs válidas | Medium | Validar solo formato URL genérico, no pattern específico por plataforma |
| Iconos de plataformas requieren dependencia externa | Low | Usar SVG inline simples, no agregar librería de iconos |
| Onboarding se vuelve muy largo (5 pasos) | Medium | Paso de social links es opcional (skip disponible) |

## Rollback Plan

1. Revertir migración: `php artisan migrate:rollback --step=1`
2. Revertir commit con `git revert`
3. Los datos de `social_links` se pierden (tabla nueva, sin datos críticos)

## Dependencies

- Ninguna externa. Iconos SVG inline para evitar dependencias.

## Success Criteria

- [ ] Migración `social_links` creada y ejecutable
- [ ] Modelo `SocialLink` con relación a `User`
- [ ] Paso 2.5 visible en onboarding entre bio y avatar
- [ ] URLs válidas se guardan correctamente en DB
- [ ] URLs inválidas muestran error de validación
- [ ] Preview de links renderizado en el paso
- [ ] Onboarding completo con 5 pasos funciona end-to-end
- [ ] Tests de Feature para el nuevo paso passing
