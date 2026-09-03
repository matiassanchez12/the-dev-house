<?php

namespace Database\Seeders;

use App\Models\ProjectIdea;
use App\Models\Tech;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class ProjectIdeaSeeder extends Seeder
{
    /**
     * Directory holding the `<slug>.webp` illustration sources. Overridable so
     * tests can point at an isolated fixture dir instead of the committed assets.
     */
    public static ?string $illustrationSourceDir = null;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $timestamp = now();
        $ideas = $this->ideas();

        $existing = ProjectIdea::query()->pluck('illustration_path', 'slug');
        $illustrations = $this->syncIllustrations(array_column($ideas, 'slug'), $existing);

        $rows = array_map(
            fn (array $idea): array => [
                'slug' => $idea['slug'],
                'title' => $idea['title'],
                'summary' => $idea['summary'],
                'category' => $idea['category'],
                'difficulty' => $idea['difficulty'],
                'prefill_title' => $idea['title'],
                'prefill_description' => $idea['prefill_description'],
                'prefill_vision' => $idea['prefill_vision'],
                'illustration_path' => $illustrations[$idea['slug']] ?? null,
                'is_published' => true,
                'sort_order' => $idea['sort_order'],
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ],
            $ideas,
        );

        ProjectIdea::query()->upsert(
            $rows,
            ['slug'],
            [
                'title', 'summary', 'category', 'difficulty', 'prefill_title',
                'prefill_description', 'prefill_vision', 'illustration_path',
                'is_published', 'sort_order', 'updated_at',
            ],
        );

        $allSlugs = Collection::make($ideas)
            ->pluck('techs')
            ->flatten()
            ->unique()
            ->all();

        $techIds = Tech::query()->whereIn('slug', $allSlugs)->pluck('id', 'slug');

        foreach ($ideas as $idea) {
            ProjectIdea::query()->where('slug', $idea['slug'])->first()
                ?->techs()->syncWithoutDetaching(
                    $techIds->only($idea['techs'])->values()->all()
                );
        }
    }

    /**
     * Copy every present source asset to the media disk and resolve the stored
     * path per slug. A missing source preserves whatever the row already had, so
     * a removed asset never nulls a live column.
     *
     * @param  array<int, string>  $slugs
     * @param  Collection<string, string|null>  $existing
     * @return array<string, string|null>
     */
    private function syncIllustrations(array $slugs, Collection $existing): array
    {
        $disk = config('filesystems.media_disk', 'public');
        $sourceDir = self::$illustrationSourceDir ?? database_path('seeders/assets/project-ideas');
        $resolved = [];

        foreach ($slugs as $slug) {
            $source = "{$sourceDir}/{$slug}.webp";

            if (! is_file($source)) {
                $resolved[$slug] = $existing[$slug] ?? null;

                continue;
            }

            Storage::disk($disk)->put(
                "project-ideas/{$slug}.webp",
                (string) file_get_contents($source),
            );
            $resolved[$slug] = "project-ideas/{$slug}.webp";
        }

        return $resolved;
    }

    /**
     * The curated catalog of project ideas.
     *
     * `summary` is one Spanish sentence (<= 200 chars); `prefill_description`
     * is two Spanish sentences kept well under 1000 chars so a prefilled
     * description always passes StoreProjectRequest's `max:1000` rule.
     *
     * @return array<int, array<string, mixed>>
     */
    private function ideas(): array
    {
        return [
            [
                'slug' => 'cli-scaffold-proyectos',
                'title' => 'CLI para scaffolding de proyectos',
                'category' => 'herramientas-dev',
                'difficulty' => 'avanzado',
                'sort_order' => 1,
                'techs' => ['go', 'typescript', 'git'],
                'summary' => 'Una herramienta de línea de comandos que genera la estructura inicial de un proyecto a partir de plantillas configurables.',
                'prefill_description' => 'Construye una CLI que cree carpetas, archivos base y configuración a partir de plantillas parametrizables. Incluye un sistema de plugins para que cada equipo adapte los generadores a sus convenciones.',
                'prefill_vision' => 'Que cualquier equipo arranque un proyecto nuevo con su estándar en segundos y sin copiar código a mano.',
            ],
            [
                'slug' => 'dashboard-metricas-repos',
                'title' => 'Dashboard de métricas de repositorios',
                'category' => 'herramientas-dev',
                'difficulty' => 'intermedio',
                'sort_order' => 2,
                'techs' => ['react', 'nodejs', 'rest-api'],
                'summary' => 'Un panel que reúne métricas de actividad, pull requests y tiempos de revisión de varios repositorios en una sola vista.',
                'prefill_description' => 'Conecta con la API de un proveedor de git y agrega commits, PRs abiertos y tiempo medio de merge por repositorio. Presenta tendencias semanales y alertas cuando una métrica se degrada.',
                'prefill_vision' => 'Que un equipo entienda de un vistazo la salud de su flujo de entrega y detecte cuellos de botella a tiempo.',
            ],
            [
                'slug' => 'gestor-snippets-equipo',
                'title' => 'Gestor de snippets para equipos',
                'category' => 'herramientas-dev',
                'difficulty' => 'principiante',
                'sort_order' => 3,
                'techs' => ['typescript', 'react', 'postgresql'],
                'summary' => 'Una biblioteca compartida de fragmentos de código con búsqueda, etiquetas y control de quién puede editarlos.',
                'prefill_description' => 'Permite guardar snippets con lenguaje, descripción y etiquetas, y buscarlos por texto completo. Cada equipo tiene su espacio privado y puede marcar snippets como favoritos.',
                'prefill_vision' => 'Que el conocimiento útil del equipo deje de vivir en chats sueltos y esté disponible cuando se necesita.',
            ],
            [
                'slug' => 'clon-trello-kanban',
                'title' => 'Clon de Trello para gestión kanban',
                'category' => 'clones',
                'difficulty' => 'intermedio',
                'sort_order' => 1,
                'techs' => ['react', 'laravel', 'postgresql'],
                'summary' => 'Un tablero kanban con listas, tarjetas arrastrables, etiquetas y asignación de responsables por tarjeta.',
                'prefill_description' => 'Implementa tableros con columnas ordenables y tarjetas que se mueven con arrastrar y soltar. Agrega comentarios, fechas de entrega y filtros por responsable o etiqueta.',
                'prefill_vision' => 'Que un equipo pequeño organice su trabajo visualmente sin depender de una herramienta externa.',
            ],
            [
                'slug' => 'clon-spotify-reproductor',
                'title' => 'Clon de Spotify enfocado en el reproductor',
                'category' => 'clones',
                'difficulty' => 'avanzado',
                'sort_order' => 2,
                'techs' => ['nextjs', 'typescript', 'tailwind'],
                'summary' => 'Un reproductor de música con cola de reproducción, controles persistentes y listas creadas por el usuario.',
                'prefill_description' => 'Construye la experiencia de reproducción: barra fija con play, siguiente y progreso, más una cola editable. Incluye playlists propias y persistencia del estado de reproducción entre páginas.',
                'prefill_vision' => 'Que la navegación nunca corte la música y el reproductor se sienta fluido en cualquier pantalla.',
            ],
            [
                'slug' => 'clon-twitter-hilos',
                'title' => 'Clon de Twitter centrado en hilos',
                'category' => 'clones',
                'difficulty' => 'intermedio',
                'sort_order' => 3,
                'techs' => ['laravel', 'vuejs', 'mysql'],
                'summary' => 'Una red social breve donde el foco es escribir y leer hilos encadenados en lugar de publicaciones sueltas.',
                'prefill_description' => 'Permite publicar entradas cortas y encadenarlas en hilos con navegación clara entre partes. Suma seguir usuarios, un feed cronológico y respuestas anidadas.',
                'prefill_vision' => 'Que compartir una idea desarrollada en varios pasos sea la acción natural del producto.',
            ],
            [
                'slug' => 'alternativa-linktree',
                'title' => 'Alternativa open source a Linktree',
                'category' => 'alternativas-oss',
                'difficulty' => 'principiante',
                'sort_order' => 1,
                'techs' => ['nextjs', 'tailwind', 'supabase'],
                'summary' => 'Una página personal con una lista de enlaces editables, temas visuales y estadísticas básicas de clics.',
                'prefill_description' => 'Cada usuario administra sus enlaces, los reordena y elige un tema para su página pública. Registra clics por enlace para ver qué contenido funciona mejor.',
                'prefill_vision' => 'Que cualquiera tenga una página de enlaces propia y portable sin depender de un servicio cerrado.',
            ],
            [
                'slug' => 'alternativa-notas-colaborativas',
                'title' => 'Alternativa liviana para notas colaborativas',
                'category' => 'alternativas-oss',
                'difficulty' => 'avanzado',
                'sort_order' => 2,
                'techs' => ['react', 'laravel', 'mysql'],
                'summary' => 'Un editor de notas compartidas con edición simultánea, historial de cambios y organización por espacios.',
                'prefill_description' => 'Varias personas editan la misma nota y ven los cambios casi en tiempo real, con resolución de conflictos. Cada espacio agrupa notas, permite búsqueda y guarda versiones anteriores.',
                'prefill_vision' => 'Que un equipo escriba y ordene su documentación en conjunto, sin las trabas de una suite pesada.',
            ],
            [
                'slug' => 'acortador-urls-self-hosted',
                'title' => 'Acortador de URLs self-hosted',
                'category' => 'alternativas-oss',
                'difficulty' => 'intermedio',
                'sort_order' => 3,
                'techs' => ['go', 'redis', 'docker'],
                'summary' => 'Un servicio propio para acortar enlaces con códigos personalizados, expiración opcional y conteo de visitas.',
                'prefill_description' => 'Genera enlaces cortos que redirigen al destino original y permite elegir el código final. Guarda métricas de visitas y admite fechas de expiración para enlaces temporales.',
                'prefill_vision' => 'Que una organización controle sus enlaces cortos y sus datos sin cederlos a un tercero.',
            ],
            [
                'slug' => 'bot-discord-comunidad',
                'title' => 'Bot de Discord para comunidades dev',
                'category' => 'bots-automatizacion',
                'difficulty' => 'principiante',
                'sort_order' => 1,
                'techs' => ['nodejs', 'javascript', 'redis'],
                'summary' => 'Un bot que da la bienvenida, asigna roles por reacción y comparte recursos útiles en los canales de una comunidad.',
                'prefill_description' => 'Responde a comandos para entregar enlaces, reglas y guías de la comunidad. Automatiza la asignación de roles según reacciones y modera mensajes repetidos.',
                'prefill_vision' => 'Que una comunidad nueva se sienta ordenada y acogedora desde el primer día sin trabajo manual constante.',
            ],
            [
                'slug' => 'bot-recordatorios-telegram',
                'title' => 'Bot de recordatorios en Telegram',
                'category' => 'bots-automatizacion',
                'difficulty' => 'principiante',
                'sort_order' => 2,
                'techs' => ['python', 'fastapi', 'postgresql'],
                'summary' => 'Un bot que agenda recordatorios por mensaje y avisa al usuario en el momento indicado.',
                'prefill_description' => 'El usuario crea recordatorios con texto y fecha usando comandos simples o lenguaje natural básico. El bot envía el aviso a la hora pactada y permite listar o cancelar los pendientes.',
                'prefill_vision' => 'Que anotar y recibir un recordatorio sea tan rápido como enviar un mensaje.',
            ],
            [
                'slug' => 'pipeline-reportes-automaticos',
                'title' => 'Pipeline de reportes automáticos',
                'category' => 'bots-automatizacion',
                'difficulty' => 'avanzado',
                'sort_order' => 3,
                'techs' => ['python', 'docker', 'aws'],
                'summary' => 'Un proceso programado que reúne datos de varias fuentes, arma un reporte y lo distribuye por correo o chat.',
                'prefill_description' => 'Extrae datos de APIs y bases, los transforma y genera un informe en PDF o HTML según plantillas. Corre en un horario definido y notifica los fallos en cada etapa del pipeline.',
                'prefill_vision' => 'Que los reportes recurrentes se generen y lleguen solos, sin que nadie repita el mismo trabajo cada semana.',
            ],
            [
                'slug' => 'interprete-lenguaje-juguete',
                'title' => 'Intérprete de un lenguaje de juguete',
                'category' => 'aprendizaje',
                'difficulty' => 'avanzado',
                'sort_order' => 1,
                'techs' => ['typescript', 'git'],
                'summary' => 'Un intérprete pequeño que analiza y ejecuta un lenguaje propio con variables, funciones y control de flujo.',
                'prefill_description' => 'Implementa lexer, parser y evaluador para un lenguaje mínimo con expresiones, condicionales y bucles. Agrega funciones definidas por el usuario y mensajes de error claros con número de línea.',
                'prefill_vision' => 'Entender de verdad cómo funciona un lenguaje construyendo uno completo de principio a fin.',
            ],
            [
                'slug' => 'motor-busqueda-mini',
                'title' => 'Mini motor de búsqueda full-text',
                'category' => 'aprendizaje',
                'difficulty' => 'intermedio',
                'sort_order' => 2,
                'techs' => ['python', 'postgresql'],
                'summary' => 'Un buscador que indexa un conjunto de documentos y devuelve resultados ordenados por relevancia.',
                'prefill_description' => 'Construye un índice invertido, tokeniza el texto y aplica un ranking simple tipo TF-IDF. Expone una API de consulta con resaltado de coincidencias y paginación de resultados.',
                'prefill_vision' => 'Comprender cómo se indexa y se puntúa texto para poder razonar sobre cualquier motor de búsqueda real.',
            ],
            [
                'slug' => 'clon-redis-en-memoria',
                'title' => 'Clon didáctico de Redis en memoria',
                'category' => 'aprendizaje',
                'difficulty' => 'avanzado',
                'sort_order' => 3,
                'techs' => ['go', 'redis'],
                'summary' => 'Un almacén clave-valor en memoria que habla un subconjunto del protocolo de Redis sobre TCP.',
                'prefill_description' => 'Implementa comandos básicos como GET, SET, DEL y EXPIRE atendiendo conexiones concurrentes. Agrega persistencia opcional en disco y pruebas que comparan el comportamiento con Redis real.',
                'prefill_vision' => 'Aprender concurrencia, redes y estructuras de datos construyendo una pieza de infraestructura conocida.',
            ],
        ];
    }
}
