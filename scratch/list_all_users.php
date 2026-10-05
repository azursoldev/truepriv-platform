<?php
$host = 'ep-mute-band-aurnzzzy.c-10.us-east-1.aws.neon.tech';
$db = 'neondb';
$user = 'neondb_owner';
$pass = 'npg_bacTn3QYZ6hi';
$dsn = "pgsql:host=$host;port=5432;dbname=$db;sslmode=require;options='endpoint=ep-mute-band-aurnzzzy'";
$pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_TIMEOUT => 5]);

$stmt = $pdo->query("SELECT u.id, u.email, u.role, u.password, t.name as tenant_name, t.type as tenant_type FROM users u LEFT JOIN tenants t ON u.tenant_id = t.id");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "TOTAL USERS IN NEON DB: " . count($users) . "\n";
foreach ($users as $u) {
    echo "{$u['id']} | {$u['email']} | {$u['role']} | {$u['tenant_type']} | {$u['tenant_name']}\n";
}
