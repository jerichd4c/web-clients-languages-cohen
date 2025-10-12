// # para ids
// . las classes
console.log(document)
console.log(document.body)

let btn=document.getElementById("miBtn")
console.log(btn)

document.querySelector("#miBtn")
// document.querySelector("#.Btn")
//NO SOLO HASHTAG
document.querySelectorAll('#miBtn')

btn.style.color='blue';

let div=document.createElement("div")
    console.log(div)
    div.style.backgroundColor="red"
    div.innerHTML="<p>HOLA :D</p>"

document.body.appendChild(div)

// crear boton on click

let i=1;

function crearBoton(){
    const btn = document.createElement("button")
    btn.value=i;
    i++;
    return btn;
}


div.addEventListener("click", () => { 
        document.body.appendChild(crearBoton());
});




