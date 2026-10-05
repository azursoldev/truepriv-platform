<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require __DIR__ . '/../backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$u = \App\Models\User::orderBy('created_at', 'desc')->first();
if ($u) {
    echo "EMAIL: " . $u->email . PHP_EOL;
    echo "NAME: " . $u->name . PHP_EOL;
    echo "ROLE: " . $u->role . PHP_EOL;
    echo "CREATED_AT: " . $u->created_at . PHP_EOL;
}
