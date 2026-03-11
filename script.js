
//   GLOBAL VARIABLES 

let score = 0;
let timeLeft = 180;
let timer;
let currentAnswer;
let currentAgent = "";
let penalty = 10;
let selectedDifficulty = 'medium';


//  INITIALIZATION 

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('hero-play-btn').addEventListener('click', enterGame);
    document.getElementById('start-mission-btn').addEventListener('click', showGame);
    document.getElementById('how-to-play-btn').addEventListener('click', () => toggleInstructions(true));
    document.getElementById('close-instructions-btn').addEventListener('click', () => toggleInstructions(false));
    document.getElementById('show-dashboard-btn').addEventListener('click', showDashboard);
    document.getElementById('back-to-menu-btn').addEventListener('click', showMainMenu);
    document.getElementById('logout-btn').addEventListener('click', logout);

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

    document.getElementById('diff-main-btn').addEventListener('click', toggleDifficultyMenu);
    document.querySelectorAll('.diff-opt').forEach(btn => {
        btn.addEventListener('click', () => selectLevel(btn.getAttribute('data-level')));
    });

    checkSession();
});


//  AUTHENTICATION LOGIC 

function handleAuth(type) {
    const user = document.getElementById(type === 'login' ? 'login-user' : 'reg-user').value;
    const pass = document.getElementById(type === 'login' ? 'login-pass' : 'reg-pass').value;

    if(!user || !pass) return alert("Credentials required!");
    
    let fd = new FormData();
    fd.append('action', type); 
    fd.append('username', user); 
    fd.append('password', pass);

    fetch('auth.php', { method: 'POST', body: fd })
    .then(res => res.text())
    .then(data => {
        if (data.trim() === "success") {
            currentAgent = user;
            showMainMenu();
        } else {
            alert(data);
        }
    });
}

function toggleAuthMode(mode) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    if (mode === 'register') {
        loginForm.classList.add('hidden');
        regForm.classList.remove('hidden');
    } else {
        loginForm.classList.remove('hidden');
        regForm.classList.add('hidden');
    }
}

function logout() { 
    let fd = new FormData();
    fd.append('action', 'logout');
    fetch('auth.php', { method: 'POST', body: fd })
    .then(res => res.text())
    .then(data => { if (data.trim() === "success") location.reload(); });
}

function checkSession() {
    let fd = new FormData();
    fd.append('action', 'check');
    fetch('auth.php', { method: 'POST', body: fd })
    .then(res => res.text())
    .then(data => {
        if (data.trim() !== "not_logged_in") {
            currentAgent = data.trim();
            showMainMenu();
        }
    });
}


//  SCREEN CONTROL 

function hideAllScreens() {
    const screens = ['intro-screen', 'auth-screen', 'main-menu', 'game-screen', 'dashboard', 'instructions-modal'];
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
    show ? modal.classList.remove('hidden') : modal.classList.add('hidden');
}


//  GAME LOGIC 

function showGame() {
    if(selectedDifficulty === 'easy') { timeLeft = 180; penalty = 5; }
    else if(selectedDifficulty === 'medium') { timeLeft = 120; penalty = 10; }
    else { timeLeft = 60; penalty = 20; }

    hideAllScreens();
    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('agent-name-display').innerText = `AGENT: ${currentAgent.toUpperCase()}`;
    
    fetch(`get_player_best.php?username=${currentAgent}`)
    .then(res => res.json())
    .then(data => {
        let display = document.getElementById('best-stats');
        if (data.best_time > 0) display.innerText = `BEST RECORD: ${data.best_time}s Left 🏆`;
        else if (data.best_score > 0) display.innerText = `BEST ATTEMPT: ${data.best_score}/10 Marks`;
        else display.innerText = `NEW MISSION`;
    });

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
        btn.onclick = () => handleAnswer(num);
        keypad.appendChild(btn);
    });
}

function handleAnswer(num) {
    if(num == currentAnswer) {
        score++;
        document.getElementById('score').innerText = score;
        if(score >= 10) winGame(); else loadPuzzle();
    } else {
        timeLeft -= penalty;
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
        if(timeLeft <= 0) endGame();
    }, 1000);
}


//  POST-GAME AND STATS 

function winGame() {
    clearInterval(timer);
    saveScore(timeLeft); 
    alert("MISSION ACCOMPLISHED! Time Remaining: " + timeLeft + "s");
    showDashboard(); 
}

function endGame() {
    clearInterval(timer);
    saveScore(score);
    alert("MISSION FAILED! Final Score: " + score); 
    showDashboard(); 
}

function showDashboard() {
    fetch('get_scores.php').then(res => res.json()).then(data => {
        const body = document.getElementById('leaderboard-body');
        body.innerHTML = data.map(row => `
            <tr>
                <td>${row.agent_name}</td>
                <td>${row.top_score}s Left</td>
            </tr>`).join('');
        hideAllScreens();
        document.getElementById('dashboard').classList.remove('hidden');
    });
}

function saveScore(val) {
    let fd = new FormData();
    fd.append('agent_name', currentAgent); 
    fd.append('score', val);
    fetch('save_score.php', { method: 'POST', body: fd });
}


//  UTILITIES 

function fetchAgentAdvice() {
    const adviceBox = document.getElementById('agent-advice');
    if(!adviceBox) return;
    fetch('https://api.adviceslip.com/advice?nocache=' + Math.random())
    .then(res => res.json())
    .then(data => { adviceBox.innerText = `"${data.slip.advice}"`; });
}

function toggleDifficultyMenu() {
    document.getElementById('difficulty-options').classList.toggle('hidden');
}

function selectLevel(level) {
    selectedDifficulty = level;
    document.getElementById('current-diff-label').innerText = level.toUpperCase();
    toggleDifficultyMenu();
}