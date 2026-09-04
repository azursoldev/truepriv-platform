<?php

namespace App\Jobs;

use App\Models\CookieConsent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessCookieConsentLog implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public array $consentData;

    /**
     * Create a new job instance.
     */
    public function __construct(array $consentData)
    {
        $this->consentData = $consentData;
    }

    /**
     * Execute the job to record cookie proof-of-consent asynchronously.
     */
    public function handle(): void
    {
        try {
            CookieConsent::create([
                'tenant_id' => $this->consentData['tenant_id'],
                'visitor_uuid' => $this->consentData['visitor_uuid'],
                'accepted_categories' => $this->consentData['accepted_categories'],
                'ip_hash' => $this->consentData['ip_hash'],
                'user_agent' => $this->consentData['user_agent'] ?? null,
                'consented_at' => $this->consentData['consented_at'] ?? now(),
            ]);

            Log::info("Async Cookie Consent Proof Recorded for tenant {$this->consentData['tenant_id']}");
        } catch (\Throwable $e) {
            Log::error("Failed to process async cookie consent: " . $e->getMessage(), [
                'data' => $this->consentData,
            ]);
            throw $e;
        }
    }
}
