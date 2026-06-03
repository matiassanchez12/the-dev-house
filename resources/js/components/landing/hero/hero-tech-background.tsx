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
    // Frontend
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
    // Backend
    Laravel: LaravelIcon,
    Django: DjangoIcon,
    Rails: RubyonrailsIcon,
    Express: ExpressIcon,
    FastAPI: FastapiIcon,
    'Spring Boot': SpringbootIcon,
    Gin: GinIcon,
    Fiber: undefined, // No disponible en simple-icons
    Actix: ActixIcon,
    Hono: HonoIcon,
    // Languages
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
    // Mobile
    'React Native': undefined, // No disponible como icono separado
    Flutter: FlutterIcon,
    SwiftUI: undefined, // No disponible en simple-icons
    'Jetpack Compose': JetpackcomposeIcon,
    // Database & Infra
    PostgreSQL: PostgresqlIcon,
    MySQL: MysqlIcon,
    MongoDB: MongodbIcon,
    Redis: RedisIcon,
    SQLite: SQLiteIcon,
    Prisma: PrismaIcon,
    Supabase: SupabaseIcon,
    DynamoDB: undefined, // No disponible en simple-icons
    // DevOps
    Docker: DockerIcon,
    Kubernetes: KubernetesIcon,
    Terraform: TerraformIcon,
    'GitHub Actions': GithubactionsIcon,
    CircleCI: CircleciIcon,
    Ansible: AnsibleIcon,
    // AI/ML
    PyTorch: PytorchIcon,
    TensorFlow: TensorflowIcon,
    LangChain: LangchainIcon,
    'Hugging Face': HuggingfaceIcon,
    OpenAI: undefined, // No disponible en simple-icons
    Ollama: OllamaIcon,
    // Tools
    Vite: ViteIcon,
    Turborepo: TurborepoIcon,
    Playwright: PlaywrightIcon,
    Vitest: VitestIcon,
    ESLint: EslintIcon,
    Prettier: PrettierIcon,
    Biome: BiomeIcon,
    Bun: BunIcon,
};

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function TechTile({ name }: { name: string }) {
    const Icon = ICON_MAP[name];
    const hasIcon = !!Icon;
    const initials = getInitials(name);

    return (
        <div
            key={name}
            className="pointer-events-auto flex items-center justify-center rounded px-3 py-2 text-sm font-medium text-foreground opacity-[15%] transition-all duration-300 hover:opacity-[0.85] hover:bg-foreground/15"
            style={{
                fontFamily: 'var(--font-mono)',
            }}
        >
            {hasIcon ? (
                <>
                    <Icon className="size-5 mr-1.5" />
                    <span className="whitespace-nowrap">{name}</span>
                </>
            ) : (
                <div className="flex items-center justify-center w-10 h-10">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute inset-0 rounded bg-foreground/5" />
                        <span className="relative text-xs font-medium text-foreground">
                            {initials}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export function HeroTechBackground() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
            <div
                className="absolute inset-0 grid"
                style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                    gridAutoRows: 'minmax(40px, auto)',
                    gap: '8px',
                    padding: '16px',
                }}
            >
                {TECHS.map((tech) => <TechTile key={tech} name={tech} />)}
            </div>
        </div>
    );
}
