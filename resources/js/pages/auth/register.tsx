import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GuestLayout from '@/layouts/guest';
import Seo from '@/components/seo';
import { Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Seo title="Crear cuenta" description="Registrate en The Dev House y empezá a colaborar en proyectos, conectá con desarrolladores y construí software en comunidad." />

            <form onSubmit={submit}>
                <Field id="name" label="Name" error={errors.name}>
                    <Input
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        autoFocus
                        placeholder="Tu nombre"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                </Field>

                <Field id="email" label="Email" error={errors.email} className="mt-4">
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        placeholder="email@example.com"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                </Field>

                <Field id="password" label="Password" error={errors.password} className="mt-4">
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                </Field>

                <Field id="password_confirmation" label="Confirm Password" error={errors.password_confirmation} className="mt-4">
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />
                </Field>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-muted-foreground underline hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <Button type="submit" className="ms-4" disabled={processing}>
                        Register
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}