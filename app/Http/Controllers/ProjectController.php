<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Tech;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Project::with(['creator', 'techs'])
            ->latest();

        // Filtro por tech
        if ($request->filled('tech')) {
            $query->whereHas('techs', function ($q) use ($request) {
                $q->where('slug', $request->tech);
            });
        }

        // Filtro por estado
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $projects = $query->paginate(12)->withQueryString();

        $techs = Tech::orderBy('name')->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'techs' => $techs,
            'filters' => [
                'tech' => $request->tech,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $techs = Tech::orderBy('name')->get();

        return Inertia::render('Projects/Create', [
            'techs' => $techs,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'vision' => ['nullable', 'string'],
            'techs' => ['array', 'required'],
            'techs.*' => ['exists:techs,id'],
            'repository_url' => ['nullable', 'url'],
            'demo_url' => ['nullable', 'url'],
            'images' => ['array'],
            'images.*' => ['image', 'max:2048'], // 2MB max
        ]);

        // Crear slug único
        $slug = Str::slug($validated['title']);
        $originalSlug = $slug;
        $counter = 1;
        
        while (Project::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        // Upload de imágenes
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('projects', 'public');
            }
        }

        // Crear proyecto
        $project = Auth::user()->createdProjects()->create([
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'],
            'vision' => $validated['vision'] ?? null,
            'images' => $imagePaths,
            'repository_url' => $validated['repository_url'] ?? null,
            'demo_url' => $validated['demo_url'] ?? null,
        ]);

        // Asociar techs
        $project->techs()->attach($validated['techs']);

        return redirect()->route('projects.show', $project)
            ->with('success', 'Proyecto creado exitosamente!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        $project->load(['creator.techs', 'techs', 'participants.user']);

        return Inertia::render('Projects/Show', [
            'project' => $project,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project)
    {
        // Solo el creator puede editar
        if ($project->user_id !== Auth::id()) {
            abort(403, 'No tenés permiso para editar este proyecto');
        }

        $techs = Tech::orderBy('name')->get();

        return Inertia::render('Projects/Edit', [
            'project' => $project,
            'techs' => $techs,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project)
    {
        // Solo el creator puede editar
        if ($project->user_id !== Auth::id()) {
            abort(403, 'No tenés permiso para editar este proyecto');
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'vision' => ['nullable', 'string'],
            'techs' => ['array', 'required'],
            'techs.*' => ['exists:techs,id'],
            'repository_url' => ['nullable', 'url'],
            'demo_url' => ['nullable', 'url'],
            'images' => ['array'],
            'images.*' => ['image', 'max:2048'],
            'remove_images' => ['array'],
            'remove_images.*' => ['string'],
        ]);

        // Actualizar slug si cambió el título
        $slug = Str::slug($validated['title']);
        if ($slug !== $project->slug) {
            $originalSlug = $slug;
            $counter = 1;
            while (Project::where('slug', $slug)->where('id', '!=', $project->id)->exists()) {
                $slug = $originalSlug . '-' . $counter++;
            }
            $project->slug = $slug;
        }

        // Manejar imágenes nuevas
        if ($request->hasFile('images')) {
            $newImages = [];
            foreach ($request->file('images') as $image) {
                $newImages[] = $image->store('projects', 'public');
            }
            $project->images = array_merge(
                $project->images ?? [],
                $newImages
            );
        }

        // Eliminar imágenes marcadas
        if (!empty($validated['remove_images'])) {
            foreach ($validated['remove_images'] as $imagePath) {
                Storage::disk('public')->delete($imagePath);
                $project->images = array_filter(
                    $project->images ?? [],
                    fn($img) => $img !== $imagePath
                );
            }
        }

        $project->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'vision' => $validated['vision'] ?? null,
            'images' => array_values($project->images),
            'repository_url' => $validated['repository_url'] ?? null,
            'demo_url' => $validated['demo_url'] ?? null,
        ]);

        // Actualizar techs
        $project->techs()->sync($validated['techs']);

        return redirect()->route('projects.show', $project)
            ->with('success', 'Proyecto actualizado exitosamente!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        // Solo el creator puede eliminar
        if ($project->user_id !== Auth::id()) {
            abort(403, 'No tenés permiso para eliminar este proyecto');
        }

        // Eliminar imágenes
        if ($project->images) {
            foreach ($project->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $project->delete();

        return redirect()->route('projects.index')
            ->with('success', 'Proyecto eliminado exitosamente!');
    }
}
