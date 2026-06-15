let allWords = [];
let testWords = [];
let currentIndex = 0;
let correctCount = 0;
let isReviewPhase = false; // 現在、答え合わせ画面かどうかを管理

function getFavorites() {
    const favs = localStorage.getItem('word_stage_favs');
    return favs ? JSON.parse(favs) : [];
}

function saveFavorites(favs) {
    localStorage.setItem('word_stage_favs', JSON.stringify(favs));
}

async function loadGameData() {
    try {
        const response = await fetch('words.json');
        allWords = await response.json();
        
        const favs = getFavorites();
        const favBtn = document.getElementById('btn-fav-mode');
        if (favs.length === 0) {
            favBtn.style.opacity = "0.4";
            favBtn.style.pointerEvents = "none";
            document.querySelector('#btn-fav-mode .mode-desc').innerText = "お気に入りが未登録です";
        }
    } catch (error) {
        alert("データのロードに失敗しましたYO");
    }
}

function startGame(mode) {
    const favs = getFavorites();
    if (mode === 'fav') {
        // お気に入りは、元データの「word」が保存されてるのでそれで判定
        testWords = allWords.filter(item => favs.includes(item.word));
    } else {
        testWords = [...allWords];
    }

    if (testWords.length === 0) return;
    testWords.sort(() => Math.random() - 0.5);

    document.getElementById('select-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('total-q').innerText = testWords.length;
    
    showQuestion();
}

// 穴あき表現（[at the corner of] 等）からピュアな正解フレーズを抽出する関数
function cleanPhrase(sentence, word) {
    // もし[ ]が含まれていたら、その中身をwordに置き換えるか、[ ]を取り除く
    let clean = sentence.replace('[ ]', word);
    clean = clean.replace('[', '').replace(']', '');
    return clean.trim();
}

// （上の方の getFavorites, startGame などの関数は前回のままでOK！）
// 変更があるのは handleFormSubmit と showQuestion の一部だぜ！

function showQuestion() {
    if (currentIndex >= testWords.length) {
        showResult();
        return;
    }
    
    isReviewPhase = false;
    
    document.getElementById('current-q').innerText = currentIndex + 1;
    document.getElementById('review-container').style.display = 'none';
    document.getElementById('judge-overlay').className = "";
    
    const submitBtn = document.getElementById('btn-submit');
    submitBtn.innerText = "ENTER";
    submitBtn.classList.remove('next-phase');
    
    const inputEl = document.getElementById('user-input');
    inputEl.value = "";
    inputEl.readOnly = false;
    inputEl.focus();
    
    // 出題（日本語を出す）
    const currentData = testWords[currentIndex];
    document.getElementById('meaning-display').innerText = currentData.meaning;

    const favs = getFavorites();
    const favBtn = document.getElementById('btn-fav');
    if (favs.includes(currentData.word)) {
        favBtn.classList.add('active');
    } else {
        favBtn.classList.remove('active');
    }
}

// フォーム送信時（判定 ⇄ 次へ）
function handleFormSubmit(event) {
    event.preventDefault();
    
    if (isReviewPhase) {
        currentIndex++;
        showQuestion();
        return;
    }
    
    const inputEl = document.getElementById('user-input');
    const userInput = inputEl.value.trim().toLowerCase();
    
    const currentData = testWords[currentIndex];
    const correctAnswer = cleanPhrase(currentData.sentence, currentData.word).toLowerCase();
    
    const overlay = document.getElementById('judge-overlay');
    const statusEl = document.getElementById('review-status');
    const userDisplayEl = document.getElementById('review-user');
    
    // ⭐【ここが自動判定ハック！】
    if (userInput === correctAnswer) {
        correctCount++;
        overlay.className = "correct-flash";
        
        statusEl.innerText = "⭕ CORRECT";
        statusEl.className = "status-correct";
        userDisplayEl.style.color = "#00ffcc"; // ユーザー入力も緑に
    } else {
        overlay.className = "wrong-flash";
        
        statusEl.innerText = "❌ WRONG";
        statusEl.className = "status-wrong";
        userDisplayEl.style.color = "#ff007f"; // 間違ってたらピンクに
    }
    
    // 答え合わせエリアをセット
    document.getElementById('review-correct').innerText = correctAnswer;
    userDisplayEl.innerText = userInput || "(空欄)";
    document.getElementById('review-container').style.display = 'flex';
    
    isReviewPhase = true;
    inputEl.readOnly = true;
    
    const submitBtn = document.getElementById('btn-submit');
    submitBtn.innerText = "NEXT STAGE";
    submitBtn.classList.add('next-phase');
    submitBtn.focus();
}

// （残りの cleanPhrase, showResult、最後のDOMContentLoadedのリスナーなどは前回のままでOK！）

function showResult() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    
    const accuracy = Math.round((correctCount / testWords.length) * 100);
    
    document.getElementById('accuracy').innerText = accuracy;
    document.getElementById('correct-count').innerText = correctCount;
    document.getElementById('total-count').innerText = testWords.length;

    const rankEl = document.getElementById('rank');
    if (accuracy === 100) { rankEl.innerText = "SSS"; rankEl.style.color = "#ffff00"; }
    else if (accuracy >= 90) { rankEl.innerText = "S"; rankEl.style.color = "#ff007f"; }
    else if (accuracy >= 75) { rankEl.innerText = "A"; rankEl.style.color = "#00ffcc"; }
    else if (accuracy >= 50) { rankEl.innerText = "B"; rankEl.style.color = "#ffffff"; }
    else { rankEl.innerText = "C"; rankEl.style.color = "#888888"; }
}

// イベントリスナーの安全バインド
window.addEventListener('DOMContentLoaded', () => {
    loadGameData();

    document.getElementById('btn-all-mode').addEventListener('click', () => startGame('all'));
    document.getElementById('btn-fav-mode').addEventListener('click', () => startGame('fav'));
    document.getElementById('btn-fav').addEventListener('click', handleFavToggle);
    document.getElementById('answer-form').addEventListener('submit', handleFormSubmit);
});