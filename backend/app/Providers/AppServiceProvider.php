<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Enforce 30-minute idle inactivity timeout on Sanctum Bearer tokens
        Sanctum::authenticateAccessTokensUsing(function ($accessToken, $isValid) {
            if (!$isValid) {
                return false;
            }

            // Check if token has been idle for more than 30 minutes
            if ($accessToken->last_used_at && $accessToken->last_used_at->lt(now()->subMinutes(30))) {
                return false;
            }

            return true;
        });
    }
}
