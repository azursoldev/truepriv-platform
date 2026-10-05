<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require __DIR__ . '/../backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\GuestInvitation;
use App\Models\Tenant;
use Illuminate\Support\Str;

$tenant = Tenant::where('name', 'like', '%Apex%')->first() ?: Tenant::first();

// 1. Create Link with 20 minutes remaining
$token20m = Str::random(40);
$inv20m = GuestInvitation::create([
    'tenant_id' => $tenant->id,
    'email' => 'guest.20min@apexmfb.ng',
    'target_department' => 'Finance & Treasury',
    'invitation_token' => $token20m,
    'status' => 'pending',
    'expires_at' => now()->addMinutes(20),
]);

// 2. Create Already Expired Link (Expired 10 minutes ago)
$tokenExpired = Str::random(40);
$invExpired = GuestInvitation::create([
    'tenant_id' => $tenant->id,
    'email' => 'guest.already.expired@apexmfb.ng',
    'target_department' => 'Information Technology',
    'invitation_token' => $tokenExpired,
    'status' => 'pending',
    'expires_at' => now()->subMinutes(10),
]);

echo "SUCCESSFULLY GENERATED 2 TEST INVITATIONS" . PHP_EOL;
echo str_repeat("=", 80) . PHP_EOL;
echo "TENANT: " . $tenant->name . PHP_EOL;
echo PHP_EOL;
echo "1. LINK VALID FOR 20 MINUTES (Expires at " . $inv20m->expires_at->toDateTimeString() . "):" . PHP_EOL;
echo "   http://localhost:3000/portal/champion-intake?token=" . $token20m . PHP_EOL;
echo PHP_EOL;
echo "2. ALREADY EXPIRED LINK (Expired at " . $invExpired->expires_at->toDateTimeString() . "):" . PHP_EOL;
echo "   http://localhost:3000/portal/champion-intake?token=" . $tokenExpired . PHP_EOL;
echo str_repeat("=", 80) . PHP_EOL;
