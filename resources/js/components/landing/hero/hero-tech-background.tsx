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
const DESKTOP_ORBIT_RADII = [10, 20, 30, 40, 50] as const;
const DESKTOP_ORBIT_PHASES = [-18, 26, -8, 18, -34] as const;
const DESKTOP_ORBIT_SCALES = [1.08, 1.02, 0.96, 0.9, 0.84] as const;

const TABLET_ORBIT_RADII = [16, 27, 38, 49] as const;
const TABLET_ORBIT_PHASES = [-16, 22, -10, 28] as const;
const TABLET_ORBIT_SCALES = [0.92, 0.88, 0.84, 0.8] as const;

const MOBILE_ORBIT_RADII = [16, 24, 32] as const;
const MOBILE_ORBIT_PHASES = [-12, 28, -20] as const;
const MOBILE_ORBIT_SCALES = [0.84, 0.8, 0.76] as const;

interface OrbitTile {
    name: string;
    ringIndex: number;
    x: number;
    y: number;
    scale: number;
    tilt: number;
}

interface OrbitConfig {
    maxItems: number;
    showLabels: boolean;
    compact: boolean;
    radii: readonly number[];
    phases: readonly number[];
    scales: readonly number[];
    ringWeights: readonly number[];
}

function getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
}

function getOrbitConfig(viewportWidth: number): OrbitConfig {
    if (viewportWidth < 640) {
        return {
            maxItems: 18,
            showLabels: false,
            compact: true,
            radii: MOBILE_ORBIT_RADII,
            phases: MOBILE_ORBIT_PHASES,
            scales: MOBILE_ORBIT_SCALES,
            ringWeights: [1, 1, 1],
        };
    }

    if (viewportWidth < 1024) {
        return {
            maxItems: 30,
            showLabels: false,
            compact: true,
            radii: TABLET_ORBIT_RADII,
            phases: TABLET_ORBIT_PHASES,
            scales: TABLET_ORBIT_SCALES,
            ringWeights: [1, 1, 1, 1],
        };
    }

    return {
        maxItems: TECHS.length,
        showLabels: true,
        compact: false,
        radii: DESKTOP_ORBIT_RADII,
        phases: DESKTOP_ORBIT_PHASES,
        scales: DESKTOP_ORBIT_SCALES,
        ringWeights: [0.45, 0.96, 1.06, 1.18, 1.35],
    };
}

function selectResponsiveTechs(limit: number): readonly string[] {
    if (limit >= TECHS.length) {
        return TECHS;
    }

    const stride = Math.ceil(TECHS.length / limit);
    return TECHS.filter((_, index) => index % stride === 0).slice(0, limit);
}

function buildRingCounts(totalItems: number, weights: readonly number[]): number[] {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const rawCounts = weights.map((weight) => (totalItems * weight) / totalWeight);
    const counts = rawCounts.map((count) => Math.floor(count));
    let remaining = totalItems - counts.reduce((sum, count) => sum + count, 0);

    const order = rawCounts
        .map((count, index) => ({ index, remainder: count - counts[index] }))
        .sort((a, b) => b.remainder - a.remainder || a.index - b.index);

    for (const { index } of order) {
        if (remaining <= 0) break;
        counts[index] += 1;
        remaining -= 1;
    }

    return counts;
}

function buildRingSequence(counts: number[]): number[] {
    const assigned = counts.map(() => 0);
    const sequence: number[] = [];

    for (let i = 0; i < counts.reduce((sum, count) => sum + count, 0); i++) {
        let chosenRing = 0;
        let bestScore = Number.POSITIVE_INFINITY;

        for (let ringIndex = 0; ringIndex < counts.length; ringIndex++) {
            if (assigned[ringIndex] >= counts[ringIndex]) continue;

            const score = assigned[ringIndex] / counts[ringIndex];
            if (score < bestScore) {
                bestScore = score;
                chosenRing = ringIndex;
            }
        }

        sequence.push(chosenRing);
        assigned[chosenRing] += 1;
    }

    return sequence;
}

function buildOrbitLayout(config: OrbitConfig): OrbitTile[] {
    const techs = selectResponsiveTechs(config.maxItems);
    const counts = buildRingCounts(techs.length, config.ringWeights);
    const ringSequence = buildRingSequence(counts);
    const buckets = config.radii.map(() => [] as string[]);

    techs.forEach((tech, index) => {
        buckets[ringSequence[index]].push(tech);
    });

    const layout: OrbitTile[] = [];

    buckets.forEach((bucket, ringIndex) => {
        const step = (Math.PI * 2) / bucket.length;
        const phase = (config.phases[ringIndex] * Math.PI) / 180;

        bucket.forEach((name, itemIndex) => {
            const angle = phase + (itemIndex * step);
            const drift = ringIndex % 2 === 0 ? 0.55 : -0.55;

            layout.push({
                name,
                ringIndex,
                x: 50 + (Math.cos(angle) * config.radii[ringIndex]),
                y: 50 + (Math.sin(angle) * config.radii[ringIndex]) + drift,
                scale: config.scales[ringIndex],
                tilt: ((itemIndex % 5) - 2) * 1.5,
            });
        });
    });

    return layout;
}

const TechTile = memo(function TechTile({
    name,
    opacity,
    x,
    y,
    scale,
    tilt,
    ringIndex,
    compact,
    showLabel,
}: {
    name: string;
    opacity: number;
    x: number;
    y: number;
    scale: number;
    tilt: number;
    ringIndex: number;
    compact: boolean;
    showLabel: boolean;
}) {
    const Icon = ICON_MAP[name];
    const hasIcon = !!Icon;
    const initials = getInitials(name);
    const intensity = Math.max(0, Math.min(1, (opacity - BASE_OPACITY) / MAX_ADDITIONAL));
    const glow = intensity > 0
        ? `0 0 ${10 + (intensity * 18)}px color-mix(in oklab, var(--primary) ${18 + (intensity * 34)}%, transparent)`
        : 'none';
    const textColor = intensity > 0
        ? `color-mix(in oklab, var(--foreground) ${70 + (intensity * 30)}%, var(--primary) ${8 + (intensity * 12)}%)`
        : 'color-mix(in oklab, var(--foreground) 58%, transparent)';

    return (
        <div
            className={compact
                ? 'absolute flex w-[clamp(44px,9vw,68px)] aspect-square shrink-0 flex-col items-center justify-center gap-0.5 text-center font-medium transition-all duration-200 will-change-transform'
                : 'absolute flex w-[clamp(84px,8.2vw,136px)] aspect-square shrink-0 flex-col items-center justify-center gap-1.5 text-center font-medium transition-all duration-200 will-change-transform'}
            aria-hidden="true"
            style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) scale(${scale}) rotate(${tilt}deg)`,
                fontFamily: 'var(--font-mono)',
                opacity,
                zIndex: ringIndex + 1,
                color: textColor,
                filter: intensity > 0
                    ? `drop-shadow(${glow}) saturate(${1 + (intensity * 0.08)}) brightness(${1 + (intensity * 0.05)})`
                    : 'none',
                textShadow: intensity > 0
                    ? `0 0 ${6 + (intensity * 10)}px color-mix(in oklab, var(--primary) ${14 + (intensity * 26)}%, transparent)`
                    : 'none',
            }}
        >
            {hasIcon ? (
                <Icon className={compact ? 'size-5 md:size-6 shrink-0' : 'size-6 md:size-7 shrink-0'} />
            ) : (
                <span className={compact ? 'flex h-6 w-6 items-center justify-center rounded-full border border-border/40 text-[9px] tracking-[0.12em]' : 'flex h-8 w-8 items-center justify-center rounded-full border border-border/40 text-[10px] tracking-[0.14em]'}>
                    {initials}
                </span>
            )}
            {showLabel ? (
                <span className="whitespace-nowrap text-[11px] md:text-sm leading-[1.1] text-center overflow-hidden text-ellipsis max-w-full">
                    {name}
                </span>
            ) : null}
        </div>
    );
});

export function HeroTechBackground() {
    const gridRef = useRef<HTMLDivElement>(null);
    const [viewportWidth, setViewportWidth] = useState<number>(() => (typeof window === 'undefined' ? 0 : window.innerWidth));
    const orbitConfig = getOrbitConfig(viewportWidth);
    const layout = buildOrbitLayout(orbitConfig);
    const [opacities, setOpacities] = useState<number[]>(() => layout.map(() => BASE_OPACITY));
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
        setOpacities(Array.from({ length: layout.length }, () => BASE_OPACITY));
    }, [layout.length]);

    useEffect(() => {
        const updateViewportWidth = () => {
            setViewportWidth(window.innerWidth);
        };

        updateViewportWidth();

        window.addEventListener('resize', updateViewportWidth);

        return () => {
            window.removeEventListener('resize', updateViewportWidth);
        };
    }, []);

    useEffect(() => {
        setOpacities(Array.from({ length: layout.length }, () => BASE_OPACITY));
    }, [layout.length]);

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
            <div className="absolute left-1/2 top-[48%] size-[min(92vw,64rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/10 bg-gradient-to-b from-background/0 via-background/20 to-background/40 blur-[1px] dark:from-background/0 dark:via-background/10 dark:to-background/20" />
            <div className="absolute left-1/2 top-[48%] size-[min(76vw,52rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-border/10 opacity-70" />
            <div className="absolute left-1/2 top-[48%] size-[min(54vw,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/10 bg-primary/4 blur-2xl" />
            <div
                ref={gridRef}
                className="absolute inset-0 select-none"
            >
                {layout.map((tile, i) => (
                    <TechTile
                        key={tile.name}
                        name={tile.name}
                        opacity={opacities[i]}
                        x={tile.x}
                        y={tile.y}
                        scale={tile.scale}
                        tilt={tile.tilt}
                        ringIndex={tile.ringIndex}
                        compact={orbitConfig.compact}
                        showLabel={orbitConfig.showLabels}
                    />
                ))}
            </div>
        </div>
    );
}
