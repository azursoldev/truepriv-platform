<?php
try {
    $host = 'ep-mute-band-aurnzzzy.c-10.us-east-1.aws.neon.tech';
    $db = 'neondb';
    $user = 'neondb_owner';
    $pass = 'npg_bacTn3QYZ6hi';
    $dsn = "pgsql:host=$host;port=5432;dbname=$db;sslmode=require;options='endpoint=ep-mute-band-aurnzzzy'";
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_TIMEOUT => 5]);
    $stmt = $pdo->query("SELECT version();");
    echo "SUCCESS: " . $stmt->fetchColumn() . "\n";
} catch (Throwable $e) {
    echo "FAIL: " . $e->getMessage() . "\n";
}
