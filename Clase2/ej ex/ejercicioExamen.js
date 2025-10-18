// 2.1
const button = document.querySelector('.btn');

// 2.2

let crearBoton = () => {
    const p = document.createElement('p');
    p.textContent = 'hola mundo';
    document.body.appendChild(p);
    console.log('boton creado');
    p.style.backgroundColor = 'red';
};

//2.3

    button.addEventListener('click', crearBoton);
