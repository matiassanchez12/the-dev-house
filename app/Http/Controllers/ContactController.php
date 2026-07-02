<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactRequest;
use App\Services\ContactService;
use Illuminate\Http\RedirectResponse;

class ContactController extends Controller
{
    public function __construct(
        private ContactService $contactService
    ) {}

    public function store(StoreContactRequest $request): RedirectResponse
    {
        $this->contactService->store($request->validated());

        return redirect()->route('contact')->with('success', 'Gracias por compartir tu feedback.');
    }
}
