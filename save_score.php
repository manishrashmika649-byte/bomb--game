<?php
include 'db.php';


$name = $_POST['agent_name'];
$score = $_POST['score'];

// 1. Query select
$stmt = $conn->prepare("INSERT INTO scores (agent_name, score) VALUES (?, ?)");


$stmt->bind_param("si", $name, $score); 

// 3. Query execute 
$stmt->execute();

$stmt->close();
$conn->close();
?>