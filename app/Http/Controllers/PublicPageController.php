<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicPageController extends Controller
{
    private function renderPage(string $component, array $props = [])
    {
        return Inertia::render($component, $props);
    }

    public function howStart(Request $request)
    {
        return $this->renderPage('public/how-start');
    }

    public function about(Request $request)
    {
        return $this->renderPage('public/about');
    }

    public function contact(Request $request)
    {
        return $this->renderPage('public/contact');
    }

    public function terms(Request $request)
    {
        return $this->renderPage('public/terms');
    }

    public function privacy(Request $request)
    {
        return $this->renderPage('public/privacy');
    }
}
