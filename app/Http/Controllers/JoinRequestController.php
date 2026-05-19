<?php

namespace App\Http\Controllers;

use App\Models\JoinRequest;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class JoinRequestController extends Controller
{
    /**
     * Display a listing of join requests for the current user's projects
     */
    public function index(Request $request)
    {
        // Solicitudes recibidas (como creator)
        $receivedRequests = JoinRequest::with(['applicant', 'project'])
            ->whereHas('project', function ($q) {
                $q->where('user_id', Auth::id());
            })
            ->where('status', 'pending')
            ->latest()
            ->get();

        // Solicitudes enviadas (como applicant)
        $sentRequests = JoinRequest::with(['project'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        return Inertia::render('JoinRequests/Index', [
            'receivedRequests' => $receivedRequests,
            'sentRequests' => $sentRequests,
        ]);
    }

    /**
     * Store a newly created join request
     */
    public function store(Request $request, Project $project)
    {
        // Validar
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        // Verificar que no exista una solicitud previa
        $existing = JoinRequest::where('project_id', $project->id)
            ->where('user_id', Auth::id())
            ->first();

        if ($existing) {
            return back()->withErrors([
                'message' => 'Ya tienes una solicitud pendiente para este proyecto',
            ]);
        }

        // Verificar que no sea el creator
        if ($project->user_id === Auth::id()) {
            return back()->withErrors([
                'message' => 'No puedes unirte a tu propio proyecto',
            ]);
        }

        // Crear solicitud
        JoinRequest::create([
            'project_id' => $project->id,
            'user_id' => Auth::id(),
            'message' => $validated['message'],
            'status' => 'pending',
        ]);

        return redirect()->route('projects.show', $project)
            ->with('success', 'Solicitud enviada. El creator te avisará cuando la revise.');
    }

    /**
     * Approve a join request
     */
    public function approve(JoinRequest $joinRequest)
    {
        // Verificar que el usuario sea el creator del proyecto
        if ($joinRequest->project->user_id !== Auth::id()) {
            abort(403, 'No tenés permiso para aprobar esta solicitud');
        }

        // Verificar que esté pending
        if ($joinRequest->status !== 'pending') {
            return back()->withErrors([
                'message' => 'Esta solicitud ya fue revisada',
            ]);
        }

        // Aprobar
        $joinRequest->update([
            'status' => 'approved',
            'reviewed_at' => now(),
        ]);

        // Agregar al proyecto como participante
        $joinRequest->project->participants()->attach($joinRequest->user_id);

        // TODO: Enviar notificación por email al applicant

        return back()->with('success', 'Solicitud aprobada. El usuario ahora es participante.');
    }

    /**
     * Reject a join request
     */
    public function reject(JoinRequest $joinRequest)
    {
        // Verificar que el usuario sea el creator del proyecto
        if ($joinRequest->project->user_id !== Auth::id()) {
            abort(403, 'No tenés permiso para rechazar esta solicitud');
        }

        // Verificar que esté pending
        if ($joinRequest->status !== 'pending') {
            return back()->withErrors([
                'message' => 'Esta solicitud ya fue revisada',
            ]);
        }

        // Rechazar
        $joinRequest->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
        ]);

        // TODO: Enviar notificación por email al applicant

        return back()->with('success', 'Solicitud rechazada.');
    }

    /**
     * Cancel a join request (solo el applicant)
     */
    public function cancel(JoinRequest $joinRequest)
    {
        // Verificar que el usuario sea el applicant
        if ($joinRequest->user_id !== Auth::id()) {
            abort(403, 'No tenés permiso para cancelar esta solicitud');
        }

        // Verificar que esté pending
        if ($joinRequest->status !== 'pending') {
            return back()->withErrors([
                'message' => 'Esta solicitud ya fue revisada',
            ]);
        }

        // Eliminar
        $joinRequest->delete();

        return back()->with('success', 'Solicitud cancelada.');
    }
}
