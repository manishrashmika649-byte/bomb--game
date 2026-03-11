<?php
session_start(); 
include 'db.php';


if (isset($_SESSION['agent_name'])) {
    $name = $_SESSION['agent_name'];
    $score = $_POST['score'];

    $stmt = $conn->prepare("INSERT INTO scores (agent_name, score) VALUES (?, ?)");
    $stmt->bind_param("si", $name, $score);
    $stmt->execute();
    $stmt->close();
}

$conn->close();
?>