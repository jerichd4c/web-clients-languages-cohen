// global variables
let matrix1= null;
let matrix2= null;
let resultMatrix= null;
let selectedOperation= null;
let matrix1Size= 0;
let matrix2Size= 0;
let matrix1InputType= null;
let matrix2InputType= null;

// DOM elements

const matrix1SizeSelect= document.getElementById("matrix1-size");
const matrix2SizeSelect= document.getElementById("matrix2-size");
const matrix1Display= document.getElementById("matrix1-display");
const matrix2Display= document.getElementById("matrix2-display");
const matrix1Error = document.getElementById("matrix1-error");
const matrix2Error = document.getElementById("matrix2-error");

// initialize event listeners

document.addEventListener("DOMContentLoaded", function() {

    // event for matriz size selector
    matrix1SizeSelect.addEventListener("change", handleMatrixSizeChange);
    matrix2SizeSelect.addEventListener("change", handleMatrixSizeChange);

    // event for input type
    document.querySelectorAll('.input-type-btn').forEach(btn => {
        btn.addEventListener('click', handleInputTypeClick);
    });

});


// handle matrix size change
function handleMatrixSizeChange(e) {
    const matrixId = e.target.id === "matrix1-size" ? 1 : 2;
    const size = parseInt(e.target.value);

    if (isNaN(size) || size < 2 || size > 10) {
        showError(matrixId === 1 ? matrix1Error : matrix2Error, "Seleccione un tamaño entre 2 y 10.");
        return;
    }

    hideError(matrixId === 1 ? matrix1Error : matrix2Error);

    if (matrixId === 1) {
        matrix1Size = size;
        // if theres already an input type selected, generate matrix inputs
        if (matrix1InputType) {
            generateMatrix(matrixId, size, matrix1InputType);
        } 
    } else {
        matrix2Size = size;
        if (matrix2InputType) {
            generateMatrix(matrixId, size, matrix2InputType);
        }
    }
}

// handle input type button click
function handleInputTypeClick(e) {
    const matrixId = parseInt(e.target.getAttribute('data-matrix'));
    const inputType = e.target.getAttribute('data-type');

    document.querySelectorAll(`.input-type-btn[data-matrix="${matrixId}"]`).forEach(btn => {
        btn.classList.remove('selected');
    });
    e.target.classList.add('selected');
    
    if (matrixId === 1) {
        matrix1InputType = inputType;
    } else {
        matrix2InputType = inputType;
    }
    
    // get selected size 

    const sizeSelect = matrixId === 1 ? matrix1SizeSelect : matrix2SizeSelect;
    const size = parseInt(sizeSelect.value);

    if (isNaN(size) || size < 2 || size > 10) {
        showError(matrixId === 1 ? matrix1Error : matrix2Error, "Seleccione un tamaño entre 2 y 10.");
        return;
    }

    hideError(matrixId === 1 ? matrix1Error : matrix2Error);
    generateMatrix(matrixId, size, inputType);
}

// generate matrix based on size and input type
function generateMatrix(matrixId, size, inputType) {
    let matrix;

    // switch case: example, manual, random
    switch (inputType) {
        case 'example':
            matrix = generateExampleMatrix(size);
            break;
        case 'manual':
            matrix =  generateManualInputMatrix(size, matrixId);
            return;
        case 'random':
            matrix = generateRandomMatrix(size);
            break;
        default:
            return;
        }

        //DEBUG, REMOVE LATE

        console.log('Matrix:', matrix);

        //save matrix and show on page

        if (matrixId === 1) {
            matrix1 = matrix;
             displayMatrix(matrix, matrix1Display);
        } else {
            matrix2 = matrix;
             displayMatrix(matrix, matrix2Display);
        }
    }

// example matrix (3x3) 
function generateExampleMatrix(size) {
    if (size != 3) {
        //generateIdentityMatrix
        //REMEMBER TO CHANGE THIS LATER
        return [
            [1, 2],
            [3, 4]
        ]
    }
    return [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];
}

// random matrix

function generateRandomMatrix(size) {
    const matrix =[];
    for (let i=0; i<size; i++) {
        const row= [];
        for (let j=0; j<size; j++) {
            //RNG from -10 to 10
            row.push((Math.random() * 20 - 10).toFixed(2));
        }
        matrix.push(row);
    }
    return matrix;
}

// manual input matrix

function generateManualInputMatrix(size, matrixId) {
    const displayElement = matrixId === 1 ? matrix1Display : matrix2Display;

    displayElement.innerHTML = '';

    // grids represent the matrix

    const grid = document.createElement('div');
    grid.className = 'matrix-grid';
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    // create inputs for each cell
    for (let i=0; i<size; i++) {
        for (let j=0; j<size; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'matrix-cell';
            input.placeholder= '0';
            input.step = 'any';
            input.dataset.row = i;
            input.dataset.col = j;
            input.dataset.matrix = matrixId;

            input.addEventListener('input', handleManualInput);
            grid.appendChild(input);
        }
    }

    displayElement.appendChild(grid);

    // initialize with 0s

    const matrix = Array(size).fill().map(() => Array(size).fill(0));   

    if (matrixId === 1) {
        matrix1 = matrix;
    } else {
        matrix2 = matrix;
    }

    return matrix;
}

// aux function to handle manual input
function handleManualInput(e) {
    const matrixId = parseInt(e.target.dataset.matrix);
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    const value = parseFloat(e.target.value) || 0;

    if (matrixId == 1 && matrix1) {
        matrix1[row][col] = value;
    } else if (matrixId == 2 && matrix2) {
        matrix2[row][col] = value;
    }
}

// display matrix on page
function displayMatrix(matrix, displayElement) {
    if (!matrix) return;

    //innerHTML to dont bloat pre-existent HTML
    displayElement.innerHTML = '';
    const size =matrix.length;

    const grid= document.createElement('div');
    grid.className= 'matrix-grid';
    grid.style.gridTemplateColumns= `repeat(${size}, 1fr)`;

    //iterate matrix and create divs for each element
    for (let i= 0; i< size; i++) {
        for (let j= 0; j< size; j++) {
            const cell= document.createElement('div');
            cell.className= 'matrix-cell';
            let value= matrix[i][j];
            if (typeof value === 'number') { 
                value = Number.isInteger(value) ? value : parseFloat(value.toFixed(2));
            }
            cell.textContent= value;
            grid.appendChild(cell);
        }
    }
    displayElement.appendChild(grid);
}

// show error message
function showError(element, message) {
    element.textContent = message;
    element.style.display= "block";
}

// hide error message
function hideError(element) {
    element.style.display= "none";
}