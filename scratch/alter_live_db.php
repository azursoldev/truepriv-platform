<?php
try {
    $m = new mysqli('auraa-digital.com', 'auraadi1_truepriv', 'auraadi1_truepriv', 'auraadi1_truepriv', 3306);
    if ($m->connect_error) {
        echo "Connect error: " . $m->connect_error . "\n";
    } else {
        echo "MySQL Connected successfully!\n";
        $res = $m->query("ALTER TABLE tenants MODIFY COLUMN data_residency VARCHAR(50) DEFAULT 'local_nigeria'");
        if ($res) {
            echo "ALTER TABLE SUCCESSFUL!\n";
        } else {
            echo "Query error: " . $m->error . "\n";
        }
    }
} catch (Throwable $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
