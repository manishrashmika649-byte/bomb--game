<?php
session_start();

include 'db.php';


$action = $_POST['action'] ?? '';
$user = $_POST['username'] ?? '';
$pass = $_POST['password'] ?? '';


// 2. CHECK LOGIN STATUS

if ($action == "check") {
    if (isset($_SESSION['agent_name'])) {
        echo $_SESSION['agent_name']; // logged in name return 
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
    if (empty($user) || empty($pass)) {
        echo "Credentials required!";
        exit();
    }

    $hashed_pass = password_hash($pass, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $user, $hashed_pass);

    if ($stmt->execute()) {
       
        session_regenerate_id(true); 
        $_SESSION['agent_name'] = $user;
        echo "success";
    } else {
        echo "User already exists!";
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

    $stmt = $conn->prepare("SELECT password FROM users WHERE username = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        if (password_verify($pass, $row['password'])) {
            
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