<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require __DIR__ . '/../backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$users = \App\Models\User::all();
foreach ($users as $user) {
    $user->password = bcrypt('Password123!');
    $user->save();
}
echo "ALL " . $users->count() . " USERS PASSWORDS SET TO: Password123!" . PHP_EOL;
