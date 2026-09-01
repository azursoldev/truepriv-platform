<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceTokenInactivityTimeout
{
    /**
     * Handle an incoming request to enforce a 30-minute idle inactivity timeout.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && method_exists($user, 'currentAccessToken')) {
            $token = $user->currentAccessToken();

            if ($token) {
                // Check if last_used_at is more than 30 minutes ago
                if ($token->last_used_at && $token->last_used_at->lt(now()->subMinutes(30))) {
                    $token->delete();

                    return response()->json([
                        'success' => false,
                        'error' => 'session_timeout',
                        'message' => 'Session expired due to 30 minutes of inactivity. Please log in again.',
                    ], 401);
                }

                // Update activity timestamp
                $token->forceFill(['last_used_at' => now()])->save();
            }
        }

        return $next($request);
    }
}
