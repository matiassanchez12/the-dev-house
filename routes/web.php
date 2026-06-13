<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\JoinRequestController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ProjectStatusController;
use App\Http\Controllers\PublicPageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProjectMessageController;
use App\Http\Controllers\ProjectChatController;
use Illuminate\Support\Facades\Route;

// Landing page
Route::get('/', [LandingController::class, '__invoke'])->name('landing');
Route::get('/test-landing');
Route::get('/dashboard', [DashboardController::class, '__invoke'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Páginas públicas institucionales
Route::get('/how-start', [PublicPageController::class, 'howStart'])->name('how-start');
Route::get('/about', [PublicPageController::class, 'about'])->name('about');
Route::get('/contact', [PublicPageController::class, 'contact'])->name('contact');
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/terms', [PublicPageController::class, 'terms'])->name('terms');
Route::get('/privacy', [PublicPageController::class, 'privacy'])->name('privacy');

// Rutas públicas para ver proyectos
Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');

// Rutas protegidas para CRUD (ANTES de {project:slug} para que no las capture)
Route::middleware('auth')->group(function () {
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project:slug}/edit', [ProjectController::class, 'edit'])->name('projects.edit');
    Route::put('/projects/{project:slug}', [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{project:slug}', [ProjectController::class, 'destroy'])->name('projects.destroy');

    // Project Status
    Route::patch('/projects/{project:slug}/status', [ProjectStatusController::class, 'update'])->name('projects.status.update');
    Route::post('/projects/{project:slug}/messages', [ProjectMessageController::class, 'store'])->name('projects.messages.store');
    Route::get('/projects/{project:slug}/chat', [ProjectChatController::class, 'index'])->name('projects.chat');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/complete', [ProfileController::class, 'updateComplete'])->name('profile.update-complete');
    Route::put('/profile/social-links', [ProfileController::class, 'updateSocialLinks'])->name('social-links.update');
    Route::delete('/profile/social-links/{socialLink}', [ProfileController::class, 'destroySocialLink'])->name('social-links.destroy');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Join Requests
    Route::get('/join-requests', [JoinRequestController::class, 'index'])->name('join-requests.index');
    Route::post('/projects/{project}/join-requests', [JoinRequestController::class, 'store'])->name('join-requests.store');
    Route::post('/join-requests/{joinRequest}/approve', [JoinRequestController::class, 'approve'])->name('join-requests.approve');
    Route::post('/join-requests/{joinRequest}/reject', [JoinRequestController::class, 'reject'])->name('join-requests.reject');
    Route::post('/join-requests/{joinRequest}/cancel', [JoinRequestController::class, 'cancel'])->name('join-requests.cancel');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');

// Onboarding
    Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding.index');
    Route::post('/onboarding/step-1', [OnboardingController::class, 'saveStep1'])->name('onboarding.step-1');
    Route::post('/onboarding/step-2', [OnboardingController::class, 'saveStep2'])->name('onboarding.step-2');
    Route::post('/onboarding/step-social-links', [OnboardingController::class, 'saveStepSocialLinks'])->name('onboarding.step-social-links');
    Route::post('/onboarding/step-3', [OnboardingController::class, 'saveStep3'])->name('onboarding.step-3');
    Route::post('/onboarding/step-4', [OnboardingController::class, 'saveStep4'])->name('onboarding.step-4');
    Route::post('/onboarding/skip', [OnboardingController::class, 'skip'])->name('onboarding.skip');
    Route::get('/onboarding/recommendations', [OnboardingController::class, 'recommendations'])->name('onboarding.recommendations');
});

// Rutas con parámetros (SIEMPRE AL FINAL para que no capturen otras rutas)
Route::get('/projects/{project:slug}', [ProjectController::class, 'show'])->name('projects.show');
Route::get('/users', [UserController::class, 'index'])->name('users.index');
Route::get('/users/{user:slug}', [UserController::class, 'show'])->name('users.show');

require __DIR__.'/auth.php';
