class TriviaGame {

    // trivia game properties and constructor

    constructor() {
        this.config = {};
        this.questions = [];
        this.currentQuestion = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.timer = null;
        this.timeLeft = 20;
        this.totalQuestions = 0;
        this.totalTime = 0;
        this.isAnswerSelected = false;

        this.initializeApp();
    }

    initializeApp() {
        this.loadCategories();
        this.setupEventListeners();
    }

    // async function to load categories from API
    async loadCategories() {
        try {
            const response = await fetch('https://opentdb.com/api_category.php');
            const data = await response.json();
            // load categories into the game
            this.populateCategories(data.trivia_categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    // populate categories in the select element
    populateCategories(categories) {
        const categorySelect = document.getElementById('category');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    // setup event listeners for UI elements
    setupEventListeners() {

        // startup screen: start button
        document.getElementById('start-btn').addEventListener('click', () => {
            this.showScreen('config-screen');
        });

        // config form: difficulty, category, number of questions
        document.getElementById('config-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startGame();
        });

        // restart game with same config
        document.getElementById('restart-same').addEventListener('click', () => {
            this.restartGame(true);
        });
        // restart game with new config
        document.getElementById('restart-new').addEventListener('click', () => {
            this.restartGame(false);
        });
        // quit game
        document.getElementById('quit').addEventListener('click', () => {
            this.showScreen('config-screen');
        });
    }

    // async function to start the game
    async startGame() {
        // load config
        this.config = {
            playerName: document.getElementById('player-name').value,
            questionCount: document.getElementById('question-count').value,
            difficulty: document.getElementById('difficulty').value,
            category: document.getElementById('category').value
        };

        this.showScreen('loading-screen');
        // wait for config to be set before fetching questions
        await this.fetchQuestions();
    }   

    // async function to fetch questions from API
    async fetchQuestions() {
        // build API URL based on config (Generate API URL on page)
        const url = `https://opentdb.com/api.php?amount=${this.config.questionCount}&category=${this.config.category !== '0' ? this.config.category : ''}&difficulty=${this.config.difficulty}&type=multiple&encode=base64`;
        try {
            const response = await fetch(url);
            const data = await response.json();

            // response code is a property from the API response, 0 means success
            if (data.response_code === 0) {
                this.questions = data.results;
                this.showScreen('game-screen');
                this.displayQuestion();
            } else {
                throw new Error('Error loading questions from API');
            }
        } catch (error) {
            alert('Error loading questions. Please try again.');
            this.showScreen('config-screen');
        }
    }

    // function to display the current question
    displayQuestion() {
        this.resetTimer();
        const question = this.questions[this.currentQuestion];
        // display question and options
        document.getElementById('progress'). textContent = `Question ${this.currentQuestion + 1} of ${this.questions.length}`;
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('question-text').innerHTML = atob(question.question);

        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        //opt : options
        //atob is necessary to decode base64 encoded strings from trivia API
        const allOptions = [...question.incorrect_answers.map(opt => atob(opt)), atob(question.correct_answer)];

        allOptions.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.addEventListener('click', () => this.checkAnswer(option, question.correct_answer));
            optionsContainer.appendChild(button);
        });
        // start timer for question
        this.startTimer();
    }

    // AUX functions for trivia game

    // start game timer
    startTimer() {
        this.timeLeft = 20;
        this.updateTimerDisplay();
        // set interval 
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                // call function to handle time up (next question)
                this.handleTimeUp();
            } 
        // 1 second
        }, 1000);
    }

    // reset timer for question
    resetTimer() {
        // clear interval and reset time left
        clearInterval(this.timer);
        this.timeLeft = 20;
    }

    // handle time up scenario
    handleTimeUp() {
        clearInterval(this.timer);
        this.currentQuestion++;
        // add full time for one question (20 seconds used)
        this.totalTime += 20;
        if (this.currentQuestion < this.questions.length) {
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }

    // check if selected answer is correct
    checkAnswer(selectedAnswer, correct) {
        clearInterval(this.timer);
        // resets timer
        this.totalTime += (20 - this.timeLeft);

        //fetch correct answer from API data
        const correctAnswer = atob(correct);
        const buttons = document.querySelectorAll('#options-container button');

        buttons.forEach(button => {
            // disable all buttons after selection
            button.disabled = true;
            if (button.textContent === correctAnswer) {
                button.classList.add('correct');
            } else if (button.textContent === selectedAnswer && selectedAnswer !== correctAnswer) {
                button.classList.add('incorrect');
            }
        });

        if (selectedAnswer === correctAnswer) {
            // increase score for correct answer
            this.score += 10;
            this.correctAnswers++;
        }

        setTimeout(() => {
            this.currentQuestion++;
            // if there are more questions, display next question
            if (this.currentQuestion < this.questions.length) {
                this.displayQuestion();
            } else {
                this.showResults();
            }
        }, 2000);
    }

    // AUX functions for trivia game

    // show screens with IDs
    showScreen(screenId) {
        // mark all screens as inactive and activate the selected one
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    // show results with stats
    showResults() {
        this.showScreen('result-screen');
        const percentage = ((this.correctAnswers / this.questions.length) * 100).toFixed(1);
        const avgTime = (this.totalTime / this.questions.length).toFixed(1);

        document.getElementById('results-content').innerHTML = `
            <p><strong>Player:</strong> ${this.config.playerName}</p>
            <p><strong>Total Score:</strong> ${this.score}</p>
            <p><strong>Correct Answers:</strong> ${this.correctAnswers} of ${this.questions.length} (${percentage}%)</p>
            <p><strong>Accuracy Percentage:</strong> ${percentage}%</p>
            <p><strong>Average Time per Question:</strong> ${avgTime} seconds</p>
        `;
    }

    //restart game 
    restartGame(sameconfig) {
        //set initial values for a new game
        this.currentQuestion = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.totalTime = 0;
        // if config is the same, start game directly
        if (sameconfig) {
            this.startGame();
        } else {
        // else, go back to config screen
            this.showScreen('config-screen');
        }
    }

    // update displayTimer in real time
    updateTimerDisplay() {
        const timerBar= document.getElementById('timer-bar');
        const percentage = (this.timeLeft / 20) * 100;
        timerBar.style.width = `${percentage}%`;
        timerBar.className = '';
        if (this.timeLeft <= 5) {
            // if there are 5 seconds or less, change color to red
            timerBar.classList.add('danger');
        } else if (this.timeLeft <= 10) {
            timerBar.classList.add('warning');
        }
    }
}

// Initialize the trivia game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new TriviaGame();
});
