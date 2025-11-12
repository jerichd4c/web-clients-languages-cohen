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

        this. initializeApp();
    }

    initializeApp() {
        this.loadCategories();
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
}

// Initialize the trivia game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const triviaGame = new TriviaGame();
});
