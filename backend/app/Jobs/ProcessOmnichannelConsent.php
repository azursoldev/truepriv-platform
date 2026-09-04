<?php

namespace App\Jobs;

use App\Models\OmnichannelConsent;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessOmnichannelConsent implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public array $payload;
    public string $tenantId;

    /**
     * Create a new job instance.
     */
    public function __construct(array $payload, string $tenantId)
    {
        $this->payload = $payload;
        $this->tenantId = $tenantId;
    }

    /**
     * Execute the job to ingest consent proof asynchronously.
     */
    public function handle(): void
    {
        try {
            $identifier = $this->payload['data_subject_identifier'];
            $channel = $this->payload['channel'] ?? 'web_sdk';
            $sessionRef = $this->payload['channel_session_ref'] ?? null;
            $consentCategories = $this->payload['consent_categories'] ?? ['essential'];
            $ipAddress = $this->payload['ip_address'] ?? null;
            $rawPayload = $this->payload['raw_payload'] ?? $this->payload;

            // Generate deterministic SHA-256 cryptographic proof hash
            $proofData = json_encode([
                'tenant_id' => $this->tenantId,
                'identifier' => $identifier,
                'channel' => $channel,
                'categories' => $consentCategories,
                'timestamp' => now()->toIso8601String(),
            ]);
            $proofHash = hash('sha256', $proofData);

            OmnichannelConsent::create([
                'tenant_id' => $this->tenantId,
                'data_subject_identifier' => $identifier,
                'channel' => $channel,
                'channel_session_ref' => $sessionRef,
                'raw_payload' => $rawPayload,
                'consent_categories' => $consentCategories,
                'proof_hash' => $proofHash,
                'ip_address' => $ipAddress,
                'opt_in_timestamp' => now(),
                'is_withdrawn' => false,
            ]);

            Log::info("Async Omnichannel Consent Ingested for tenant {$this->tenantId} via channel {$channel}");
        } catch (\Throwable $e) {
            Log::error("Failed to asynchronously process omnichannel consent: " . $e->getMessage(), [
                'tenant_id' => $this->tenantId,
                'payload' => $this->payload,
            ]);
            throw $e;
        }
    }
}
