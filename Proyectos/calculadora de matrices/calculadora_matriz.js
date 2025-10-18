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
const operationDisplay= document.getElementById("operation-display");
const calculateBtn= document.getElementById("calculate-btn");
const resultDisplay= document.getElementById("result-display");
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

    // event for operation button
    document.querySelectorAll('.operation-btn').forEach(btn => {
        btn.addEventListener('click', handleOperationClick);
    });

    // event for calculate button
    document.getElementById("calculate-btn").addEventListener("click", handleCalculateClick);

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
            // RNG from -10 to 10
            // parseFloat to remove string from toFixed
            row.push(parseFloat((Math.random() * 20 - 10).toFixed(2)));
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

// identity matrix

function generateIdentityMatrix(size) {
    const matrix = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            row.push(i === j ? 1 : 0);
        }
        matrix.push(row);
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

// handle click on operation (add, subtract, multiply, etc)
function handleOperationClick(e) {
    //remove selector from previous function (handleInputTypeClick)
    document.querySelectorAll('.input-type-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    e.target.classList.add('selected');
    selectedOperation= e.target.getAttribute('data-operation');

    operationDisplay.textContent= e.target.textContent;
}

// FUNCTIONS BETWEEN 2 MATRICES

// add matrices
function addMatrices(a,b) {
    const size = a.length;
    const result = [];
    for (let i=0; i<size; i++) {
        const row= [];
        for (let j=0; j<size; j++) {
            row.push(a[i][j] + b[i][j]);
        }
        result.push(row);
    }
    return result;
}

// subtract matrices
function subtractMatrices(a,b) {
    const size = a.length;
    const result = [];
    for (let i=0; i<size; i++) {
        const row= [];
        for (let j=0; j<size; j++) {
            row.push(a[i][j] - b[i][j]);
        }
        result.push(row);
    }
    return result;
}

// multiply matrices
function multiplyMatrices(a,b) {
    const rowsA= a.length;
    const colsA= a[0].length;
    const colsB= b[0].length;
    const result = [];

    for (let i=0; i< rowsA; i++) {
        result[i] = [];
        for (let j=0; j< colsB; j++) {
            let sum = 0;
            for (let k=0; k< colsA; k++) {
                sum += a[i][k] * b[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

// FUNCTIONS WITH ONLY 1 MATRIX

// scalar matrix
function scalarMatrix(matrix, scalar) {
    return matrix.map(row => row.map(val => val * scalar));
}

// transpose matrix
function transposeMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = [];

    for (let i=0; i< cols; i++) {
        result[i] = [];
        for (let j=0; j< rows; j++) {
            result[i][j] = matrix[j][i];
        }
    }
    return result;
}

// determinant
function calculateDeterminant(matrix) {
    const size = matrix.length;

    if (size==1){
        return matrix[0][0];
    }

    if (size==2) {
        return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }

    let det= 0;

    for (let j=0; j< size; j++){
        const minor = getMinor(matrix, 0, j);
        det += matrix[0][j] * Math.pow(-1, j) * calculateDeterminant(minor);
    }
    return det;
}

// AUX function for determinant: get minor
 function getMinor(matrix, row, col) {
            return matrix
                .filter((_, i) => i !== row)
                .map(r => r.filter((_, j) => j !== col));
        }

// invert 
function invertMatrix(matrix) {
    const det = calculateDeterminant(matrix);

    if (det=== 0) {
        throw new Error('La matriz no tiene inversa');
    }

    const size = matrix.length;
    const adjugate = [];

    for (let i=0; i< size; i++) {
        adjugate[i] = [];
        for (let j=0; j< size; j++) {
            const minor = getMinor(matrix, i, j);
            adjugate[i][j] = Math.pow(-1, i+j) * calculateDeterminant(minor);
        }
    }

    // transpose the adjugate
    const adjugateT = transposeMatrix(adjugate);

    // multiply by 1/det
    return scalarMatrix(adjugateT, 1/det);
}

// handle click on result 
function handleCalculateClick() {
    try {
        switch(selectedOperation){
            case 'sum':
                resultMatrix= addMatrices(matrix1, matrix2);
                break;
            case 'subtract':
                resultMatrix= subtractMatrices(matrix1, matrix2);
                break;
            case 'multiply':
                resultMatrix= multiplyMatrices(matrix1, matrix2);
                break;
            case 'scalar':
                // for now, only scalar by 2
                resultMatrix= scalarMatrix(matrix1, 2);
                break;
            case 'transpose':
                resultMatrix= transposeMatrix(matrix1);
                break;
            case 'determinant':
                const det = calculateDeterminant(matrix1);
                // return as a 1x1 matrix
                resultMatrix= [[det]];
            case 'inverse':
                resultMatrix= invertMatrix(matrix1);
                break;
            case 'identity':
                resultMatrix= generateIdentityMatrix(matrix1Size || 3);
                break;
            default:
                throw new error('Operacion invalida')
        }
        displayMatrix(resultMatrix, resultDisplay);
    } catch (error) {
        showError(calculationError, 'Error en el calculo: ${error.message}');
    }
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