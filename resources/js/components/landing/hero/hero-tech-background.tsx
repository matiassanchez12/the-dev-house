import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { ReactIcon } from '@/components/ui/svgs/react-icon';
import { LaravelIcon } from '@/components/ui/svgs/laravel-icon';
import { TypeScriptIcon } from '@/components/ui/svgs/typescript-icon';
import { PythonIcon } from '@/components/ui/svgs/python-icon';
import { VueIcon } from '@/components/ui/svgs/vue-icon';
import { AngularIcon } from '@/components/ui/svgs/angular-icon';
import { SvelteIcon } from '@/components/ui/svgs/svelte-icon';
import { NuxtIcon } from '@/components/ui/svgs/nuxt-icon';
import { QwikIcon } from '@/components/ui/svgs/qwik-icon';
import { DjangoIcon } from '@/components/ui/svgs/django-icon';
import { HonoIcon } from '@/components/ui/svgs/hono-icon';
import { RustIcon } from '@/components/ui/svgs/rust-icon';
import { JavaIcon } from '@/components/ui/svgs/java-icon';
import { KotlinIcon } from '@/components/ui/svgs/kotlin-icon';
import { SwiftIcon } from '@/components/ui/svgs/swift-icon';
import { PHPIcon } from '@/components/ui/svgs/php-icon';
import { RubyIcon } from '@/components/ui/svgs/ruby-icon';
import { ZigIcon } from '@/components/ui/svgs/zig-icon';
import { FlutterIcon } from '@/components/ui/svgs/flutter-icon';
import { RedisIcon } from '@/components/ui/svgs/redis-icon';
import { SQLiteIcon } from '@/components/ui/svgs/sqlite-icon';
import { PrismaIcon } from '@/components/ui/svgs/prisma-icon';
import { SupabaseIcon } from '@/components/ui/svgs/supabase-icon';
import { DockerIcon } from '@/components/ui/svgs/docker-icon';
import { KubernetesIcon } from '@/components/ui/svgs/kubernetes-icon';
import { TerraformIcon } from '@/components/ui/svgs/terraform-icon';
import { ViteIcon } from '@/components/ui/svgs/vite-icon';
import { PlaywrightIcon } from '@/components/ui/svgs/playwright-icon';
import { VitestIcon } from '@/components/ui/svgs/vitest-icon';
import { BunIcon } from '@/components/ui/svgs/bun-icon';
// simple-icons additions
import { NextdotjsIcon } from '@/components/ui/svgs/nextdotjs-icon';
import { SolidIcon } from '@/components/ui/svgs/solid-icon';
import { AstroIcon } from '@/components/ui/svgs/astro-icon';
import { RemixIcon } from '@/components/ui/svgs/remix-icon';
import { RubyonrailsIcon } from '@/components/ui/svgs/rubyonrails-icon';
import { ExpressIcon } from '@/components/ui/svgs/express-icon';
import { FastapiIcon } from '@/components/ui/svgs/fastapi-icon';
import { SpringbootIcon } from '@/components/ui/svgs/springboot-icon';
import { GinIcon } from '@/components/ui/svgs/gin-icon';
import { ActixIcon } from '@/components/ui/svgs/actix-icon';
import { GoIcon } from '@/components/ui/svgs/go-icon';
import { DotnetIcon } from '@/components/ui/svgs/dotnet-icon';
import { ElixirIcon } from '@/components/ui/svgs/elixir-icon';
import { JetpackcomposeIcon } from '@/components/ui/svgs/jetpackcompose-icon';
import { PostgresqlIcon } from '@/components/ui/svgs/postgresql-icon';
import { MysqlIcon } from '@/components/ui/svgs/mysql-icon';
import { MongodbIcon } from '@/components/ui/svgs/mongodb-icon';
import { GithubactionsIcon } from '@/components/ui/svgs/githubactions-icon';
import { CircleciIcon } from '@/components/ui/svgs/circleci-icon';
import { AnsibleIcon } from '@/components/ui/svgs/ansible-icon';
import { PytorchIcon } from '@/components/ui/svgs/pytorch-icon';
import { TensorflowIcon } from '@/components/ui/svgs/tensorflow-icon';
import { LangchainIcon } from '@/components/ui/svgs/langchain-icon';
import { HuggingfaceIcon } from '@/components/ui/svgs/huggingface-icon';
import { OllamaIcon } from '@/components/ui/svgs/ollama-icon';
import { TurborepoIcon } from '@/components/ui/svgs/turborepo-icon';
import { EslintIcon } from '@/components/ui/svgs/eslint-icon';
import { PrettierIcon } from '@/components/ui/svgs/prettier-icon';
import { BiomeIcon } from '@/components/ui/svgs/biome-icon';

const TECHS = [
    // Frontend
    'React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt', 'SolidJS', 'Astro', 'Remix', 'Qwik',
    // Backend
    'Laravel', 'Django', 'Rails', 'Express', 'FastAPI', 'Spring Boot', 'Gin', 'Fiber', 'Actix', 'Hono',
    // Languages
    'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'Kotlin', 'Swift', 'C#', 'PHP', 'Ruby', 'Zig', 'Elixir',
    // Mobile
    'React Native', 'Flutter', 'SwiftUI', 'Jetpack Compose',
    // Database & Infra
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Prisma', 'Supabase', 'DynamoDB',
    // DevOps
    'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions', 'CircleCI', 'Ansible',
    // AI/ML
    'PyTorch', 'TensorFlow', 'LangChain', 'Hugging Face', 'OpenAI', 'Ollama',
    // Tools
    'Vite', 'Turborepo', 'Playwright', 'Vitest', 'ESLint', 'Prettier', 'Biome', 'Bun',
] as const;

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined> = {
    React: ReactIcon,
    Vue: VueIcon,
    Angular: AngularIcon,
    Svelte: SvelteIcon,
    'Next.js': NextdotjsIcon,
    Nuxt: NuxtIcon,
    SolidJS: SolidIcon,
    Astro: AstroIcon,
    Remix: RemixIcon,
    Qwik: QwikIcon,
    Laravel: LaravelIcon,
    Django: DjangoIcon,
    Rails: RubyonrailsIcon,
    Express: ExpressIcon,
    FastAPI: FastapiIcon,
    'Spring Boot': SpringbootIcon,
    Gin: GinIcon,
    Fiber: undefined,
    Actix: ActixIcon,
    Hono: HonoIcon,
    TypeScript: TypeScriptIcon,
    Python: PythonIcon,
    Rust: RustIcon,
    Go: GoIcon,
    Java: JavaIcon,
    Kotlin: KotlinIcon,
    Swift: SwiftIcon,
    'C#': DotnetIcon,
    PHP: PHPIcon,
    Ruby: RubyIcon,
    Zig: ZigIcon,
    Elixir: ElixirIcon,
    'React Native': undefined,
    Flutter: FlutterIcon,
    SwiftUI: undefined,
    'Jetpack Compose': JetpackcomposeIcon,
    PostgreSQL: PostgresqlIcon,
    MySQL: MysqlIcon,
    MongoDB: MongodbIcon,
    Redis: RedisIcon,
    SQLite: SQLiteIcon,
    Prisma: PrismaIcon,
    Supabase: SupabaseIcon,
    DynamoDB: undefined,
    Docker: DockerIcon,
    Kubernetes: KubernetesIcon,
    Terraform: TerraformIcon,
    'GitHub Actions': GithubactionsIcon,
    CircleCI: CircleciIcon,
    Ansible: AnsibleIcon,
    PyTorch: PytorchIcon,
    TensorFlow: TensorflowIcon,
    LangChain: LangchainIcon,
    'Hugging Face': HuggingfaceIcon,
    OpenAI: undefined,
    Ollama: OllamaIcon,
    Vite: ViteIcon,
    Turborepo: TurborepoIcon,
    Playwright: PlaywrightIcon,
    Vitest: VitestIcon,
    ESLint: EslintIcon,
    Prettier: PrettierIcon,
    Biome: BiomeIcon,
    Bun: BunIcon,
};

const SPOTLIGHT_RADIUS = 280;
const BASE_OPACITY = 0.15;
const MAX_ADDITIONAL = 0.70;

function getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
}

const TechTile = memo(function TechTile({
    name,
    opacity,
}: {
    name: string;
    opacity: number;
}) {
    const Icon = ICON_MAP[name];
    const hasIcon = !!Icon;
    const initials = getInitials(name);
    const bgAlpha = opacity > BASE_OPACITY ? ((opacity - BASE_OPACITY) / MAX_ADDITIONAL) * 0.15 : 0;
    const bgColor = bgAlpha > 0.01 ? `oklch(var(--foreground) / ${bgAlpha})` : 'transparent';

    return (
        <div
            className="flex aspect-square flex-col items-center justify-center rounded p-1.5 text-[11px] font-medium text-foreground transition-all duration-200"
            style={{
                fontFamily: 'var(--font-mono)',
                opacity,
                backgroundColor: bgColor,
            }}
        >
            {hasIcon ? (
                <Icon className="size-5 mb-0.5 shrink-0" />
            ) : (
                <div className="flex items-center justify-center w-7 h-7 mb-0.5 shrink-0">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute inset-0 rounded bg-foreground/5" />
                        <span className="relative text-[9px] font-medium text-foreground">
                            {initials}
                        </span>
                    </div>
                </div>
            )}
            <span className="whitespace-nowrap leading-[1.1] text-center overflow-hidden text-ellipsis max-w-full">
                {name}
            </span>
        </div>
    );
});

export function HeroTechBackground() {
    const gridRef = useRef<HTMLDivElement>(null);
    const [opacities, setOpacities] = useState<number[]>(() => TECHS.map(() => BASE_OPACITY));
    const rafId = useRef(0);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (rafId.current) return;
        rafId.current = requestAnimationFrame(() => {
            rafId.current = 0;
            const grid = gridRef.current;
            if (!grid) return;

            const tiles = grid.children;
            const newOps: number[] = [];

            for (let i = 0; i < tiles.length; i++) {
                const rect = tiles[i].getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
                let intensity = 1 - dist / SPOTLIGHT_RADIUS;
                if (intensity <= 0) {
                    newOps.push(BASE_OPACITY);
                    continue;
                }
                // Smoothstep easing: suave entrada y salida
                intensity = intensity * intensity * (3 - 2 * intensity);
                newOps.push(BASE_OPACITY + intensity * MAX_ADDITIONAL);
            }

            setOpacities(newOps);
        });
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
            rafId.current = 0;
        }
        setOpacities(TECHS.map(() => BASE_OPACITY));
    }, []);

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;
        const section = grid.closest('section');
        if (!section) return;

        section.addEventListener('mousemove', handleMouseMove);
        section.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            section.removeEventListener('mousemove', handleMouseMove);
            section.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(rafId.current);
        };
    }, [handleMouseMove, handleMouseLeave]);

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
            <div
                ref={gridRef}
                className="absolute inset-0 grid select-none"
                style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gridAutoRows: 'auto',
                    gap: '6px',
                    padding: '12px',
                }}
            >
                {TECHS.map((tech, i) => (
                    <TechTile key={tech} name={tech} opacity={opacities[i]} />
                ))}
            </div>
        </div>
    );
}
