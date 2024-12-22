const dbName = 'BrainBeeDB';
const questionStore = 'questions';
let db;
let currentIndex = 0;
let score = 0;
let questions = [];
let incorrectQuestions = [];

// Load questions from JSONBin
const loadQuestionsFromJSONBin = async () => {
    const binID = '6767b0c0e41b4d34e4696b0e';
    const url = `https://api.jsonbin.io/v3/b/${6767b0c0e41b4d34e4696b0e}`;
    const headers = {
        'X-Master-Key': '$2a$10$wfKJ4PJCZ.LkUOcAajI1P.RYoG7H0v0lmypdP.XoCXBysXroY.8nW', // Replace with your JSONBin Master Key
    };
    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        questions = data.record;
        renderQuestion();
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
};

// Render current question
const renderQuestion = () => {
    if (currentIndex < questions.length) {
        const question = questions[currentIndex];
        document.getElementById('question').textContent = question.text;
        const choicesContainer = document.getElementById('choices');
        choicesContainer.innerHTML = '';
        question.choices.forEach(choice => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'choices';
            input.value = choice;
            label.appendChild(input);
            label.appendChild(document.createTextNode(choice));
            choicesContainer.appendChild(label);
        });
        document.getElementById('explanation').textContent = '';
    } else {
        currentIndex = 0;
        incorrectQuestions.length > 0 ? retryIncorrect() : alert('Completed all questions!');
    }
};

// Check answer
const checkAnswer = () => {
    const selectedOption = document.querySelector('input[name="choices"]:checked');
    if (!selectedOption) {
        alert('Please select an option!');
        return;
    }
    const choice = selectedOption.value;
    const question = questions[currentIndex];
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
    questions = incorrectQuestions;
    incorrectQuestions = [];
    renderQuestion();
};

// Initialize app
window.onload = () => {
    loadQuestionsFromJSONBin();
    document.getElementById('next-btn').onclick = () => {
        checkAnswer();
        renderQuestion();
    };
};
