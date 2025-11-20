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

        // sounds
        this.sounds = {
            correct: document.getElementById('correct-sound'),
            wrong: document.getElementById('wrong-sound'),
            timerBeep: document.getElementById('timer-beep'),
            gameStart: document.getElementById('game-start-sound'),
            results: document.getElementById('results-sound')
        };

        this.initializeApp();
    }

    initializeApp() {
        this.loadCategories();
        this.setupEventListeners();
        this.setupRangeInput();
        this.setupDifficultyButtons();
    }

    // setup range input for number of questions
    setupRangeInput() {
        // setup range input for number of questions
        const range= document.getElementById('question-count');
        // update the value display when the range input changes
        const value= document.getElementById('question-count-value');
        // initialize display with the current input value (handles page refresh/restore)
        if (range && value) {
            value.textContent = range.value;
        }
        range.addEventListener('input', (e) => {
            value.textContent = e.target.value;
        });
    }
    
    // setup difficulty buttons (visual feedback, only one active at a time)
    setupDifficultyButtons() { 
        const buttons = document.querySelectorAll('.difficulty-btn');
        const hiddenInput = document.getElementById('difficulty');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // remove active class from all buttons and add to clicked button
                buttons.forEach(b => b.classList.remove('active'));
                // add active class to clicked button
                btn.classList.add('active');
                // set hidden input value to clicked button data-value
                hiddenInput.value = btn.dataset.value;
            });
        });
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
            option.textContent = `🎯 ${category.name}`;
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

        // play game start sound
        this.playSound('gameStart');

        this.showScreen('loading-screen');
        // wait for config to be set before fetching questions
        await this.fetchQuestions();
    }   

    // async function to fetch questions from API
    async fetchQuestions() {
        // build API URL based on config; omit optional params when not set
        const params = new URLSearchParams({
            amount: String(this.config.questionCount || 10),
            type: 'multiple',
            encode: 'base64'
        });
        if (this.config && this.config.category && this.config.category !== '0') {
            params.append('category', this.config.category);
        }
        if (this.config && this.config.difficulty) {
            params.append('difficulty', this.config.difficulty);
        }
        const url = `https://opentdb.com/api.php?${params.toString()}`;
        try {
            const response = await fetch(url);
            const data = await response.json();

            // response code is a property from the API response, 0 means success
            if (data.response_code === 0) {
                this.questions = Array.isArray(data.results) ? data.results : [];
                this.totalQuestions = this.questions.length;
                if (this.totalQuestions === 0) {
                    throw new Error('No questions returned by API');
                }
                this.showScreen('game-screen');
                this.displayQuestion();
            } else if (data.response_code === 1) {
                // no results for selected options
                throw new Error('No questions found for the selected settings. Try different options.');
            } else {
                throw new Error('Error loading questions from API');
            }
        } catch (error) {
            this.showError('Failed to load questions. Please try again.');
            this.showScreen('config-screen');
        }
    }

    // function to display the current question
    displayQuestion() {
        this.resetQuestionState();
        const question = this.questions[this.currentQuestion];
        // display UI elements
        document.getElementById('player-name-display').textContent = this.config.playerName;
        document.getElementById('score').textContent = this.score;
        document.getElementById('correct-answers').textContent = this.correctAnswers;
        document.getElementById('progress'). textContent = `${this.currentQuestion + 1} of ${this.questions.length}`;
        document.getElementById('current-q').textContent = this.currentQuestion + 1;

        // show question text
        document.getElementById('question-text').textContent = this.decodeBase64(question.question);    

        // display answers options
        this.displayOptions(question);

        // start timer for question
        this.startTimer();
    }

    // display options from API
    displayOptions(question) {
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        // combine correct and incorrect answers with 3 dots operator
        const allOptions = [...question.incorrect_answers.map(opt => this.decodeBase64(opt)), 
            this.decodeBase64(question.correct_answer)
        ];

        const optionLabels = ['A', 'B', 'C', 'D'];

        allOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.innerHTML = `<span>${option}</span>`;
            button.setAttribute('data-option', optionLabels[index]);

            button.addEventListener('click', () => {
                if (!this.isAnswerSelected) {
                    this.checkAnswer(option, question.correct_answer);
                }
            });
            optionsContainer.appendChild(button);
        });
    }

    // start game timer
    startTimer() {
        this.timeLeft = 20;
        this.updateTimerDisplay();
        // set interval 
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            // play beep sound when 5 seconds or less
            if (this.timeLeft <= 5 && this.timeLeft > 0) {
                this.playSound('timerBeep');
            }

            if (this.timeLeft <= 0) {
                // call function to handle time up (next question)
                this.handleTimeUp();
            } 
        // 1 second
        }, 1000);
    }

    updateTimerDisplay() {
        const timerText= document.getElementById('timer-text');
        const timerPath= document.getElementById('timer-path');

        timerText.textContent = this.timeLeft;

        // calc progress
        const circumference = 2 * Math.PI * 45; // 2πr where r=45
        const offset = circumference - (this.timeLeft / 20) * circumference;

        timerPath.style.strokeDasharray = String(circumference);
        timerPath.style.strokeDashoffset = offset;

        // update color based on remaining time
        timerPath.classList.remove('warning', 'danger');
        if (this.timeLeft <= 5) {
            timerPath.classList.add('danger');
        } else if (this.timeLeft <= 10) {
            timerPath.classList.add('warning');
        }
    }

        // handle time up scenario
    handleTimeUp() {
        clearInterval(this.timer);
        this.isAnswerSelected = true;
        // IF time is up, answer is wrong
        this.playSound('wrong');
        this.showFeedback(false, "Time's up!");
        
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }
    
    // check if selected answer is correct
    checkAnswer(selectedAnswer, correct) {
        if (this.isAnswerSelected) return; // prevent multiple selections
        clearInterval(this.timer);
        this.isAnswerSelected = true;

        //fetch correct answer from API data
        const correctAnswer = this.decodeBase64(correct);
        const buttons = document.querySelectorAll('.option-btn');
        
        buttons.forEach(button => {
            if (button.querySelector('span').textContent === correctAnswer) {
                // highlight correct answer
                button.classList.add('correct');
            } else if (button.querySelector('span').textContent === selectedAnswer) {
                // highlight incorrect answer
                button.classList.add('incorrect');
            }
            button.style.pointerEvents = 'none'; // disable further clicks
        });
        
        if (selectedAnswer === correctAnswer) {
            // increase score for correct answer
            this.score += 10;
            this.correctAnswers++;
            this.playSound('correct');
            // small delay to allow highlight before switching screens
            setTimeout(() => {
                this.showFeedback(true, 'Correct!, +10 points');
            }, 800);
        } else {
            this.playSound('wrong');
            // small delay to allow highlight before switching screens
            setTimeout(() => {
                this.showFeedback(false, `Incorrect!, The correct answer was: ${correctAnswer}`);
            }, 800);
        }
        // small pause and go to next question
        setTimeout(() => {
            this.nextQuestion();
        }, 3800);
    }

    //show feedback between questions
    showFeedback(isCorrect, message) {
        // get feedback elements from HTML 
        const feedbackIcon = document.getElementById('feedback-icon');
        const feedbackTitle = document.getElementById('feedback-title');
        const feedbackMessage = document.getElementById('feedback-message');
        const countdown = document.getElementById('countdown');

        feedbackIcon.className = `feedback-icon ${isCorrect ? 'correct' : 'incorrect'}`;
        feedbackIcon.innerHTML = isCorrect ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-times"></i>';
        feedbackTitle.textContent = isCorrect ? '¡Correct!' : '¡Incorrect!';
        feedbackMessage.textContent = message;

        this.showScreen('feedback-screen');

        // countdown before next question
        let count = 3;
        countdown.textContent = count;

        const countdownInterval = setInterval(() => {
            count--;
            // update countdown display
            countdown.textContent = count;

            if (count <= 0) {
                clearInterval(countdownInterval);
            }
        // 1 second
        }, 1000);
    }

    // go to next question or show results
    nextQuestion() {
        this.currentQuestion++;

        if (this.currentQuestion < this.questions.length) {
            // display next question
            this.showScreen('game-screen');
            this.displayQuestion();
        } else {
            // if no more questions, show results
            this.showResults();
        }
    }

    // show results with stats
    showResults() {
        this.playSound('results');
        this.showScreen('results-screen');

        const percentage = ((this.correctAnswers / this.questions.length) * 100).toFixed(1);
        const avgTime = (this.totalTime / this.questions.length).toFixed(1);
        
        document.getElementById('result-player').textContent = this.config.playerName;
        document.getElementById('result-score').textContent = this.score;
        document.getElementById('result-correct').textContent = `${percentage}%`;
        const timeEl = document.getElementById('result-time');
        if (timeEl) {
            timeEl.textContent = `${avgTime}s`;
        }

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
    
    // reset timer for question
    resetQuestionState() {
        this.isAnswerSelected = false;
        this.timeLeft = 20;
        clearInterval(this.timer);
    }

    // show screens with IDs
    showScreen(screenId) {
        // mark all screens as inactive and activate the selected one
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    // show specific error
    showError(message) {
        alert(message);
    }
    
    // play sound effects
    playSound(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Sound play error:', e));
        }
    }

    // decode base64 strings from API
    decodeBase64(str) {
        return decodeURIComponent(escape(window.atob(str)));
    }
    
}
    
// Initialize the trivia game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new TriviaGame();
});
