<?php
$host = 'ep-mute-band-aurnzzzy.c-10.us-east-1.aws.neon.tech';
$db = 'neondb';
$user = 'neondb_owner';
$pass = 'npg_bacTn3QYZ6hi';
$dsn = "pgsql:host=$host;port=5432;dbname=$db;sslmode=require;options='endpoint=ep-mute-band-aurnzzzy'";

try {
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_TIMEOUT => 5]);
    
    echo "=== LIVE NEON POSTGRESQL DATABASE RECORD ===\n\n";
    $stmt = $pdo->query("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "LATEST USERS IN POSTGRESQL:\n";
    foreach ($users as $u) {
        echo "ID: " . $u['id'] . "\n";
        echo "Name: " . $u['name'] . "\n";
        echo "Email: " . $u['email'] . "\n";
        echo "Role: " . $u['role'] . "\n";
        echo "Created At: " . $u['created_at'] . "\n";
        echo "-----------------------------------------\n";
    }

    $stmt2 = $pdo->query("SELECT id, name, type, compliance_score, created_at FROM tenants ORDER BY created_at DESC LIMIT 3");
    $tenants = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\nLATEST ORGANIZATIONS IN POSTGRESQL:\n";
    foreach ($tenants as $t) {
        echo "Org Name: " . $t['name'] . " | Type: " . $t['type'] . " | Created: " . $t['created_at'] . "\n";
    }

} catch (Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
