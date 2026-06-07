# The Dev House

Plataforma de colaboración para desarrolladores. Construida con Laravel 12, React, TypeScript e Inertia.js.

---

## 🎯 Stack Tecnológico

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **PHP** | 8.2+ | Lenguaje base |
| **Laravel** | 12.x | Framework backend |
| **MySQL** | 8.4 | Base de datos principal |
| **Redis** | Alpine | Cache y colas |
| **Laravel Reverb** | 1.10+ | WebSockets (tiempo real) |
| **Mailpit** | latest | Email testing (desarrollo) |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **TypeScript** | 6.0+ | Lenguaje con tipos |
| **React** | 18.2+ | Framework UI |
| **Inertia.js** | 2.0+ | Puente Laravel ↔ React |
| **Tailwind CSS** | 3.2+ | Estilos |
| **Shadcn/ui** | 4.7+ | Componentes UI |
| **Vite** | 7.0+ | Build tool |

### DevOps & Testing
| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **Laravel Sail** | 1.41+ | Docker para desarrollo |
| **PHPUnit** | 11.5+ | Testing (TDD obligatorio) |

---

## Requirements

- Docker Desktop (with WSL2 backend on Windows)
- Git

## Quick Start

```bash
# Clone and enter the project
git clone https://github.com/matiassanchez12/the-dev-house.git
cd the-dev-house

# Download sail and install php deps in docker
docker run --rm \
-u "$(id -u):$(id -g)" \
-v "$(pwd):/var/www/html" \
-w /var/www/html \
laravelsail/php83-composer:latest \
composer install --ignore-platform-reqs

cp .env.example .env

# Start containers — setup runs automatically (migrations, seeders, npm build)
docker compose up -d

# utils 
sudo chown -R $USER:$USER .

npx autoskills

./vendor/bin/sail npm i
./vendor/bin/sail npm run dev
```

## API Documentation

REST API documentation is available at http://localhost/docs/api.

**Accesos con Sail**:

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| Aplicación | http://localhost | - |
| Reverb WebSocket | ws://localhost:8080 | - |
| Mailpit Dashboard | http://localhost:8025 | - |
| MySQL | localhost:3306 | sail / password |
| Redis | localhost:6379 | - |

---

### Opción B: Servidor Local (Sin Docker)

**Prerrequisitos**:
- PHP 8.2+ instalado localmente
- MySQL 8.4+ o MariaDB
- Redis instalado y corriendo
- Node.js 20+
- Composer

**Pasos**:

```bash
# 1. Clonar el repositorio
git clone <repo-url>
cd dev-collab-platform

# 2. Copiar y configurar .env
cp .env.example .env

# 3. Editar .env para configuración local:
# - DB_CONNECTION=mysql
# - DB_HOST=127.0.0.1
# - DB_PORT=3306
# - DB_DATABASE=dev_collab
# - DB_USERNAME=tu_usuario
# - DB_PASSWORD=tu_password
# - REDIS_HOST=127.0.0.1
# - REDIS_PORT=6379

# 4. Instalar dependencias
composer install
npm install

# 5. Generar APP_KEY
php artisan key:generate

# 6. Crear base de datos manualmente
mysql -u root -p -e "CREATE DATABASE dev_collab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 7. Correr migraciones
php artisan migrate

# 8. (Opcional) Seedear datos
php artisan db:seed

# 9. Iniciar servidores en paralelo
composer run dev
```

**Comando `composer run dev` inicia**:
- Servidor Laravel (puerto 8000)
- Cola de trabajos (queue worker)
- Logger en tiempo real (Pail)
- Vite (hot reload)

**Accesos local**:

| Servicio | URL |
|----------|-----|
| Aplicación | http://localhost:8000 |
| Vite Dev | http://localhost:5173 |

---

## 📁 Estructura del Proyecto

```
dev-collab-platform/
├── app/
│   ├── Http/
│   │   ├── Controllers/      # Controllers (ProjectController, etc.)
│   │   └── Requests/         # Validaciones form-request
│   ├── Models/               # Modelos Eloquent
│   └── Broadcasting/         # Canales WebSocket
├── database/
│   ├── factories/            # Factories para tests
│   ├── migrations/           # Migraciones de DB
│   └── seeders/              # Seeders iniciales
├── resources/
│   ├── js/
│   │   ├── Components/       # Componentes reutilizables
│   │   ├── Pages/            # Páginas Inertia
│   │   ├── Layouts/          # Layouts (authenticated, guest)
│   │   └── types/            # Tipos TypeScript
│   └── views/                # Blade templates
├── routes/
│   └── web.php               # Rutas de la app
├── tests/
│   ├── Feature/              # Tests de integración
│   └── Unit/                 # Tests unitarios
├── DOCS.md                   # Documentación detallada del workflow
└── README.md                 # Este archivo
```

---

## 🧪 Testing (TDD Obligatorio)

Este proyecto sigue **Test Driven Development**. Siempre escribir tests PRIMERO.

```bash
# Correr todos los tests
php artisan test

# Correr tests específicos
php artisan test --filter ProjectTest

# Correr con coverage
php artisan test --coverage

# Crear nuevo test
php artisan make:test Feature/ProjectTest
```

**Ciclo TDD**:
1. 🔴 **Rojo**: Escribir test que falla
2. 🟢 **Verde**: Implementar mínimo código para que pase
3. 🟡 **Refactor**: Mejorar código manteniendo tests verdes

---

## 🔧 Comandos Útiles

### Con Sail
```bash
./vendor/bin/sail up -d              # Levantar Docker
./vendor/bin/sail down               # Detener Docker
./vendor/bin/sail artisan migrate    # Correr migraciones
./vendor/bin/sail artisan test       # Correr tests
./vendor/bin/sail composer install   # Instalar dependencias PHP
```

### Local
```bash
composer run dev                     # Iniciar todos los servicios
composer run test                    # Correr tests
php artisan migrate                  # Migrar DB
php artisan db:seed                  # Seedear datos
```

### Frontend
```bash
npm run dev                          # Vite en modo desarrollo
npm run build                        # Build para producción
```

---

## 📝 Convenciones de Código

### TypeScript
- **Estricto**: NO usar `any` a menos que sea absolutamente necesario
- Tipos definidos en `resources/js/types/index.ts`
- Interfaces explícitas en todos los componentes

### Naming (Frontend)
| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Archivo | kebab-case | `authenticated-layout.tsx` |
| Componente | PascalCase | `AuthenticatedLayout` |
| Funciones/Variables | camelCase | `handleSubmit` |

### Backend
- Controllers: `ProjectController`
- Models: `Project`, `Tech`, `User`
- Tests: `ProjectTest.php` con método `test_can_[accion]_[entidad]`

---

## 🏗️ Arquitectura

### Decisiones Clave

1. **Enfoque evolutivo**: Empezamos mínimo, agregamos complejidad cuando sea necesario. NO hacer over-engineering prematuro.

2. **Base de datos normalizada**: Tablas separadas para techs (`techs`, `project_tech`, `user_tech`). NO usar campos ARRAY/JSON.

3. **Inertia.js**: SPA sin API REST. Laravel renderiza React directamente.

4. **TDD obligatorio**: Tests ANTES del código. Coverage mínimo 80% en features críticos.

---

## 📌 Features Principales

### Autenticación
- ✅ Registro / Login / Logout
- ✅ Verificación de email
- ✅ Reset de password

### Proyectos
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Filtrar por tecnología y estado
- ✅ Upload de imágenes
- ✅ Slug automático único

### En Desarrollo
- 🔲 Sistema de Join Requests
- ✅ Chat en tiempo real (Reverb + Echo)
- 🔲 Perfil de usuario con avatar
- 🔲 Notificaciones por email

---

## 🐛 Troubleshooting

### Error: "Unable to locate file in Vite manifest"
```bash
# Limpiar cache de vistas
php artisan view:clear
rm -rf storage/framework/views/*
```

### Error: "Call to undefined method Model::factory()"
Agregar `use HasFactory;` al modelo.

### Error: "Unable to connect to MySQL"
Verificar que el contenedor esté corriendo:
```bash
./vendor/bin/sail up -d
./vendor/bin/sail logs mysql
```

### Error: "Redis connection failed"
Asegurarse de que Redis esté corriendo:
```bash
# Con Sail
./vendor/bin/sail up -d redis

# Local
redis-server
```

---

## 📚 Documentación Adicional

- **[DOCS.md](./DOCS.md)** - Workflow de desarrollo, convenciones detalladas, TDD guide
- **[Laravel Docs](https://laravel.com/docs)** - Documentación oficial
- **[Inertia.js Docs](https://inertiajs.com/docs)** - Guía de Inertia
- **[React Docs](https://react.dev/)** - Documentación de React

---

## 🤝 Contribuir

1. Leer [DOCS.md](./DOCS.md) completo
2. Crear branch desde `main`
3. Escribir tests PRIMERO (TDD)
4. Implementar feature
5. Asegurarse que todos los tests pasan
6. Crear PR con descripción clara

---

## 📄 Licencia

MIT License. Ver [LICENSE](./LICENSE) para más detalles.

---

**Última actualización**: Mayo 2026  
**Mantenido por**: El equipo de desarrollo
