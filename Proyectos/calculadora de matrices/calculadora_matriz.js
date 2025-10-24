// global variables
let matrix1= null;
let matrix2= null;
let resultMatrix= null;
let currentMatrixId= null;

// DOM elements

const matrix1Display= document.getElementById("matrix1-display");
const matrix2Display= document.getElementById("matrix2-display");
const operationDisplay= document.getElementById("operation-display");
const calculateBtn= document.getElementById("calculate-btn");
const resultDisplay= document.getElementById("result-display");
const matrix1Error = document.getElementById("matrix1-error");
const matrix2Error = document.getElementById("matrix2-error");
const calculationError = document.getElementById("calculate-error");
const calculationSuccess = document.getElementById("calculate-success");

// matrix modal elements

const matrixModal = document.getElementById("matrix-modal");
const matrixSizeSelect = document.getElementById("matrix-size");
const createMatrixBtn = document.getElementById("create-matrix");
const cancelMatrixBtn = document.getElementById("cancel-matrix");
const closeModalBtn = document.getElementById("close-modal");
const modalError = document.getElementById("modal-error");

// initialize event listeners

document.addEventListener("DOMContentLoaded", function() {

    // event for matrix creations

    document.getElementById("create-matrix1").addEventListener("click", () => openMatrixModal(1));
    document.getElementById("create-matrix2").addEventListener("click", () => openMatrixModal(2));

    // events for filling matrices

    document.getElementById("random-matrix1").addEventListener("click", () => fillMatrix(1, 'random'));
    document.getElementById("example-matrix1").addEventListener("click", () => fillMatrix(1, 'example'));
    document.getElementById("random-matrix2").addEventListener("click", () => fillMatrix(2, 'random'));
    document.getElementById("example-matrix2").addEventListener("click", () => fillMatrix(2, 'example'));

    // event for operation button
    document.querySelectorAll('.operation-btn').forEach(btn => {
        btn.addEventListener('click', handleOperationClick);
    });

    // event for calculate button
    document.getElementById("calculate-btn").addEventListener("click", handleCalculateClick);

    // events for cleaning matrices and result
    document.getElementById("clear-matrix1").addEventListener("click", () => clearMatrix(1));
    document.getElementById("clear-matrix2").addEventListener("click", () => clearMatrix(2));
    document.getElementById("clear-result").addEventListener("click", () => clearResult());

    // events for matrix modal
    createMatrixBtn.addEventListener("click",  createEmptyMatrix);
    cancelMatrixBtn.addEventListener("click", closeMatrixModal);
    closeModalBtn.addEventListener("click", closeMatrixModal);
});

// open matrix modal
function openMatrixModal(matrixId) {
    currentMatrixId = matrixId;
    matrixModal.style.display = "flex";
    hideError(modalError);
}

// close matrix modal

function closeMatrixModal() {
    currentMatrixId = null;
    matrixModal.style.display = "none";
}

// create matrix from modal

function createEmptyMatrix() {
    const size = parseInt(matrixSizeSelect.value);

    if (isNaN(size) || size < 2 || size > 10) {
       showError(modalError, "Seleccione un tamaño entre 2 y 10.");
       return;
    }

    const matrix = Array(size).fill().map(() => Array(size).fill(0));

    // Save matrix and display
    if (currentMatrixId === 1) {
        matrix1 = matrix;
        //replace button with matrix
        displayMatrix(matrix, matrix1Display);
    } else if (currentMatrixId === 2) {
        matrix2 = matrix;
        //replace button with matrix
        displayMatrix(matrix, matrix2Display);
    }

    closeMatrixModal();
}

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

//***                                    ***//
//***CHANGE THIS, SINGLE AND PAIR OP     ***//
//***                                    ***//

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

//***                                    ***//
//***OPERATION PART, MESS WITH THIS LATER***//
//***                                    ***//

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

// handle click on result 
function handleCalculateClick() {

    // clean previous messages
    hideError(calculationError);
    hideError(calculationSuccess);

    // validations

    if (!selectedOperation) {
        showError(calculationError, 'Seleccione una operacion primero');
        return;
    }

    if (!matrix1 && selectedOperation !== 'identity') {
        showError(calculationError, 'Matrix 1 no definida');
        return;
    }

    if ((selectedOperation === 'sum' || selectedOperation === 'subtract' || 
        selectedOperation === 'multiply') && !matrix2) {
        showError(calculationError, 'Matrix 2 no definida');
        return;
    }

    if ((selectedOperation === 'sum' || selectedOperation === 'subtract') && matrix1.length !== matrix2.length) {
        showError(calculationError, 'Las matrices deben ser de la misma dimension');
        return; 
    }

    if (selectedOperation === 'multiply' && matrix1[0].length !== matrix2.length) {
            showError(calculationError, 'El número de columnas de A debe igualar el número de filas de B para multiplicación.');
            return;
            }
            

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
        showError(calculationSuccess, 'Calculo exitoso');
    } catch (error) {
        showError(calculationError, 'Error en el calculo: ${error.message}');
    }}

//***                                    ***//
//***         UI UTILS FUNCTIONS         ***//
//***                                    ***//

// clear matrix

function clearMatrix(matrixId) {
    if (matrixId === 1) {
        matrix1 = null;
        matrix1Display.innerHTML = '<button class="btn" id="create-matrix1">Crear Matriz</button>';
        document.getElementById('create-matrix1').addEventListener('click', () => openMatrixModal(1));
    } else {
        matrix2 = null;
        matrix2Display.innerHTML = '<button class="btn" id="create-matrix2">Crear Matriz</button>';
        document.getElementById('create-matrix2').addEventListener('click', () => openMatrixModal(2));
    }
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