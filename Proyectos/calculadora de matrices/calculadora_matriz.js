// global variables
let matrix1= null;
let matrix2= null;
let resultMatrix= null;
let currentMatrixId= null;

// DOM elements

const matrix1Display= document.getElementById("matrix1-display");
const matrix2Display= document.getElementById("matrix2-display");
const operationDisplay= document.getElementById("operation-display");
const resultDisplay= document.getElementById("result-display");
const matrix1Error = document.getElementById("matrix1-error");
const matrix2Error = document.getElementById("matrix2-error");
const calculationError = document.getElementById("calculation-error");
const calculationSuccess = document.getElementById("calculation-success");

// size selectors for each matrix (always-visible matrices)
const matrix1SizeSelect = document.getElementById("matrix1-size");
const matrix2SizeSelect = document.getElementById("matrix2-size");

// initialize event listeners

document.addEventListener("DOMContentLoaded", function() {

    // events for filling matrices

    document.getElementById("random-matrix1").addEventListener("click", () => fillMatrix(1, 'random'));
    document.getElementById("example-matrix1").addEventListener("click", () => fillMatrix(1, 'example'));
    document.getElementById("random-matrix2").addEventListener("click", () => fillMatrix(2, 'random'));
    document.getElementById("example-matrix2").addEventListener("click", () => fillMatrix(2, 'example'));

    // initialize default manual matrices (3x3)
    const defaultSize = 3;
    if (matrix1SizeSelect) matrix1SizeSelect.value = String(defaultSize);
    if (matrix2SizeSelect) matrix2SizeSelect.value = String(defaultSize);
    generateManualInputMatrix(defaultSize, 1);
    generateManualInputMatrix(defaultSize, 2);

    // size selector listeners
    if (matrix1SizeSelect) matrix1SizeSelect.addEventListener('change', (e) => {
        const s = parseInt(e.target.value);
        if (isNaN(s) || s < 2) return;
        generateManualInputMatrix(s, 1);
    });
    if (matrix2SizeSelect) matrix2SizeSelect.addEventListener('change', (e) => {
        const s = parseInt(e.target.value);
        if (isNaN(s) || s < 2) return;
        generateManualInputMatrix(s, 2);
    });

    // events for calcs

    // single matrix operations
    document.querySelectorAll('.operation-btn[data-matrix]').forEach(btn => {
    btn.addEventListener('click', handleSingleMatrixOperation);
    });

    // two matrix operations
    document.querySelectorAll('.operation-btn[data-operation]').forEach(btn => {
        btn.addEventListener('click', handleMatrixPairOperation);
    });

    // events for cleaning matrices and result
    document.getElementById("clear-matrix1").addEventListener("click", () => clearMatrix(1));
    document.getElementById("clear-matrix2").addEventListener("click", () => clearMatrix(2));
    document.getElementById("clear-result").addEventListener("click", () => clearResult());
});

// fill matrices with random or example values

function fillMatrix(matrixId, type) {
    const matrix = matrixId === 1 ? matrix1 : matrix2;

    if (!matrix) {
        showError(matrixId === 1 ? matrix1Error : matrix2Error, "La matriz no está definida.");
        return;
    }

    let newMatrix;

    switch (type) {
        case 'random':
            newMatrix = generateRandomMatrix(matrix.length);
            break;
        case 'example':
            newMatrix = generateExampleMatrix(matrix.length);
            break;
        default:
            return;
    }

    // update matrix 
    if (matrixId === 1) {
        matrix1 = newMatrix;
        matrix1Display.innerHTML = '';
        displayMatrix(newMatrix, matrix1Display);
    } else {
        matrix2 = newMatrix;
        matrix2Display.innerHTML = '';
        displayMatrix(newMatrix, matrix2Display);
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

// single matrix operations

function handleSingleMatrixOperation(e) {
    const operation= e.target.getAttribute('data-operation');
    const matrixId= parseInt(e.target.getAttribute('data-matrix'));
    const matrix= matrixId === 1 ? matrix1 : matrix2;

    if (!matrix) {
        showError(calculationError, `Matriz ${matrixId} no definida`);
        return;
    }

    try {
        let result;
         switch(operation) {
                    case 'transpose':
                        result = transposeMatrix(matrix);
                        operationDisplay.textContent = `Transposición de Matriz ${matrixId}`;
                        break;
                    case 'determinant':
                        const det = calculateDeterminant(matrix);
                        result = [[det]];
                        operationDisplay.textContent = `Determinante de Matriz ${matrixId}`;
                        break;
                    case 'inverse':
                        result = invertMatrix(matrix);
                        operationDisplay.textContent = `Inversa de Matriz ${matrixId}`;
                        break;
                    case 'identity':
                        result = generateIdentityMatrix(matrix.length);
                        operationDisplay.textContent = `Matriz Identidad ${matrix.length}×${matrix.length}`;
                        break;
                    case 'scalar':
                        // ask user for scalar value
                        const userInput = prompt(`Ingrese el escalar (k) para multiplicar la Matriz ${matrixId}:`, '2');
                        if (userInput === null) {
                            // user cancelled
                            showError(calculationError, 'Operación de escalar cancelada por el usuario.');
                            return;
                        }
                        const scalar = parseFloat(userInput);
                        if (isNaN(scalar)) {
                            showError(calculationError, 'Valor de escalar inválido. Debe ser un número.');
                            return;
                        }
                        result = scalarMatrix(matrix, scalar);
                        operationDisplay.textContent = `Multiplicación por escalar (${scalar}) de Matriz ${matrixId}`;
                        break;
                    default:
                        throw new Error('Operación no reconocida');
            }
            resultMatrix = result;
            resultDisplay.innerHTML = '';
            displayMatrix(result, resultDisplay);
            showSuccess(calculationSuccess, 'Cálculo realizado con éxito');
    } catch (error) {
        showError(calculationError, `Error en la operación: ${error.message}`);
    }
}

// two matrix operations

function handleMatrixPairOperation(e) {
    const operation= e.target.getAttribute('data-operation');

    // validate

    if (!matrix1) {
        showError(calculationError, `Matriz ${matrixId} no definida`);
        return;
    }

    if (!matrix2) {
        showError(calculationError, `Matriz 2 no definida`);
        return;
    }

    if ((operation === 'sum' || operation === 'subtract') && 
        matrix1.length !== matrix2.length) {
        showError(calculationError, 'Las matrices deben tener el mismo tamaño para suma/resta.');
        return;
    }

    try {
        let result;
        switch(operation) {
            case 'sum':
                result = addMatrices(matrix1, matrix2);
                operationDisplay.textContent = 'Suma de Matrices';
                break;
            case 'subtract':
                result = subtractMatrices(matrix1, matrix2);
                operationDisplay.textContent = 'Resta de Matrices';
                break;
            case 'multiply':
                result = multiplyMatrices(matrix1, matrix2);
                operationDisplay.textContent = 'Multiplicación de Matrices';
                break;
            default:
                throw new Error('Operación no reconocida');
        }
        resultMatrix = result;
        resultDisplay.innerHTML = '';
        displayMatrix(result, resultDisplay);
        showSuccess(calculationSuccess, 'Cálculo realizado con éxito');
    }
    catch (error) {
        showError(calculationError, error.message);
    }
}

// display matrix on page
function displayMatrix(matrix, displayElement) {
    if (!matrix) return;
    
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
           
// clear matrix

function clearMatrix(matrixId) {
    const size = matrixId === 1 ? (parseInt(matrix1SizeSelect.value) || 3) : (parseInt(matrix2SizeSelect.value) || 3);
    // regenerate a manual matrix of the selected size filled with zeros
    generateManualInputMatrix(size, matrixId);
    hideError(matrixId === 1 ? matrix1Error : matrix2Error);
    hideError(calculationError);
    hideError(calculationSuccess);

}

// clear result

function clearResult() {
    resultMatrix = null;
    resultDisplay.innerHTML = 'El resultado se mostrará aqui';
    operationDisplay.textContent = 'Seleccione una operacion';
    hideError(calculationError);
    hideError(calculationSuccess);
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

// show success message
function showSuccess(element, message) {
    element.textContent = message;
    element.style.display= "block";
}

// generate manual input matrix (creates inputs and returns matrix of zeros)
function generateManualInputMatrix(size, matrixId) {
    const displayElement = matrixId === 1 ? matrix1Display : matrix2Display;

    displayElement.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'matrix-grid';
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'matrix-cell';
            input.placeholder = '0';
            input.step = 'any';
            input.dataset.row = i;
            input.dataset.col = j;
            input.dataset.matrix = matrixId;
            input.addEventListener('input', handleManualInput);
            grid.appendChild(input);
        }
    }

    displayElement.appendChild(grid);

    const matrix = Array(size).fill().map(() => Array(size).fill(0));

    if (matrixId === 1) {
        matrix1 = matrix;
    } else {
        matrix2 = matrix;
    }

    return matrix;
}