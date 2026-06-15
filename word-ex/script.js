let words = [];
let currentIndex = 0;
let correctCount = 0;

// JSONから単語データをロード
async function loadWords() {
    try {
        const response = await fetch('words.json');
        words = await response.json();
        words.sort(() => Math.random() - 0.5); // シャッフル
        
        document.getElementById('total-q').innerText = words.length;
        showQuestion();
    } catch (error) {
        document.getElementById('meaning-display').innerText = "DATA LOAD ERROR";
    }
}

// 問題を表示（意味を画面に出して、スペルを当てさせる）
function showQuestion() {
    if (currentIndex >= words.length) {
        showResult();
        return;
    }
    
    // 進捗更新
    document.getElementById('current-q').innerText = currentIndex + 1;
    // 入力欄をクリアしてフォーカス
    const inputEl = document.getElementById('user-input');
    inputEl.value = "";
    inputEl.focus();
    
    // 日本語を表示
    document.getElementById('meaning-display').innerText = words[currentIndex].meaning;
}

// 解答送信時の処理
function submitAnswer(event) {
    event.preventDefault(); // ページリロード防止
    
    const userInput = document.getElementById('user-input').value.trim().toLowerCase();
    const correctAnswer = words[currentIndex].word.trim().toLowerCase();
    const overlay = document.getElementById('judge-overlay');
    
    if (userInput === correctAnswer) {
        // ⭕ 正解演出
        correctCount++;
        overlay.className = "correct-flash";
    } else {
        // ❌ 不正解演出
        overlay.className = "wrong-flash";
    }
    
    // 0.2秒後に演出を消して次の問題へ
    setTimeout(() => {
        overlay.className = "";
        currentIndex++;
        showQuestion();
    }, 200);
}

// スコア評価（正答率スタイル）
function showResult() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    
    // 正答率の計算
    const accuracy = Math.round((correctCount / words.length) * 100);
    
    document.getElementById('accuracy').innerText = accuracy;
    document.getElementById('correct-count').innerText = correctCount;
    document.getElementById('total-count').innerText = words.length;

    const rankEl = document.getElementById('rank');
    
    // 正答率（%）でガチ判定
    if (accuracy === 100) {
        rankEl.innerText = "SSS";
        rankEl.style.color = "#ffff00"; // ゴールド
    } else if (accuracy >= 90) {
        rankEl.innerText = "S";
        rankEl.style.color = "#ff007f"; // ピンク
    } else if (accuracy >= 75) {
        rankEl.innerText = "A";
        rankEl.style.color = "#00ffcc"; // シアン
    } else if (accuracy >= 50) {
        rankEl.innerText = "B";
        rankEl.style.color = "#ffffff"; // ホワイト
    } else {
        rankEl.innerText = "C";
        rankEl.style.color = "#888888"; // グレー
    }
}

// 起動
loadWords();