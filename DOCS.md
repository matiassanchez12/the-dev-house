# Dev Collab Platform - Workflow de Desarrollo

> **Objetivo**: Este documento establece las convenciones, preferencias y workflow para que cualquier desarrollador (humano o AI) pueda colaborar consistentemente en este proyecto.

---

## 🎯 Stack Tecnológico

### Backend
- **Framework**: Laravel 12.x
- **Base de datos**: MySQL 8.4 (vía Docker Sail)
- **Cache/Colas**: Redis
- **WebSockets**: Laravel Reverb
- **Email**: Mailpit (desarrollo)

### Frontend
- **Lenguaje**: TypeScript (estricto, con tipos definidos)
- **Framework**: React 18+ con Inertia.js
- **UI**: Tailwind CSS + Shadcn/ui
- **Build**: Vite
- **Estado**: React hooks (no se usa Redux/Zustand por ahora)

### Infraestructura
- **Docker**: Laravel Sail (MySQL, Redis, Mailpit)
- **Testing**: PHPUnit 11.x (TDD obligatorio)

---

## 🏗️ Arquitectura

### Decisiones Clave

1. **Enfoque evolutivo (Opción B)**: 
   - Empezamos mínimo, agregamos complejidad cuando sea necesario
   - Clean Architecture se agregará cuando la lógica de negocio lo justifique
   - **NO** hacer over-engineering prematuro

2. **Base de datos normalizada**:
   - ✅ Tablas separadas para techs (`techs`, `project_tech`, `user_tech`)
   - ❌ **NO** usar campos ARRAY/JSON para relaciones
   - **Por qué**: Queries eficientes, integridad referencial, reporting futuro

3. **TypeScript estricto**:
    - Todos los archivos `.tsx` con tipos definidos
    - Interfaces en `resources/js/types/index.ts`
    - **NO** usar `any` a menos que sea absolutamente necesario

4. **Naming Convention (Frontend)**:
    - **kebab-case** para nombres de archivos: `authenticated-layout.tsx`, `primary-button.tsx`
    - **PascalCase** para nombres de componentes dentro del archivo: `export default function AuthenticatedLayout()`
    - Ejemplo: `resources/js/Layouts/authenticated-layout.tsx` exporta `AuthenticatedLayout`

5. **TDD (Test Driven Development)**:
   - **OBLIGATORIO** escribir tests ANTES del código
   - Ciclo: 🔴 Rojo (test falla) → 🟢 Verde (test pasa) → 🟡 Refactor
   - Tests en `tests/Feature/` para endpoints
   - Coverage mínimo: 80% en features críticos

---

## 📝 Convenciones de Código

### Backend (Laravel)

#### Controllers
```php
class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Validación primero
        // Lógica después
        // Retorno Inertia al final
    }
}
```

#### Validaciones
- Usar arrays con reglas explícitas
- Mensajes custom solo si el default no es claro
- FormRequest classes para validaciones complejas (>10 reglas)

#### Modelos
```php
class Project extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'user_id',
        'title',
        // ... ordenados alfabéticamente
    ];
    
    protected $casts = [
        'images' => 'array',
        'created_at' => 'datetime',
    ];
    
    // Relaciones primero, métodos después
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
```

#### Tests (PHPUnit)
```php
public function test_can_create_project(): void
{
    // Arrange
    Storage::fake('public');
    $user = User::factory()->create();
    
    // Act
    $response = $this->actingAs($user)->post('/projects', $data);
    
    // Assert
    $response->assertRedirect();
    $this->assertDatabaseHas('projects', ['title' => 'Test']);
}
```

**Reglas**:
1. Nombre del test: `test_can_[acción]_[entidad]` o `test_cannot_[acción]_[entidad]`
2. estructura AAA: **Arrange** → **Act** → **Assert**
3. Un assert por concepto (puede haber múltiples asserts en un test)
4. Usar `RefreshDatabase` para aislar tests

### Frontend (React + TypeScript)

#### Componentes

**Archivo**: `resources/js/Layouts/authenticated-layout.tsx`

```tsx
interface Props {
    auth: {
        user: User | null;
    };
    projects: Project[];
}

export default function AuthenticatedLayout({ auth, children }: Props) {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Layout content */}
        </div>
    );
}
```

**Reglas**:
1. **kebab-case** para el nombre del archivo: `authenticated-layout.tsx`, `primary-button.tsx`
2. **PascalCase** para el nombre del componente: `export default function AuthenticatedLayout()`
3. Tipos explícitos en props (NO usar `any`)
4. Componentes pequeños (<100 líneas idealmente)
5. Custom hooks para lógica reutilizable
6. Shadcn/ui para componentes de UI

#### Estados
```tsx
const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    techs: [] as number[],
});
```

---

## 🧪 Workflow de Testing (TDD)

### Paso a Paso

1. **Escribir el test PRIMERO** (fase 🔴 ROJA)
   ```bash
   php artisan make:test ProjectTest
   ```

2. **Correr el test y ver que falla**
   ```bash
   php artisan test --filter ProjectTest
   ```

3. **Implementar el mínimo código para que pase** (fase 🟢 VERDE)

4. **Refactorizar** (fase 🟡 AMARILLA)
   - Mejorar nombres
   - Extraer métodos
   - Eliminar duplicación

5. **Repetir** para cada feature

### Comandos Útiles

```bash
# Correr todos los tests
php artisan test

# Correr tests de un archivo
php artisan test --filter ProjectTest

# Correr tests con coverage
php artisan test --coverage

# Correr tests en modo watch (desarrollo)
npm run test:watch
```

---

## 🚀 Setup del Proyecto

### Prerrequisitos
- Docker Desktop instalado
- PHP 8.2+ (local, opcional)
- Node.js 20+
- Composer

### Instalación

```bash
# 1. Clonar repo
git clone <repo-url>
cd dev-collab-platform

# 2. Instalar dependencias PHP
composer install

# 3. Configurar variables de entorno
cp .env.example .env
php artisan key:generate

# 4. Levantar Docker
./vendor/bin/sail up -d

# 5. Correr migraciones
./vendor/bin/sail artisan migrate

# 6. Seedear datos iniciales
./vendor/bin/sail artisan db:seed

# 7. Instalar dependencias Node
npm install

# 8. Iniciar Vite (desarrollo)
npm run dev
```

### Accesos

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| App | http://localhost | - |
| Mailpit | http://localhost:8025 | - |
| MySQL | localhost:3306 | sail / password |
| Redis | localhost:6379 | - |

**Usuario de prueba**:
- Email: `test@example.com`
- Password: `password`

---

## 📁 Estructura del Proyecto

```
dev-collab-platform/
├── app/
│   ├── Http/
│   │   ├── Controllers/      # Controllers (ProjectController, etc.)
│   │   └── Requests/         # Form Requests (validaciones)
│   ├── Models/               # Eloquent models (Project, Tech, User)
│   └── Broadcasting/         # Channels para WebSockets
├── database/
│   ├── factories/            # Factories para tests
│   ├── migrations/           # Migraciones de DB
│   └── seeders/              # Seeders (TechSeeder)
├── resources/
│   ├── js/
│   │   ├── Components/       # kebab-case: primary-button.tsx, input-label.tsx
│   │   ├── Pages/            # kebab-case: confirm-password.tsx, reset-password.tsx
│   │   ├── Layouts/          # kebab-case: authenticated-layout.tsx, guest-layout.tsx
│   │   └── types/            # Tipos TypeScript
│   └── views/                # Blade views (app.blade.php)
├── routes/
│   └── web.php               # Rutas de la aplicación
├── tests/
│   ├── Feature/              # Tests de integración (ProjectTest.php)
│   └── Unit/                 # Tests unitarios
└── DOCS.md                   # ESTE ARCHIVO
```

---

## ✅ Features Implementadas

### Autenticación
- ✅ Registro de usuarios
- ✅ Login/Logout
- ✅ Verificación de email
- ✅ Reset de password

### Proyectos (CRUD)
- ✅ Listar proyectos (público)
- ✅ Filtrar por tecnología
- ✅ Filtrar por estado
- ✅ Crear proyecto (auth required)
- ✅ Ver detalle de proyecto (público)
- ✅ Editar proyecto (solo creator)
- ✅ Eliminar proyecto (solo creator)
- ✅ Upload de imágenes
- ✅ Tech stack selection
- ✅ Slug automático único

### Tests
- ✅ 16 tests para Projects (7 passing, 9 pending fix)
- ✅ Factories: User, Project, Tech
- ✅ RefreshDatabase para aislamiento

---

## 🔲 Features Pendientes

### Prioridad Alta
- [ ] **Pages/Show.tsx** - Detalle de proyecto
- [ ] **Pages/Edit.tsx** - Formulario de edición
- [ ] Fix tests fallantes (9 tests)
- [ ] **JoinRequest** - Sistema de solicitudes para unirse

### Prioridad Media
- [ ] **Perfil de usuario** - Editar bio, avatar, tech stack
- [ ] **Chat** - Implementar con Reverb + Laravel Echo
- [ ] **Notificaciones** - Emails al aprobar/rechazar solicitudes

### Prioridad Baja
- [ ] **Dashboard** - Métricas para creators
- [ ] **Búsqueda** - Full-text search en proyectos
- [ ] **AWS S3** - Migrar imágenes de storage local a S3

---

## 🤔 Decisiones de Diseño

### Por qué NO Clean Architecture (todavía)
- MVP inicial no justifica el overhead
- Lógica de negocio simple por ahora
- **Trigger para migrar**: Cuando haya 5+ casos de uso complejos o reglas de negocio que cambien frecuentemente

### Por qué TypeScript + Shadcn/ui
- Type safety previene bugs en runtime
- Shadcn/ui es copy-paste (sin vendor lock-in)
- Tailwind permite customización total
- **Alternativa considerada**: Chakra UI (descartado por bundle size)

### Por qué Reverb y no Pusher
- Gratis para desarrollo/MVP
- Self-hosted (control total)
- Misma API que Pusher (migración fácil después)
- **Trigger para migrar**: 100+ usuarios concurrentes o necesidad de edge servers

---

## 🐛 Problemas Comunes y Soluciones

### "Unable to locate file in Vite manifest"
**Causa**: Vista compilada cacheada con nombre viejo
**Solución**:
```bash
docker-compose exec laravel.test rm -rf storage/framework/views/*
docker-compose exec laravel.test php artisan view:clear
```

### "Call to undefined method Model::factory()"
**Causa**: Modelo no tiene `HasFactory`
**Solución**: Agregar `use HasFactory;` al modelo

### Error de sintaxis en controller
**Causa**: Llaves `}` duplicadas o métodos incompletos
**Solución**:
```bash
docker-compose exec laravel.test php -l app/Http/Controllers/ProjectController.php
```

### Tests fallan por "Tech::factory() not found"
**Causa**: Factory no existe o modelo no tiene `HasFactory`
**Solución**:
1. `php artisan make:factory TechFactory`
2. Agregar `use HasFactory;` al modelo

---

## 👥 Workflow para Nuevos Desarrolladores

### Primer día
1. Leer ESTE archivo completo
2. Setup del proyecto (ver sección "Instalación")
3. Correr tests: `php artisan test` (deben pasar)
4. Explorar código existente

### Antes de hacer un PR
1. Escribir tests PRIMERO (TDD)
2. Implementar feature
3. Asegurarse que todos los tests pasan
4. Verificar que no hay código duplicado
5. Actualizar este documento si corresponde

### Convenciones de Git
```bash
# Commits atómicos (un cambio por commit)
git commit -m "feat: crear endpoint para listar proyectos"
git commit -m "test: agregar tests para ProjectController::index"
git commit -m "fix: validar que techs sea array no vacío"

# NO hacer
git commit -m "arreglé un montón de cosas y agregué tests"
```

---

## 📞 Contacto y Soporte

Si tenés dudas sobre:
- **Arquitectura**: Revisar sección "Decisiones de Diseño"
- **Tests**: Ver ejemplos en `tests/Feature/ProjectTest.php`
- **TypeScript**: Ver tipos en `resources/js/types/index.ts`

---

## 📈 Próximos Pasos (Roadmap)

### Semana 1
- [ ] Fix tests fallantes
- [ ] Completar CRUD (Show, Edit pages)
- [ ] Sistema de Join Requests

### Semana 2
- [ ] Perfil de usuario
- [ ] Chat en tiempo real
- [ ] Notificaciones por email

### Semana 3
- [ ] Dashboard de métricas
- [ ] Búsqueda avanzada
- [ ] Deploy a AWS

---

**Última actualización**: 17 de Mayo 2026  
**Mantenido por**: El equipo de desarrollo

---

## 🎓 Aprendizajes Clave

1. **TDD duele al principio pero ahorra horas después**
2. **TypeScript previene bugs tontos** (props mal tipeados, etc.)
3. **Docker hace que el setup sea reproducible** (pero WSL en Windows puede dar problemas)
4. **Documentar mientras se desarrolla** es más fácil que documentar después
5. **Laravel + Inertia + React** es un stack productivo pero requiere entender bien los 3 lados

---

> **Nota para agentes AI**: Si estás leyendo esto, seguí las convenciones de este documento. El usuario valora la calidad, TDD, y TypeScript estricto. **NO** tomar atajos. **SIEMPRE** escribir tests primero.
