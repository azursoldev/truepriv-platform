<?php
$host = 'ep-mute-band-aurnzzzy.c-10.us-east-1.aws.neon.tech';
$db = 'neondb';
$user = 'neondb_owner';
$pass = 'npg_bacTn3QYZ6hi';
$dsn = "pgsql:host=$host;port=5432;dbname=$db;sslmode=require;options='endpoint=ep-mute-band-aurnzzzy'";
$pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_TIMEOUT => 5]);

$stmt = $pdo->query("SELECT u.id, u.email, u.role, t.name as tenant_name, t.type as tenant_type, u.created_at FROM users u LEFT JOIN tenants t ON u.tenant_id = t.id WHERE u.email ILIKE '%test.corp%'");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
