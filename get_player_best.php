<?php
include 'db.php';

header('Content-Type: application/json');


$user = isset($_GET['username']) ? $_GET['username'] : null;

if ($user) {
   
    $stmt1 = $conn->prepare("SELECT MAX(score) as best_time FROM scores WHERE agent_name = ? AND score > 10");
    $stmt1->bind_param("s", $user);
    $stmt1->execute();
    $res_win = $stmt1->get_result()->fetch_assoc();

   
    $stmt2 = $conn->prepare("SELECT MAX(score) as best_score FROM scores WHERE agent_name = ? AND score <= 10");
    $stmt2->bind_param("s", $user);
    $stmt2->execute();
    $res_fail = $stmt2->get_result()->fetch_assoc();

    echo json_encode([
        'best_time' => (int)($res_win['best_time'] ?? 0),
        'best_score' => (int)($res_fail['best_score'] ?? 0)
    ]);
    
    $stmt1->close();
    $stmt2->close();
} else {
    echo json_encode(['best_time' => 0, 'best_score' => 0]);
}

$conn->close();
?>