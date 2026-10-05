<?php
try {
    $m = new mysqli('auraa-digital.com', 'auraadi1_truepriv', 'auraadi1_truepriv', 'auraadi1_truepriv', 3306);
    if ($m->connect_error) {
        echo "Direct connect error: " . $m->connect_error . "\n";
    } else {
        echo "SUCCESSFULLY CONNECTED TO CPANEL MYSQL!\n";
    }
} catch (Throwable $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
