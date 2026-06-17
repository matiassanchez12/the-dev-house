import { Field } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GuestLayout from '@/layouts/guest';
import Seo from '@/components/seo';
import { useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Seo title="Restablecer contraseña" description="Establecé una nueva contraseña para tu cuenta de The Dev House." />

            <form onSubmit={submit}>
                <Field id="email" label="Email" error={errors.email}>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        placeholder="email@example.com"
                        onChange={(e) => setData('email', e.target.value)}
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
                        autoFocus
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                </Field>

                <Field id="password_confirmation" label="Confirm Password" error={errors.password_confirmation} className="mt-4">
                    <Input
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                    />
                </Field>

                <div className="mt-4 flex items-center justify-end">
                    <Button type="submit" className="ms-4" disabled={processing}>
                        Reset Password
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}