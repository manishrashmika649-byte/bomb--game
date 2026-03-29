<?php
session_start(); 
include 'db.php';

if(isset($_GET['token'])) {
    $token = $_GET['token'];
    
   
    $checkStmt = $conn->prepare("SELECT username FROM users WHERE v_token = ? LIMIT 1");
    $checkStmt->bind_param("s", $token);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    
    if($row = $result->fetch_assoc()) {
        $username = $row['username'];

       
        $updateStmt = $conn->prepare("UPDATE users SET is_verified = 1 WHERE v_token = ?");
        $updateStmt->bind_param("s", $token);
        
        if($updateStmt->execute()) {
           
            $_SESSION['agent_name'] = $username;

            echo "<body style='background:#000; color:#0f0; font-family:monospace; text-align:center; padding-top:100px;'>";
            echo "<h1>AGENT VERIFIED! 🛡️</h1>";
            echo "<p>Identity confirmed for Agent: <strong>" . strtoupper($username) . "</strong></p>";
            echo "<p>Access granted. Redirecting to Mission Control...</p>";
            
           
            echo "<script>setTimeout(function(){ window.location.href = 'index.html'; }, 3000);</script>";
            
            echo "<br><a href='index.html' style='color:#fff; border:1px solid #0f0; padding:10px; text-decoration:none;'>[ ENTER MISSION CONTROL ]</a>";
            echo "</body>";
        }
        $updateStmt->close();
    } else {
        echo "Invalid or expired verification token.";
    }
    $checkStmt->close();
}
$conn->close();
?>