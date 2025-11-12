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

        this.initializeApp();
    }

    initializeApp() {
        this.loadCategories();
        this.setupEventListeners();
    }

    // async method to load categories from API
    async loadCategories() {
        try {
            const response = await fetch('https://opentdb.com/api_category.php');
            const data = await response.json();
            // load categories into the game
            this.populateCategories(data.trivia_categories);
        } catch (error) {
            console.error('Error cargando categorias:', error);
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

        // config form: difficulty, category, number of questions
        document.getElementById('config-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startGame();
        });
    }

    // async method to start the game
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

    // async method to fetch questions from API
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
            } else {
                throw new Error('Error al cargar preguntas');
            }
        } catch (error) {
            alert('Error al cargar preguntas. Por favor, intenta de nuevo.');
            this.showScreen('error-screen');
        }
    }

    // show screens with IDs
    showScreen(screenId) {
        // mark all screens as inactive and activate the selected one
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
}

// Initialize the trivia game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new TriviaGame();
});
