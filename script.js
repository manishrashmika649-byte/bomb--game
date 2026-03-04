// --- GLOBAL VARIABLES ---
let currentAgent = "";

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. PLAY NOW event listener 
    document.getElementById('hero-play-btn').addEventListener('click', () => {
        enterGame(); 
    });

    document.getElementById('login-submit-btn').addEventListener('click', () => handleAuth('login'));
    document.getElementById('register-submit-btn').addEventListener('click', () => handleAuth('register'));
    
    document.getElementById('to-register').addEventListener('click', (e) => { 
        e.preventDefault(); 
        toggleAuthMode('register'); 
    });
    
    document.getElementById('to-login').addEventListener('click', (e) => { 
        e.preventDefault(); 
        toggleAuthMode('login'); 
    });

    document.getElementById('logout-btn').addEventListener('click', logout);

    
    let savedUser = getCookie('loggedUser');
    if (savedUser) {
        currentAgent = savedUser;
        showMainMenu();
    }
});

// --- SCREEN CONTROL ---

function enterGame() {
    const screens = ['intro-screen', 'auth-screen', 'main-menu', 'game-screen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    document.getElementById('auth-screen').classList.remove('hidden');
}

// show menu
function showMainMenu() {
    const screens = ['intro-screen', 'auth-screen', 'main-menu', 'game-screen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    
    const menu = document.getElementById('main-menu');
    if (menu) {
        menu.classList.remove('hidden');
        
        document.getElementById('welcome-text').innerText = `WELCOME, AGENT ${currentAgent.toUpperCase()}`;
        
        
    }
}

// --- AUTHENTICATION ---
function handleAuth(type) {
    let user, pass;
    if (type === 'login') {
        user = document.getElementById('login-user').value;
        pass = document.getElementById('login-pass').value;
    } else {
        user = document.getElementById('reg-user').value;
        pass = document.getElementById('reg-pass').value;
    }

    if(!user || !pass) return alert("enter your username and password");
    
    let fd = new FormData();
    fd.append('action', type); 
    fd.append('username', user); 
    fd.append('password', pass);

    fetch('auth.php', { method: 'POST', body: fd })
    .then(res => res.text())
    .then(data => {
        if (data.trim() === "success") {
            setCookie('loggedUser', user, 7);
            currentAgent = user;
            
            
            showMainMenu();
            
        } else {
            alert("❌ " + data);
        }
    });
}

function toggleAuthMode(mode) {
    if (mode === 'register') {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    } else {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
    }
}

// --- UTILITIES ---

  



// (Cookies) ---
function logout() { 
    setCookie('loggedUser', '', -1); 
    alert("Logged out successfully!");
    location.reload(); 
}

function setCookie(n, v, d) {
    let date = new Date();
    date.setTime(date.getTime() + (d * 86400000));
    document.cookie = n + "=" + v + "; expires=" + date.toUTCString() + "; path=/";
}

function getCookie(n) {
    let name = n + "=";
    let ca = document.cookie.split(';');
    for (let c of ca) {
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return null;
}