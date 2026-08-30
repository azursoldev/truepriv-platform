<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IndustryTemplate;
use Illuminate\Http\JsonResponse;

class TemplateController extends Controller
{
    /**
     * List all Nigerian industry pre-sets for automated RoPA & DPIA seeding.
     */
    public function index(): JsonResponse
    {
        $templates = IndustryTemplate::all();

        return response()->json([
            'success' => true,
            'count' => $templates->count(),
            'data' => $templates,
        ]);
    }

    /**
     * Get specific industry template details including default RoPA items.
     */
    public function show(string $slug): JsonResponse
    {
        $template = IndustryTemplate::where('slug', $slug)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $template,
        ]);
    }
}
