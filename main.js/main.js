let words = [];
let currentIndex = 0;
let currentMode = 'cards';

// 1. פענוח וטעינת נתונים מה-URL
function loadFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('w');
    
    // אם אין נתונים בקישור (הדף נפתח "ריק")
    if (!data) {
        document.getElementById('app').innerHTML = `
            <div class="text-center p-10 bg-white rounded-[2.5rem] shadow-2xl animate-fade-in border-t-8 border-blue-500 max-w-md mx-auto mt-20">
                <h2 class="text-3xl font-black text-blue-600 mb-4">Word Adventure 🚀</h2>
                <p class="text-slate-600 font-bold mb-6 text-lg">ברוכים הבאים! כדי להתחיל ללמוד, היכנסו דרך קישור מהפורטל או מהטבלה שלכם.</p>
                <div class="text-5xl opacity-20">📖</div>
            </div>`;
        return;
    }

    try {
        // פענוח Base64 ותמיכה בעברית (UTF-8)
        const decodedData = decodeURIComponent(atob(data).split('').map(c => 
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        
        const lines = decodedData.split('\n');
        const title = lines[0] || "יחידת לימוד";
        
        // יצירת מערך המילים
        words = lines.slice(1).filter(line => line.includes('-')).map(line => {
            const [eng, heb] = line.split('-').map(s => s.trim());
            return { eng, heb };
        });

        if (words.length > 0) {
            renderApp(title);
        } else {
            throw new Error("No words found in data");
        }
    } catch (e) {
        console.error("Decoding error:", e);
        document.getElementById('app').innerHTML = `
            <div class="text-center p-10 bg-white rounded-3xl shadow-lg border-2 border-red-200 mt-20 max-w-md mx-auto">
                <h2 class="text-2xl font-bold text-red-500 mb-2">אופס! משהו השתבש 😕</h2>
                <p class="text-slate-500">נראה שהקישור הזה שבור או שלא הועתק במלואו.</p>
            </div>`;
    }
}

// 2. בניית ממשק האפליקציה
function renderApp(title) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="text-center mb-8 animate-fade-in w-full">
            <h1 class="text-4xl font-black text-blue-600 mb-6 drop-shadow-sm">${title}</h1>
            <div class="flex gap-3 justify-center">
                <button onclick="switchMode('cards')" id="btn-cards" class="px-6 py-2 rounded-2xl font-bold shadow-lg transition-all">כרטיסיות 🗂️</button>
                <button onclick="switchMode('quiz')" id="btn-quiz" class="px-6 py-2 rounded-2xl font-bold shadow-lg transition-all">מבחן 📝</button>
            </div>
        </div>
        <div id="game-container" class="w-full flex flex-col items-center"></div>
    `;
    switchMode('cards');
}

// 3. החלפת מצבי משחק
function switchMode(mode) {
    currentMode = mode;
    currentIndex = 0;
    
    const isCards = mode === 'cards';
    const btnCards = document.getElementById('btn-cards');
    const btnQuiz = document.getElementById('btn-quiz');

    // עדכון מראה הכפתורים
    btnCards.className = isCards ? "px-6 py-2 bg-blue-600 text-white rounded-2xl font-bold shadow-lg" : "px-6 py-2 bg-white border-2 border-blue-500 text-blue-600 rounded-2xl font-bold hover:bg-blue-50";
    btnQuiz.className = !isCards ? "px-6 py-2 bg-green-600 text-white rounded-2xl font-bold shadow-lg" : "px-6 py-2 bg-white border-2 border-green-500 text-green-600 rounded-2xl font-bold hover:bg-green-50";

    if (mode === 'cards') renderCards();
    else startQuiz();
}

// 4. לוגיקת כרטיסיות
function renderCards() {
    const container = document.getElementById('game-container');
    const word = words[currentIndex];
    container.innerHTML = `
        <div class="perspective-1000 w-80 h-96 cursor-pointer animate-fade-in" onclick="this.classList.toggle('card-flipped')">
            <div class="card-inner w-full h-full shadow-2xl">
                <div class="card-front bg-white text-5xl font-black text-blue-600 eng-text border-4 border-blue-100">${word.eng}</div>
                <div class="card-back bg-blue-600 text-5xl font-bold text-white border-4 border-white text-center p-4">${word.heb}</div>
            </div>
        </div>
        <div class="flex gap-10 mt-10 items-center">
            <button onclick="changeCard(-1)" class="text-5xl hover:scale-125 transition-transform active:scale-90">➡️</button>
            <div class="bg-white px-6 py-2 rounded-full shadow-md font-black text-gray-500">
                ${currentIndex + 1} / ${words.length}
            </div>
            <button onclick="changeCard(1)" class="text-5xl hover:scale-125 transition-transform active:scale-90">⬅️</button>
        </div>
    `;
}

function changeCard(step) {
    currentIndex = (currentIndex + step + words.length) % words.length;
    renderCards();
}

// 5. לוגיקת מבחן
function startQuiz() {
    if (currentIndex >= words.length) {
        document.getElementById('game-container').innerHTML = `
            <div class="text-center p-10 bg-white rounded-[3rem] shadow-2xl animate-fade-in border-t-8 border-green-500">
                <h2 class="text-4xl font-black text-green-600 mb-4">אלופים! ✨</h2>
                <p class="text-xl mb-6 font-bold text-slate-500">סיימתם את המבחן בהצלחה.</p>
                <button onclick="switchMode('cards')" class="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-colors">תרגול חוזר</button>
            </div>`;
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        return;
    }

    const word = words[currentIndex];
    const options = [word.heb, ...words.filter(w => w.heb !== word.heb).sort(() => 0.5 - Math.random()).slice(0, 3).map(w => w.heb)].sort(() => 0.5 - Math.random());

    document.getElementById('game-container').innerHTML = `
        <div class="w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl border-b-8 border-green-500 animate-fade-in">
            <div class="text-center mb-8">
                <span class="text-sm font-bold text-slate-400">שאלה ${currentIndex + 1} מתוך ${words.length}</span>
                <h2 class="text-5xl font-black text-slate-800 mt-2 eng-text">${word.eng}</h2>
            </div>
            <div class="grid gap-3">
                ${options.map(opt => `<button onclick="checkAnswer('${opt}', '${word.heb}')" class="p-5 text-2xl font-bold border-2 border-slate-100 rounded-2xl hover:bg-green-50 hover:border-green-500 transition-all active:scale-95">${opt}</button>`).join('')}
            </div>
        </div>
    `;
}

function checkAnswer(selected, correct) {
    if (selected === correct) {
        currentIndex++;
        startQuiz();
    } else { 
        const btn = event.target;
        btn.classList.add('bg-red-50', 'border-red-500', 'text-red-500');
        setTimeout(() => btn.classList.remove('bg-red-50', 'border-red-500', 'text-red-500'), 500);
    }
}

// 6. מצב לילה
document.getElementById('toggleNight').addEventListener('click', () => {
    document.body.classList.toggle('night-mode');
    document.getElementById('toggleNight').innerText = document.body.classList.contains('night-mode') ? '🌙' : '☀️';
});

// הפעלה ראשונית
loadFromUrl();
