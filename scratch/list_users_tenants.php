<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require __DIR__ . '/../backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$users = \App\Models\User::with('tenant')->get();
echo "TOTAL USERS: " . $users->count() . PHP_EOL;
echo str_repeat("=", 80) . PHP_EOL;
foreach ($users as $u) {
    $tName = $u->tenant ? $u->tenant->name : 'NO TENANT';
    $tType = $u->tenant ? $u->tenant->type : '-';
    $tId = $u->tenant ? $u->tenant->id : '-';
    echo sprintf("%-30s | %-18s | %-25s | %s\n", $u->email, $u->role, $tName, $tType);
}
echo str_repeat("=", 80) . PHP_EOL;
