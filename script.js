// 1. --- GLOBAL VARIABLES ---

let currentAgent = "";
let selectedDifficulty = 'medium'; // Default difficulty
let score = 0;
let timeLeft = 120;
let timer;
let currentAnswer;
let penalty = 10;


// 2. --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. PLAY NOW (Intro to Auth)
    document.getElementById('hero-play-btn').addEventListener('click', () => {
        enterGame(); 
    });

    // 2. AUTHENTICATION Buttons
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

    // 3. MAIN MENU Buttons
    document.getElementById('start-mission-btn').addEventListener('click', showGame);

    document.getElementById('how-to-play-btn').addEventListener('click', () => toggleInstructions(true));
    document.getElementById('close-instructions-btn').addEventListener('click', () => toggleInstructions(false));
    
    document.getElementById('logout-btn').addEventListener('click', logout);

    // 4. DIFFICULTY Selection Logic
    document.getElementById('diff-main-btn').addEventListener('click', toggleDifficultyMenu);
    
    document.querySelectorAll('.diff-opt').forEach(btn => {
        btn.addEventListener('click', () => {
            const level = btn.getAttribute('data-level');
            selectLevel(level);
        });
    });

    // Check for existing session
    let savedUser = getCookie('loggedUser');
    if (savedUser) {
        currentAgent = savedUser;
        showMainMenu();
    }
});


// 3. --- SCREEN CONTROL ---


function hideAllScreens() {
    const screens = ['intro-screen', 'auth-screen', 'main-menu', 'game-screen', 'instructions-modal'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
}

function enterGame() {
    hideAllScreens();
    document.getElementById('auth-screen').classList.remove('hidden');
}

function showMainMenu() {
    hideAllScreens();
    const menu = document.getElementById('main-menu');
    if (menu) {
        menu.classList.remove('hidden');
        document.getElementById('welcome-text').innerText = `WELCOME, AGENT ${currentAgent.toUpperCase()}`;
        fetchAgentAdvice();
    }
}

function toggleInstructions(show) { 
    const modal = document.getElementById('instructions-modal');
    if (modal) {
        show ? modal.classList.remove('hidden') : modal.classList.add('hidden');
    }
}


// 4. --- GAME LOGIC (Gameplay) ---


function showGame() {
    // Difficulty panelty
    if(selectedDifficulty === 'easy') { timeLeft = 180; penalty = 5; }
    else if(selectedDifficulty === 'medium') { timeLeft = 120; penalty = 10; }
    else { timeLeft = 60; penalty = 20; }

    hideAllScreens();
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('agent-name-display').innerText = `AGENT: ${currentAgent.toUpperCase()}`;
    
    resetGame(timeLeft);
    loadPuzzle();
    startTimer();
}

function resetGame(t) {
    score = 0; 
    timeLeft = t;
    document.getElementById('score').innerText = "0";
    document.getElementById('timer').innerText = timeLeft;
}

async function loadPuzzle() {
    const res = await fetch('https://marcconrad.com/uob/banana/api.php');
    const data = await res.json();
    document.getElementById('puzzle-img').src = data.question;
    currentAnswer = data.solution;
    generateKeypad(currentAnswer);
}

function generateKeypad(correct) {
    const keypad = document.getElementById('keypad');
    keypad.innerHTML = '';
    let opts = [correct];
    while(opts.length < 4) {
        let r = Math.floor(Math.random() * 10);
        if(!opts.includes(r)) opts.push(r);
    }
    opts.sort(() => Math.random() - 0.5).forEach(num => {
        const btn = document.createElement('button');
        btn.innerText = num;
        btn.className = "keypad-btn";
        btn.onclick = () => handleAnswer(num);
        keypad.appendChild(btn);
    });
}

function handleAnswer(num) {
    if(num == currentAnswer) {
        score++;
        document.getElementById('score').innerText = score;
        if(score >= 10) {
            clearInterval(timer);
            saveScore(score); 
            alert("🏆 MISSION ACCOMPLISHED! BOMB DEFUSED!");
            showMainMenu();
        } else {
            loadPuzzle();
        }
    } else {
        timeLeft -= penalty;
        // Shake animation for feedback
        const container = document.getElementById('board-container');
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 500);
    }
}

function startTimer() {
    if(timer) clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').innerText = (timeLeft < 0) ? 0 : timeLeft;
        if(timeLeft <= 0) {
            clearInterval(timer);
            saveScore(score); 
            alert("💥 BOOM! MISSION FAILED!");
            showMainMenu();
        }
    }, 1000);
}


// 5. --- AUTHENTICATION & UTILITIES ---


function handleAuth(type) {
    let user, pass;
    if (type === 'login') {
        user = document.getElementById('login-user').value;
        pass = document.getElementById('login-pass').value;
    } else {
        user = document.getElementById('reg-user').value;
        pass = document.getElementById('reg-pass').value;
    }

    if(!user || !pass) return alert("Enter your username and password");
    
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

function toggleDifficultyMenu() {
    const options = document.getElementById('difficulty-options');
    if (options) options.classList.toggle('hidden');
}

function selectLevel(level) {
    selectedDifficulty = level;
    document.getElementById('current-diff-label').innerText = level.toUpperCase();
    toggleDifficultyMenu();
}

function fetchAgentAdvice() {
    const adviceBox = document.getElementById('agent-advice');
    if(!adviceBox) return;
    fetch('https://api.adviceslip.com/advice')
    .then(res => res.json())
    .then(data => { 
        adviceBox.innerText = `"${data.slip.advice}"`; 
    });
}

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

// 6. --- SAVE SCORE ---

function saveScore(val) {
    let fd = new FormData();
    fd.append('agent_name', currentAgent); 
    fd.append('score', val);
    
    fetch('save_score.php', { 
        method: 'POST', 
        body: fd 
    })
    .then(response => response.text())
    .then(data => {
        console.log("Server Response:", data); 
        
        if (data.includes("Score saved successfully")) {
            console.log("Database update: SUCCESS!");
        } else {
            console.warn("Database update: FAILED!");
        }
    })
    .catch(error => console.error('Error connecting to server:', error));
}