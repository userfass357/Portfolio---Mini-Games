// Навигация и общие утилиты
document.addEventListener('DOMContentLoaded', ()=>{
  const gamesToggle = document.getElementById('gamesToggle');
  const gamesMenu = document.getElementById('gamesMenu');
  const menuItems = document.querySelectorAll('.menu-item');

  gamesToggle.addEventListener('click', ()=> gamesMenu.classList.toggle('hidden'));
  document.addEventListener('click', (e)=>{
    if(!gamesToggle.contains(e.target) && !gamesMenu.contains(e.target)) gamesMenu.classList.add('hidden');
  });

  menuItems.forEach(btn=>btn.addEventListener('click', ()=>{
    showGameSection(btn.dataset.game);
    gamesMenu.classList.add('hidden');
  }));

  // show default
  showGameSection('clicker');
  initClicker();
  initAdventure();
  initGuess();
});

function showGameSection(name){
  document.querySelectorAll('.game-section').forEach(s=>s.classList.add('hidden'));
  const el = document.getElementById(name);
  if(el) el.classList.remove('hidden');
}

/* ================= Clicker ================= */
function initClicker(){
  const scoreEl = document.getElementById('score');
  const bestEl = document.getElementById('best');
  const timeEl = document.getElementById('time');
  const clickBtn = document.getElementById('clickButton');
  const resetBtn = document.getElementById('resetBtn');
  const msg = document.getElementById('clickerMessage');

  let score = 0; let time = 30; let timerId = null; let running = false;
  const BEST_KEY = 'clicker_best';
  bestEl.textContent = localStorage.getItem(BEST_KEY) || '0';

  function startTimer(){
    if(running) return;
    running = true;
    timeEl.textContent = time;
    timerId = setInterval(()=>{
      time--;
      timeEl.textContent = time;
      if(time<=0){
        clearInterval(timerId); running=false; endGame();
      }
    },1000);
  }

  function endGame(){
    msg.textContent = `Игра окончена! Ваш результат: ${score}`;
    const best = parseInt(localStorage.getItem(BEST_KEY) || '0',10);
    if(score>best){ localStorage.setItem(BEST_KEY, String(score)); bestEl.textContent = score; msg.textContent += ' — Новый рекорд!'; }
    clickBtn.disabled = true;
  }

  clickBtn.addEventListener('click', ()=>{
    if(!running) startTimer();
    score++;
    scoreEl.textContent = score;
    // visual effect
    clickBtn.classList.remove('click-effect');
    // toggle background color
    clickBtn.style.background = `linear-gradient(180deg, #${Math.floor(Math.random()*16777215).toString(16)}, #4f7ee6)`;
    void clickBtn.offsetWidth;
    clickBtn.classList.add('click-effect');
  });

  resetBtn.addEventListener('click', ()=>{
    clearInterval(timerId); timerId=null; running=false; score=0; time=30; scoreEl.textContent='0'; timeEl.textContent='30'; msg.textContent=''; clickBtn.disabled=false;
  });
}

/* =============== Adventure Generator =============== */
function initAdventure(){
  const genBtn = document.getElementById('genAdventure');
  const saveBtn = document.getElementById('saveAdventure');
  const showBtn = document.getElementById('showSaved');
  const textEl = document.getElementById('adventureText');
  const savedList = document.getElementById('savedList');
  const KEY = 'adventures_saved';

  const characters = ['рыцарь','маг','вор','лучник','паладин'];
  const locations = ['тёмный лес','заброшенный замок','подводное царство','горное ущелье','заброшенный город'];
  const villains = ['дракон','колдун','гоблин','тёмный лорд','волшебный демон'];

  function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  function generate(){
    const c = rand(characters); const l = rand(locations); const v = rand(villains);
    const str = `Ваш персонаж — ${c} находится в ${l} и сражается с ${v}.`;
    textEl.textContent = str;
    return str;
  }

  genBtn.addEventListener('click', ()=>{ generate(); });

  saveBtn.addEventListener('click', ()=>{
    const current = textEl.textContent;
    if(!current) return;
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
    arr.push({text:current, ts:Date.now()});
    localStorage.setItem(KEY, JSON.stringify(arr));
    alert('Приключение сохранено');
  });

  showBtn.addEventListener('click', ()=>{
    savedList.innerHTML='';
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
    if(!arr.length){ savedList.innerHTML='<li>Нет сохранённых приключений</li>'; return; }
    arr.slice().reverse().forEach(item=>{
      const li = document.createElement('li');
      li.textContent = `${new Date(item.ts).toLocaleString()}: ${item.text}`;
      savedList.appendChild(li);
    });
  });
}

/* ================= Guess Number ================= */
function initGuess(){
  const input = document.getElementById('guessInput');
  const tryBtn = document.getElementById('tryBtn');
  const msg = document.getElementById('guessMessage');
  const triesLeftEl = document.getElementById('triesLeft');
  const restart = document.getElementById('restartGuess');

  let secret=randInt(1,100); let triesLeft=10; let ended=false;
  triesLeftEl.textContent = triesLeft;

  function reset(){ secret=randInt(1,100); triesLeft=10; ended=false; triesLeftEl.textContent=triesLeft; msg.textContent=''; input.value=''; input.disabled=false; tryBtn.disabled=false; }

  tryBtn.addEventListener('click', ()=>{
    if(ended) return;
    const val = parseInt(input.value,10);
    if(Number.isNaN(val) || val<1 || val>100){ msg.textContent='Введите число от 1 до 100'; return; }
    triesLeft--; triesLeftEl.textContent = triesLeft;
    if(val===secret){ msg.textContent = `Правильно! Это ${secret}. Поздравляю!`; endGame(); return; }
    msg.textContent = val < secret ? 'Загаданное число больше' : 'Загаданное число меньше';
    if(triesLeft<=0){ msg.textContent = `Вы проиграли. Было загадано ${secret}`; endGame(); }
  });

  restart.addEventListener('click', reset);

  function endGame(){ ended=true; input.disabled=true; tryBtn.disabled=true; }

  function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
}
