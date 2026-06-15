let allWords = [];  // JSONの全単語
let testWords = []; // 今回のステージで遊ぶ単語
let currentIndex = 0;
let correctCount = 0;

// LocalStorageからお気に入りリストを取得
function getFavorites() {
    const favs = localStorage.getItem('word_stage_favs');
    return favs ? JSON.parse(favs) : [];
}

// お気に入りリストをLocalStorageに保存
function saveFavorites(favs) {
    localStorage.setItem('word_stage_favs', JSON.stringify(favs));
}

// 最初に対象データをロードする
async function loadGameData() {
    try {
        const response = await fetch('words.json');
        allWords = await response.json();
        
        // お気に入りが0件なら、セレクト画面の「FAVORITE STAGE」ボタンをグレーアウト
        const favs = getFavorites();
        const favBtn = document.getElementById('btn-fav-mode');
        if (favs.length === 0) {
            favBtn.style.opacity = "0.4";
            favBtn.style.pointerEvents = "none";
            document.querySelector('#btn-fav-mode .mode-desc').innerText = "お気に入りが未登録です（ゲーム中に★を押して登録）";
        }
    } catch (error) {
        alert("データのロードに失敗しましたYO");
    }
}

// ステージ開始（モード選択）
function startGame(mode) {
    const favs = getFavorites();

    if (mode === 'fav') {
        // お気に入り登録された単語だけを全単語から抽出
        testWords = allWords.filter(item => favs.includes(item.word));
    } else {
        testWords = [...allWords];
    }

    if (testWords.length === 0) return;

    // シャッフル
    testWords.sort(() => Math.random() - 0.5);

    // 画面切り替え
    document.getElementById('select-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('total-q').innerText = testWords.length;
    
    showQuestion();
}

// 問題表示
function showQuestion() {
    if (currentIndex >= testWords.length) {
        showResult();
        return;
    }
    
    document.getElementById('current-q').innerText = currentIndex + 1;
    
    const inputEl = document.getElementById('user-input');
    inputEl.value = "";
    inputEl.focus();
    
    const currentWordData = testWords[currentIndex];
    document.getElementById('meaning-display').innerText = currentWordData.meaning;
    document.getElementById('sentence-display').innerText = currentWordData.sentence;

    // ★マークの状態を反映
    const favs = getFavorites();
    const favBtn = document.getElementById('btn-fav');
    if (favs.includes(currentWordData.word)) {
        favBtn.classList.add('active');
    } else {
        favBtn.classList.remove('active');
    }
}

// ★のトグル（登録/解除）処理
function toggleFavorite() {
    const currentWord = testWords[currentIndex].word;
    let favs = getFavorites();
    const favBtn = document.getElementById('btn-fav');

    if (favs.includes(currentWord)) {
        // 既にあったら削除
        favs = favs.filter(w => w !== currentWord);
        favBtn.classList.remove('active');
    } else {
        // なければ追加
        favs.push(currentWord);
        favBtn.classList.add('active');
    }
    saveFavorites(favs);
}

// 解答送信
function submitAnswer(event) {
    event.preventDefault();
    
    const userInput = document.getElementById('user-input').value.trim().toLowerCase();
    const correctAnswer = testWords[currentIndex].word.trim().toLowerCase();
    const overlay = document.getElementById('judge-overlay');
    
    if (userInput === correctAnswer) {
        correctCount++;
        overlay.className = "correct-flash";
    } else {
        overlay.className = "wrong-flash";
    }
    
    setTimeout(() => {
        overlay.className = "";
        currentIndex++;
        showQuestion();
    }, 200);
}

// リザルト表示
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

// HTMLの読み込みが完全に終わってから起動・ボタンの紐付けを行う安全装置
window.addEventListener('DOMContentLoaded', () => {
    // 1. まずデータをロードする
    loadGameData();

    // 2. 「ALLモード」ボタンにクリックイベントを設定
    const allBtn = document.getElementById('btn-all-mode');
    if (allBtn) {
        allBtn.addEventListener('click', () => startGame('all'));
    }

    // 3. 「お気に入りモード」ボタンにクリックイベントを設定
    const favBtn = document.getElementById('btn-fav-mode');
    if (favBtn) {
        favBtn.addEventListener('click', () => startGame('fav'));
    }
});