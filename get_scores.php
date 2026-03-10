<?php
include 'db.php';

$result = $conn->query("SELECT agent_name, MAX(score) as top_score FROM scores WHERE score > 10 GROUP BY agent_name ORDER BY top_score DESC LIMIT 5");
$data = [];
while($row = $result->fetch_assoc()) { $data[] = $row; }
echo json_encode($data);
?>