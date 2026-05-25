<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\JoinRequestController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing page
Route::get('/', [LandingController::class, '__invoke'])->name('landing');

Route::get('/dashboard', [DashboardController::class, '__invoke'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Rutas públicas para ver proyectos
Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');

// Rutas protegidas para CRUD (ANTES de {project:slug} para que no las capture)
Route::middleware('auth')->group(function () {
    Route::get('/projects/create', [ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project:slug}/edit', [ProjectController::class, 'edit'])->name('projects.edit');
    Route::put('/projects/{project:slug}', [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{project:slug}', [ProjectController::class, 'destroy'])->name('projects.destroy');
    
    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/complete', [ProfileController::class, 'updateComplete'])->name('profile.update-complete');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Join Requests
    Route::get('/join-requests', [JoinRequestController::class, 'index'])->name('join-requests.index');
    Route::post('/projects/{project}/join-requests', [JoinRequestController::class, 'store'])->name('join-requests.store');
    Route::post('/join-requests/{joinRequest}/approve', [JoinRequestController::class, 'approve'])->name('join-requests.approve');
    Route::post('/join-requests/{joinRequest}/reject', [JoinRequestController::class, 'reject'])->name('join-requests.reject');
    Route::post('/join-requests/{joinRequest}/cancel', [JoinRequestController::class, 'cancel'])->name('join-requests.cancel');
});

// Rutas con parámetros (SIEMPRE AL FINAL para que no capturen otras rutas)
Route::get('/projects/{project:slug}', [ProjectController::class, 'show'])->name('projects.show');
Route::get('/users/{user:slug}', [UserController::class, 'show'])->name('users.show');

require __DIR__.'/auth.php';
