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

function showQuestion() {
    if (currentIndex >= testWords.length) {
        showResult();
        return;
    }
    
    isReviewPhase = false;
    
    // 表示のリセット
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
    
    // 出題（日本語訳のみをドカンと出す）
    const currentData = testWords[currentIndex];
    document.getElementById('meaning-display').innerText = currentData.meaning;

    // ★ボタンの同期
    const favs = getFavorites();
    const favBtn = document.getElementById('btn-fav');
    if (favs.includes(currentData.word)) {
        favBtn.classList.add('active');
    } else {
        favBtn.classList.remove('active');
    }
}

// お気に入りトグルのイベント紐付け用
function handleFavToggle() {
    const currentWord = testWords[currentIndex].word;
    let favs = getFavorites();
    const favBtn = document.getElementById('btn-fav');

    if (favs.includes(currentWord)) {
        favs = favs.filter(w => w !== currentWord);
        favBtn.classList.remove('active');
    } else {
        favs.push(currentWord);
        favBtn.classList.add('active');
    }
    saveFavorites(favs);
}

// フォーム送信時のメインロジック（判定 ⇄ 次へ）
function handleFormSubmit(event) {
    event.preventDefault();
    
    // フェーズ2: すでに答え合わせ画面なら、次の問題へ進む
    if (isReviewPhase) {
        currentIndex++;
        showQuestion();
        return;
    }
    
    // フェーズ1: 解答の判定とレビュー表示
    const inputEl = document.getElementById('user-input');
    const userInput = inputEl.value.trim().toLowerCase();
    
    // 正解フレーズを自動生成（大文字小文字スペースをトリミング）
    const currentData = testWords[currentIndex];
    const correctAnswer = cleanPhrase(currentData.sentence, currentData.word).toLowerCase();
    
    const overlay = document.getElementById('judge-overlay');
    
    // 正誤の記録
    if (userInput === correctAnswer) {
        correctCount++;
        overlay.className = "correct-flash";
        document.getElementById('review-user').style.color = "#00ff66"; // ユーザー入力も緑に
    } else {
        overlay.className = "wrong-flash";
        document.getElementById('review-user').style.color = "#ff0055"; // 間違ってたらピンクに
    }
    
    // 即時正答確認の文字をセットして表示
    document.getElementById('review-correct').innerText = correctAnswer;
    document.getElementById('review-user').innerText = userInput || "(空欄)";
    document.getElementById('review-container').style.display = 'flex';
    
    // 入力欄をロックして、ボタンを「NEXT」に変形
    isReviewPhase = true;
    inputEl.readOnly = true;
    
    const submitBtn = document.getElementById('btn-submit');
    submitBtn.innerText = "NEXT STAGE";
    submitBtn.classList.add('next-phase');
    submitBtn.focus(); // ボタンにフォーカスをあててEnter連打で進めるようにする
}

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