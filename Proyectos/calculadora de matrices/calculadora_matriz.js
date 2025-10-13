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

// DEBUG , DELETE LATER

if (matrix1SizeSelect && matrix2SizeSelect) {
    console.log("Elementos de tamaño de matriz encontrados.");
} else {
    console.error("Elementos de tamaño de matriz NO encontrados.");
}

const matrix1Error = document.getElementById("matrix1-error");
const matrix2Error = document.getElementById("matrix2-error");

// initialize event listeners

document.addEventListener("DOMContentLoaded", function() {

    // event for matriz size selector
    matrix1SizeSelect.addEventListener("change", handleMatrixSizeChange);
    matrix2SizeSelect.addEventListener("change", handleMatrixSizeChange);

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
            //generateMatrix
        } 
    } else {
        matrix2Size = size;
        if (matrix2InputType) {
            //generateMatrix
        }
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


