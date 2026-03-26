<a id="readme-top"></a>

<!-- PROJECT LOGO -->

  <h3 align="center">Matrix Calculator</h3>

  <p align="center">
    A web-based tool for performing operations on matrices (2x2 to 10x10).
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
    </li>
    <li><a href="#main-controls">Main Controls</a></li>
    <li><a href="#behavior--notes">Behavior & Notes</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

Small browser-based matrix calculator built with **HTML**, **CSS**, and **JavaScript** for quick operations with one or two matrices.

### Built With

* HTML5
* CSS3
* JavaScript (Vanilla)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To run the calculator locally:

1. Clone the repository (if not already done).
2. Navigate to `Proyectos/calculadora de matrices/`.
3. Open `matrix_calculator.html` in your browser.

<p align="right">(<a href="#readme-top">back to top">back to top</a>)</p>

<!-- MAIN CONTROLS -->
## Main Controls

- **Size Selectors**: Change matrix dimensions (2–10). *Note: This resets current values.*
- **Random / Example**: Quickly fill matrices with generated values.
- **Clear**: Reset a matrix or the result display.
- **Single-matrix Operations**: Calculate **Scalar** multiplication, **Transpose**, **Determinant**, **Inverse**, and **Identity**.
- **Pair Operations**: Perform matrix **Sum**, **Subtraction**, and **Multiplication**.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- BEHAVIOR & NOTES -->
## Behavior & Notes

- **Validation**: Every cell must contain a valid number to run operations.
- **Precision**: Random values are limited to 2 decimal places to avoid visual bugs.
- **Efficiency**: Determinant and inverse routines are optimized for small matrices; performance may vary with larger dimensions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FILES -->
## Files

- `matrix_calculator.html` — UI Structure
- `matrix_calculator.css` — Styles and layout
- `matrix_calculator.js` — Logic and operations