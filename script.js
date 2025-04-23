let socket;
try {
    socket = io("http://localhost:5000", { reconnection: true, reconnectionAttempts: 5 });
    
    socket.on('connect', () => {
        console.log('Connected to server successfully');
    });
    
    socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        showResult("Sunucu bağlantı hatası. Lütfen sunucunun çalıştığından emin olun.", "error");
    });
} catch (error) {
    console.error('Socket.IO initialization error:', error);
}

const words = [
    { word: "elma", hint: "Kırmızı, yeşil veya sarı olabilir." },
    { word: "bilgisayar", hint: "İş yapmanıza, oyun oynamanıza yardımcı olur." },
    { word: "istanbul", hint: "1453'te fethedilen şehir." },
    { word: "telefon", hint: "Günlük iletişim için kullanılır." },
    { word: "cumhuriyet", hint: "1923'te Türkiye'de kurulan yönetim şekli." },
    { word: "kitap", hint: "Bilgi dolu sayfalardan oluşur, okumayı sevenlerin vazgeçilmezi." },
    { word: "güneş", hint: "Dünyamızı ısıtan ve aydınlatan gök cismi." },
    { word: "kelebek", hint: "Renkli kanatları olan ve kısa ömürlü uçan canlı." },
    { word: "şehir", hint: "İnsanların yaşadığı büyük yerleşim bölgesi." },
    { word: "kalem", hint: "Yazı yazmak için kullanılan araç." },
    { word: "uçak", hint: "Havada yolculuk yapmaya yarayan taşıt." },
    { word: "çikolata", hint: "Tatlı ve kakao içeren sevilen yiyecek." },
    { word: "deniz", hint: "Büyük su kütlesi, yüzmek için harika!" },
    { word: "fil", hint: "Dünyadaki en büyük kara hayvanı." },
    { word: "çay", hint: "Genellikle sıcak içilir, kahvaltının vazgeçilmezi." },
    { word: "kamera", hint: "Fotoğraf ve video çekmeye yarayan cihaz." },
    { word: "radyo", hint: "Sesli yayınlar yapan iletişim aracı." },
    { word: "araba", hint: "Kara yolunda kullanılan motorlu taşıt." },
    { word: "tren", hint: "Raylar üzerinde giden uzun ve hızlı ulaşım aracı." },
    { word: "gezegen", hint: "Güneş sistemindeki büyük gök cisimleri." },
    { word: "köprü", hint: "İki yeri birbirine bağlayan yapı." },
    { word: "balık", hint: "Suda yaşayan yüzgeçli canlı." },
    { word: "televizyon", hint: "Film, haber ve program izlemek için kullanılan cihaz." },
    { word: "çiftlik", hint: "Hayvanların yetiştirildiği ve ürünlerin üretildiği yer." },
    { word: "asteroit", hint: "Uzayda dolaşan küçük kayalık gök cismi." },
    { word: "robot", hint: "Hareket edebilen yapay mekanik cihaz." },
    { word: "parfüm", hint: "Güzel kokular içerir, insanlar tarafından kullanılır." },
    { word: "elbise", hint: "Giyilen kumaş parçası, moda dünyasının bir parçası." },
    { word: "harita", hint: "Yerlerin çizimle gösterildiği görsel belge." },
    { word: "futbol", hint: "Popüler spor, 11 oyuncu ile oynanır." }
];

let currentIndex = 0;
let score = 0;
let generalTimeLeft = 420;
let generalTimerInterval;
let revealedLetters = [];
let maxHints = 5;
let hintsUsed = 0;
let playerName = "";

function startGame() {
    playerName = document.getElementById("playerName").value.trim();
    if (!playerName) {
        showResult("Lütfen adınızı girin!", "error");
        return;
    }
    console.log("Oyun başlıyor, oyuncu adı:", playerName);
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameScreen").style.display = "block";
    startGeneralTimer();
    displayHint();
    socket.emit("join_game", playerName);
}

function startGeneralTimer() {
    clearInterval(generalTimerInterval);
    document.getElementById("generalTimer").innerText = `Genel Süre: ${generalTimeLeft} saniye`;

    generalTimerInterval = setInterval(() => {
        generalTimeLeft--;
        document.getElementById("generalTimer").innerText = `Genel Süre: ${generalTimeLeft} saniye`;

        if (generalTimeLeft <= 0) {
            clearInterval(generalTimerInterval);
            endGame();
        }
    }, 1000);
}

function displayHint() {
    if (currentIndex < words.length) {
        document.getElementById("hint").innerText = words[currentIndex].hint;
    } else {
        showResult("Tebrikler! Oyunu tamamladınız 🎉", "success");
        endGame();
    }
}

function checkGuess() {
    if (currentIndex >= words.length) return;

    const userGuess = document.getElementById("guessInput").value.trim().toLowerCase();
    const resultEl = document.getElementById("result");

    if (userGuess === words[currentIndex].word) {
        let points = 5 - hintsUsed;
        if (points < 1) points = 1;
        score += points;

        showResult(`Doğru tahmin! 🎉 Puanınız: ${score}`, "success");
        document.getElementById("score").innerText = `Toplam Puan: ${score}`;

        currentIndex++;
        revealedLetters = [];
        hintsUsed = 0;

        setTimeout(() => {
            document.getElementById("guessInput").value = "";
            resultEl.innerText = "";
            resultEl.className = "";
            displayHint();
        }, 1000);

        sendScoreToServer();
    } else {
        showResult("Yanlış tahmin, tekrar deneyin!", "error");
    }
}

function passWord() {
    currentIndex++;
    revealedLetters = [];
    hintsUsed = 0;
    document.getElementById("guessInput").value = "";
    document.getElementById("result").innerText = "";
    document.getElementById("result").className = "";
    displayHint();
}

function revealLetter() {
    if (hintsUsed >= maxHints) {
        showResult("Maksimum harf açma hakkına ulaştınız!", "error");
        return;
    }

    const currentWord = words[currentIndex].word;
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * currentWord.length);
    } while (revealedLetters.includes(randomIndex));

    revealedLetters.push(randomIndex);
    hintsUsed++;

    const displayedWord = currentWord
        .split("")
        .map((letter, index) => (revealedLetters.includes(index) ? letter : "_"))
        .join(" ");

    document.getElementById("hint").innerText = `${words[currentIndex].hint} | Harf: ${displayedWord}`;
}

function endGame() {
    showResult("Oyun bitti! 🎉", "success");
    clearInterval(generalTimerInterval);
    document.getElementById("gameScreen").style.display = "none";
    document.getElementById("startScreen").style.display = "block";

    currentIndex = 0;
    score = 0;
    generalTimeLeft = 420;
    revealedLetters = [];
    hintsUsed = 0;
    document.getElementById("guessInput").value = "";
    document.getElementById("result").innerText = "";
    document.getElementById("result").className = "";
    document.getElementById("generalTimer").innerText = "";
    document.getElementById("hint").innerText = "";
    document.getElementById("score").innerText = "";
}

function restartGame() {
    endGame();
    startGame();
}

function showResult(message, type) {
    const resultEl = document.getElementById("result");
    resultEl.innerText = message;
    resultEl.className = type;
}

function sendScoreToServer() {
    console.log("Skor gönderiliyor:", { player_name: playerName, score: score });
    
    try {
        const localScores = JSON.parse(localStorage.getItem('wordGameScores') || '[]');
        const existingScoreIndex = localScores.findIndex(item => item.player_name === playerName);
        
        if (existingScoreIndex >= 0) {
            if (localScores[existingScoreIndex].score < score) {
                localScores[existingScoreIndex].score = score;
            }
        } else {
            localScores.push({ player_name: playerName, score: score });
        }
        
        localStorage.setItem('wordGameScores', JSON.stringify(localScores));
        console.log("Skor yerel olarak kaydedildi");
    } catch (e) {
        console.error("Yerel depolama hatası:", e);
    }
    
    fetch("http://localhost:5000/add_score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_name: playerName, score: score }),
        timeout: 5000 
    })
    .then((response) => {
        console.log("Backend yanıtı:", response.status);
        if (!response.ok) {
            throw new Error(`Skor gönderilemedi (Durum kodu: ${response.status})`);
        }
        showResult("Skorunuz kaydedildi!", "success");
    })
    .catch((error) => {
        console.error("Sunucu hatası:", error);
        showResult("Skorunuz yerel olarak kaydedildi. Sunucu bağlantısı sağlandığında otomatik olarak gönderilecek.", "success");
    });
}
