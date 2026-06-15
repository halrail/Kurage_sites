let words = [];
let currentIndex = 0;
let isFlipped = false;
let combo = 0;
let maxCombo = 0;

// JSONから単語データをロード
async function loadWords() {
    try {
        const response = await fetch('words.json');
        words = await response.json();
        // 毎回問題をシャッフルしてモチベ維持
        words.sort(() => Math.random() - 0.5);
        showWord();
    } catch (error) {
        document.getElementById('word-display').innerText = "DATA LOAD ERROR";
    }
}

// 単語を画面に表示
function showWord() {
    if (currentIndex >= words.length) {
        showResult();
        return;
    }
    isFlipped = false;
    document.getElementById('word-display').innerText = words[currentIndex].word;
    document.getElementById('word-display').style.color = "#00ffcc";
}

// カードをめくる処理（英⇄日）
function flipCard() {
    if (currentIndex >= words.length) return;
    isFlipped = !isFlipped;
    const display = document.getElementById('word-display');
    if (isFlipped) {
        display.innerText = words[currentIndex].meaning;
        display.style.color = "#ff007f";
    } else {
        display.innerText = words[currentIndex].word;
        display.style.color = "#00ffcc";
    }
}

// ⭕❌判定
function handleAnswer(isCorrect) {
    if (words.length === 0 || currentIndex >= words.length) return;

    const comboEl = document.getElementById('combo-container');

    if (isCorrect) {
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        // コンボ時に画面をちょっとポップさせる演出
        comboEl.style.transform = "scale(1.3)";
        setTimeout(() => comboEl.style.transform = "scale(1)", 100);
    } else {
        combo = 0; // 間違えたらコンボストップ！
    }

    document.getElementById('combo-count').innerText = combo;

    // 次の単語へ
    currentIndex++;
    showWord();
}

// スコア評価（音ゲースタイル）
function showResult() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('max-combo').innerText = maxCombo;

    const rankEl = document.getElementById('rank');
    
    // フルコンボならSSS、以下コンボ率に応じてランク変動
    if (maxCombo === words.length) {
        rankEl.innerText = "SSS";
        rankEl.style.color = "#ffff00";
    } else if (maxCombo >= words.length * 0.7) {
        rankEl.innerText = "S";
        rankEl.style.color = "#ff007f";
    } else if (maxCombo >= words.length * 0.4) {
        rankEl.innerText = "A";
        rankEl.style.color = "#00ffcc";
    } else {
        rankEl.innerText = "B";
        rankEl.style.color = "#888888";
    }
}

// アプリ起動時にロードを開始
loadWords();