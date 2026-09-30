<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $res = Illuminate\Support\Facades\DB::select('SELECT version();');
    echo "LARAVEL CONNECTED TO POSTGRESQL SUCCESS!\n";
    print_r($res);
} catch (Throwable $e) {
    echo "LARAVEL DB ERROR: " . $e->getMessage() . "\n";
}
