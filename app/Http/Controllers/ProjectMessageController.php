<?php

namespace App\Http\Controllers;

use App\Events\MessageCreated;
use App\Http\Requests\Project\StoreProjectMessageRequest;
use App\Models\Project;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;

class ProjectMessageController extends Controller
{
    public function store(StoreProjectMessageRequest $request, Project $project)
    {
        Gate::authorize('viewChat', $project);

        $message = $project->messages()->create([
            'user_id' => Auth::id(),
            'body' => $request->validated('body'),
            'type' => 'text',
        ])->load('sender');

        MessageCreated::dispatch($message);

        return redirect()->route('projects.chat', $project);
    }
}
