<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require __DIR__ . '/../backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$user = \App\Models\User::where('email', 'fresh.corp@example.com')->first();
$logs = \App\Models\AuditLog::where('tenant_id', $user->tenant_id)->orderBy('created_at', 'desc')->get();

echo "TENANT: " . ($user->tenant ? $user->tenant->name : 'N/A') . PHP_EOL;
echo "TOTAL LOGS: " . $logs->count() . PHP_EOL;
echo str_repeat("=", 80) . PHP_EOL;
foreach ($logs as $i => $log) {
    echo sprintf("[%d] Action: %-25s | Time: %s\n    Details: %s\n    IP: %s\n", 
        $i + 1, 
        $log->action, 
        $log->created_at, 
        $log->description ?: json_encode($log->details),
        $log->ip_address ?: '127.0.0.1'
    );
    echo str_repeat("-", 80) . PHP_EOL;
}
