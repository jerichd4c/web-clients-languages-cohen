# Trivia Challenge 🎮

A browser-based multiple choice trivia game built with HTML, CSS, and vanilla JavaScript. Configure question count, difficulty, and category, then race the 20‑second timer to earn points and finish with your stats.

## Quick Start 🚀

1. Open `trivia_game.html` in your browser.
2. Click **Start Quiz** on the welcome screen.
3. Fill in configuration: player name (2–20 chars), number of questions (5–20), difficulty (Easy/Medium/Hard), optional category (Mixed by default).
4. Press **Start Game!** — questions load (loading screen).
5. Answer each question before the 20s timer hits zero. Correct answers give points (+10).
6. View feedback screen (3s countdown) between questions.
7. At the end, check your Results: score, accuracy %, average time per question.
8. Play again with same settings or start a new game.

## Screens & Flow 🧭

- **Welcome**: Entry point; launches configuration.
- **Configuration**: Player settings (name, count, difficulty, category). Native validation + custom constraints.
- **Loading**: Spinner while fetching questions from Open Trivia DB.
- **Game**: Question card, options grid (4 answers), timer, stats (score, correct answers, progress).
- **Feedback**: Shows result of the last answer (correct / incorrect / time's up) and a 3‑second countdown.
- **Results**: Final summary (player, score, accuracy %, average time per question) + action buttons.

## Configuration Controls ⚙️

- `Player name`: Required, 2–20 characters.
- `Number of questions`: Numeric input (5–20). Synchronized display label.
- `Difficulty`: Toggle buttons (Easy / Medium / Hard) — only one active at a time.
- `Category`: Select list (Mixed plus dynamically fetched categories from API).

## Gameplay Mechanics 🎯

- **Question Source**: Open Trivia DB (`https://opentdb.com/api.php`) with parameters: amount, difficulty (optional), category (optional), type=multiple, encode=base64.
- **Answer Options**: 4 choices (1 correct + 3 incorrect). Decoded from Base64 before display.
- **Timer**: 20 seconds per question; circular SVG progress with color changes (warning ≤10s, danger ≤5s). A beep sound plays in final 5 seconds.
- **Selection**: Once an option is picked, answers lock; correct answer highlighted (green) and incorrect selection (red). Feedback screen appears after a short (≈800ms) highlight delay.
- **Feedback Duration**: 3‑second countdown before next question automatically loads.
- **Time Tracking**: Per-question elapsed time measured; full 20s added if time expires. Average displayed on results screen.

## Scoring & Stats 📊

- **Points**: +10 per correct answer.
- **Accuracy**: `(correctAnswers / totalQuestions) * 100` rounded to 1 decimal.
- **Average Time**: `totalTime / totalQuestions` (seconds, 1 decimal). Includes either time until selection or full 20s on timeout.
- **Progress**: `currentQuestionIndex + 1` of `totalQuestions` displayed live.

## Sounds 🔊

Loaded and preloaded for responsiveness:
- `correct.mp3`: Correct answer feedback.
- `wrong.mp3`: Incorrect or timeout.
- `timer-beep.mp3`: Final 5 seconds countdown tick.
- `game-start.mp3`: Game initialization.
- `results.mp3`: Results screen display.

## Error Handling ⚠️

- API response codes mapped: `0` success, `1` no results, others treated as errors.
- Failure to fetch questions returns to config screen with an alert.
- Timeouts treated as incorrect answers (full time counted).

## Files 📁

- `trivia_game.html` — Page structure (screens, forms, containers).
- `trivia_game.css` — Styling (layout, animations, timer, feedback, results).
- `trivia_game.js` — Core logic: configuration, fetching, decoding, timer, scoring, transitions, sounds.
- `sounds/` — Audio assets (MP3 files).

## Technical Notes 🛠️

- Uses `performance.now()` for precise per-question timing accumulation.
- Base64 decoding via `window.atob` wrapped with URI decoding for special characters.
- Screen switching by toggling `.active` class on sibling `.screen` containers.
- Prevents multi-click input with `isAnswerSelected` flag.