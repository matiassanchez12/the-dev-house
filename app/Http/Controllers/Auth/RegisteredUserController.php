<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate(
            [
                'name' => 'required|string|max:255',
                'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ],
            [
                'name.required' => 'Tu nombre o alias es obligatorio.',
                'name.string' => 'Tu nombre o alias debe ser un texto.',
                'name.max' => 'Tu nombre o alias no puede exceder 255 caracteres.',
                'email.required' => 'El correo electrónico es obligatorio.',
                'email.email' => 'Ingresá un correo electrónico válido.',
                'email.unique' => 'Ya existe una cuenta con este correo electrónico.',
                'email.lowercase' => 'El correo electrónico debe estar en minúsculas.',
                'email.max' => 'El correo electrónico no puede exceder 255 caracteres.',
                'password.required' => 'La contraseña es obligatoria.',
                'password.confirmed' => 'La confirmación de contraseña no coincide.',
            ],
            [
                'name' => 'nombre o alias',
                'email' => 'correo electrónico',
                'password' => 'contraseña',
            ]
        );

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Redirect to onboarding if not completed
        if ($user->onboarding_completed_at === null) {
            return redirect(route('onboarding.index'));
        }

        return redirect(route('dashboard', absolute: false));
    }
}
