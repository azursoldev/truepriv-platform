<?php
$m = new mysqli('127.0.0.1', 'root', '', 'dpodpco platform');
if ($m->connect_error) {
    echo "Connection error: " . $m->connect_error . "\n";
} else {
    echo "Connected to `dpodpco platform` successfully!\n";
    $res = $m->query('SELECT email, role, tenant_id FROM users WHERE email LIKE "%test.corp%" OR email LIKE "%6820%" OR email LIKE "%adeyemi%"');
    print_r($res->fetch_all(MYSQLI_ASSOC));
}
