const dbName = 'BrainBeeDB';
const questionStore = 'questions';
let db;
let currentIndex = 0;
let score = 0;
let incorrectQuestions = [];

// Initialize IndexedDB
const openDB = () => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = event => {
        db = event.target.result;
        if (!db.objectStoreNames.contains(questionStore)) {
            db.createObjectStore(questionStore, { keyPath: 'id', autoIncrement: true });
        }
    };
    request.onsuccess = event => {
        db = event.target.result;
        loadQuestions();
    };
};

// Add sample questions
const loadQuestions = () => {
    const transaction = db.transaction(questionStore, 'readwrite');
    const store = transaction.objectStore(questionStore);
    store.clear();
    const questions = [
        { text: 'What is the largest part of the brain?', choices: ['Cerebellum', 'Cerebrum', 'Brainstem'], correct: 'Cerebrum', explanation: 'The cerebrum makes up the largest part of the brain.' },
        { text: 'Which lobe is responsible for vision?', choices: ['Frontal', 'Occipital', 'Temporal'], correct: 'Occipital', explanation: 'The occipital lobe processes visual information.' },
    ];
    questions.forEach(question => store.add(question));
    transaction.oncomplete = () => renderQuestion();
};

// Render current question
const renderQuestion = () => {
    const transaction = db.transaction(questionStore, 'readonly');
    const store = transaction.objectStore(questionStore);
    const request = store.getAll();
    request.onsuccess = event => {
        const questions = event.target.result;
        if (currentIndex < questions.length) {
            const question = questions[currentIndex];
            document.getElementById('question').textContent = question.text;
            const choicesContainer = document.getElementById('choices');
            choicesContainer.innerHTML = '';
            question.choices.forEach(choice => {
                const li = document.createElement('li');
                li.textContent = choice;
                li.onclick = () => checkAnswer(choice, question);
                choicesContainer.appendChild(li);
            });
            document.getElementById('explanation').textContent = '';
        } else {
            currentIndex = 0;
            incorrectQuestions.length > 0 ? retryIncorrect() : alert('Completed all questions!');
        }
    };
};

// Check answer
const checkAnswer = (choice, question) => {
    if (choice === question.correct) {
        score++;
        document.getElementById('score').textContent = score;
        document.getElementById('explanation').textContent = 'Correct! ' + question.explanation;
    } else {
        document.getElementById('explanation').textContent = 'Incorrect! ' + question.explanation;
        incorrectQuestions.push(question);
    }
    currentIndex++;
};

// Retry incorrect questions
const retryIncorrect = () => {
    alert('Retrying incorrect questions.');
    const transaction = db.transaction(questionStore, 'readwrite');
    const store = transaction.objectStore(questionStore);
    incorrectQuestions.forEach(q => store.add(q));
    incorrectQuestions = [];
    renderQuestion();
};

// Initialize app
window.onload = () => {
    openDB();
    document.getElementById('next-btn').onclick = renderQuestion;
};
