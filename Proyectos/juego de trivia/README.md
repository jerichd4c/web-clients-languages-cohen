<a id="readme-top"></a>

<!-- PROJECT LOGO -->

  <h3 align="center">Trivia Challenge</h3>

  <p align="center">
    A fast-paced trivia game fetching questions from the Open Trivia DB.
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#gameplay-mechanics">Gameplay Mechanics</a></li>
    <li><a href="#scoring--stats">Scoring & Stats</a></li>
    <li><a href="#sounds">Sounds</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

A browser-based multiple choice trivia game built with **vanilla JavaScript**. Players can configure question counts, difficulty levels, and categories before racing against a 20-second timer.

### Built With

* HTML5
* CSS3
* JavaScript (Vanilla)
* [Open Trivia DB API](https://opentdb.com/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To play the trivia locally:

1. Navigate to `Proyectos/juego de trivia/`.
2. Open `trivia_game.html` in your browser.
3. Configure your player name, difficulty, and category to start.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GAMEPLAY MECHANICS -->
## Gameplay Mechanics

- **Question Source**: Dynamically fetched from Open Trivia DB using Base64 encoding for character safety.
- **Timer**: 20 seconds per question with a visual SVG progress bar that changes color as time runs out.
- **Feedback**: Immediate visual feedback (correct/incorrect) followed by a 3-second countdown transition.
- **Error Handling**: Graceful handling of API timeouts or empty results.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- SCORING & STATS -->
## Scoring & Stats

- **Points**: +10 per correct answer.
- **Accuracy**: Final percentage based on correct vs. total questions.
- **Average Time**: Tracking time-to-answer for performance summary.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- SOUNDS -->
## Sounds

- **Correct/Wrong**: Audio cues for answer validation.
- **Timer Beep**: Warning sound during the final 5 seconds.
- **Ambience**: Start and result screen sound effects for immersion.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FILES -->
## Files

- `trivia_game.html` — Core structure and screens
- `trivia_game.css` — Animations, layout, and visual states
- `trivia_game.js` — Fetching logic, timer control, and state management
- `sounds/` — Audio assets
