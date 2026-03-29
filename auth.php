<?php

session_start();

include 'db.php';

// PHPMailer classes 
require 'php-Mailer/Exception.php';
require 'php-Mailer/PHPMailer.php';
require 'php-Mailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


$action = $_POST['action'] ?? '';
$user = $_POST['username'] ?? '';
$pass = $_POST['password'] ?? '';
$email = $_POST['email'] ?? ''; 


// 2. CHECK LOGIN STATUS

if ($action == "check") {
    if (isset($_SESSION['agent_name'])) {
        echo $_SESSION['agent_name'];
    } else {
        echo "not_logged_in";
    }
    exit();
}


// 3. LOGOUT ACTION

if ($action == "logout") {
    session_unset();
    session_destroy();
    echo "success";
    exit();
}


// 4. REGISTER ACTION

if ($action == "register") {
    if (empty($user) || empty($pass) || empty($email)) {
        echo "All fields (Username, Password, Email) are required!";
        exit();
    }

    $hashed_pass = password_hash($pass, PASSWORD_DEFAULT);
    $v_token = bin2hex(random_bytes(16)); 

    
    $stmt = $conn->prepare("INSERT INTO users (username, email, password, v_token, is_verified) VALUES (?, ?, ?, ?, 0)");
    $stmt->bind_param("ssss", $user, $email, $hashed_pass, $v_token);

    if ($stmt->execute()) {
        $mail = new PHPMailer(true);
        try {
            // SMTP Settings
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'manishrashmika649@gmail.com'; 
            $mail->Password   = 'vweinxilytveymqr';           
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            
            $mail->setFrom('manishrashmika649@gmail.com', 'Mission Control');
            $mail->addAddress($email);

            $mail->isHTML(true);
            $mail->Subject = 'Verify Your Agent Identity';
            $mail->Body    = "<h3>Welcome Agent $user!</h3>
                              <p>The bomb is ticking! Please verify your identity to join the mission:</p>
                              <a href='http://localhost/bomb_game/verify.php?token=$v_token' 
                                 style='background:#00ff00; color:#000; padding:10px; text-decoration:none; display:inline-block; font-weight:bold;'>
                                 [ VERIFY IDENTITY ]
                              </a>";

            $mail->send();
            echo "success"; 
        } catch (Exception $e) {
            echo "Mail Error: " . $mail->ErrorInfo;
        }
    } else {
        echo "Registration failed! User or Email might already exist.";
    }
    $stmt->close();
    exit();
}


// 5. LOGIN ACTION

if ($action == "login") {
    if (empty($user) || empty($pass)) {
        echo "Credentials required!";
        exit();
    }

    $stmt = $conn->prepare("SELECT password, is_verified FROM users WHERE username = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if (password_verify($pass, $row['password'])) {
            if ($row['is_verified'] == 0) {
                echo "Please verify your email address first!";
                exit();
            }

            session_regenerate_id(true);
            $_SESSION['agent_name'] = $user;
            echo "success";
        } else {
            echo "Invalid Credentials!";
        }
    } else {
        echo "Invalid Credentials!";
    }
    $stmt->close();
    exit();
}

$conn->close();
?>