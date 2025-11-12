//CODIGO 1: CÓDIGO SÍNCRONO VS ASÍNCRONO

// // CÓDIGO SÍNCRONO (Bloquea la ejecución)
// function operacionLenta() {
//     const inicio = Date.now();
//     while (Date.now() - inicio < 3000) {
//         // Simula operación lenta de 3 segundos
//     }
//     return "Operación síncrona completada";
// }

// // console.group("Logs sincronicos");
// // console.log("Inicio");
// // console.log(operacionLenta()); // Bloquea aquí por 3 segundos
// // console.log("Fin");
// // console.groupEnd();

// // CÓDIGO ASÍNCRONO (No bloquea)
// function operacionLentaAsync() {
//     return new Promise(resolve => {
//         setTimeout(() => {
//             resolve("Operación asíncrona completada");
//         }, 3000);
//     });
// }

// console.group("Logs asincronicos con Promesas");
// console.log("Inicio");
// operacionLentaAsync().then(resultado => {
//     console.log(resultado); // Se ejecuta después de 3 segundos
// });

// for(let i = 0; i < 5; i++) {
//     console.log("Haciendo otras cosas...", i);

// }
// console.log("Fin"); // Se ejecuta inmediatamente
// console.groupEnd();

//CODIGO 2: SETTIMEOUT Y SETINTERVAL

// setTimeout - Ejecuta una función después de un tiempo determinado
// setTimeout(() => {
//     console.log("Este mensaje aparece después de 2 segundos");
// }, 2000);

// // setTimeout con parámetros
// function saludar(nombre, apellido, ciudad) {
//     console.log(`Hola ${nombre} ${apellido} vives en ${ciudad}!`);
// }

// setTimeout(saludar, 1000, "Juan", "Pérez", "Madrid");

// setTimeout(saludar, 1500 , "Sebastian", "Cohen", "Barcelona");

// setInterval - Ejecuta una función repetidamente
// let contador = 0;
// const intervalo = setInterval(() => {
//     contador++;
//     console.log(`Contador: ${contador}`);
// }, 1000);

// const btn = document.getElementById("stop");
// btn.addEventListener("click", () => {
//     clearInterval(intervalo);
//     console.log("Intervalo detenido por el usuario");
// });
             
// setInterval(() => {
//     alert("Sigues aquí?");
// }, 5000);

//CODIGO 3: PROMESAS

// Crear una promesa básica
// const miPromesa = new Promise((resolve, reject) => {
//     const exito = Math.random() > 0.5; // 50% de probabilidad
    
//     setTimeout(() => {
//         if (exito) {
//             resolve("¡Operación exitosa!"); // Promesa cumplida
//         } else {
//             reject("Algo salió mal"); // Promesa rechazada
//         }
//     }, 2000);
// });

// // Usar la promesa
// miPromesa
//     .then(resultado => {
//         console.log("Éxito:", resultado);
//     })
//     .catch(error => {
//         console.error("Error:", error);
//     })
//     .finally(() => {
//         console.log("Operación completada (siempre se ejecuta)");
//     });

// console.log("Este mensaje aparece antes de que la promesa se resuelva");

// console.log("Iniciando operación asíncrona...");

// console.log("Esperando resultado de la promesa...");

// // Función que retorna una promesa
// function obtenerDatos(url) {
//     return new Promise((resolve, reject) => {
//         // Simula una petición HTTP
//         setTimeout(() => {
//             if (url) {
//                 resolve({ datos: "Información del servidor", url: url });
//             } else {
//                 reject(new Error("URL no proporcionada"));
//             }
//         }, 1500);
//     });
// }

// // Uso
// obtenerDatos("https://api.ejemplo.com/datos")
//     .then(respuesta => {
//         console.log("Datos recibidos:", respuesta);
//         return respuesta.datos; // Pasar datos al siguiente .then
//     })
//     .then(datos => {
//         console.log("Procesando:", datos);
//     })
//     .catch(error => {
//         console.error("Error al obtener datos:", error.message);
//     })
//     .finally(() => {
//         console.log("Proceso de obtención de datos finalizado");
//     });

//CODIGO 4: PROMESAS

function fetchPokemonData(pokedexNumber) {
    console.log(`This log appears before fetching Pokémon`);
    const responsePromise = fetch(`https://pokeapi.co/api/v2/pokemon/${pokedexNumber}`);
    const responseJsonPromise = responsePromise.then(response => response.json());
    return responseJsonPromise;
}

fetchPokemonData(1) // 1. Bulbasaur
    .then(pokemonData => {
        console.log('Pokémon data received:', pokemonData);
    })
    .catch(error => {
        console.error('Error fetching Pokémon data:', error);
    })
    .finally(() => {
        console.log('Fetch attempt finished.');
    });

console.log("TIEMPO MUERTO ENTRE PETICIONES...");
console.log("TIEMPO MUERTO ENTRE PETICIONES...");
console.log("TIEMPO MUERTO ENTRE PETICIONES...");

// async function fetchPokemonDataAsync(pokedexNumber) {
//     const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokedexNumber}`);
//     const pokemonData = await response.json();
//     return pokemonData;

// }

// console.log("Starting async fetch...");
// const data = await fetchPokemonDataAsync(25); // 25. Pikachu
// console.log("some stuff happening...");
// console.log('Pokémon data received asynchronously:', data);

// console,log("Starting another async fetch...");
// const data2 = await fetchPokemonDataAsync(150); // 150. Mewtwo
// console.log('Pokémon data received asynchronously:', data2);

// // PROYECTO CONSULTAS A UNA API Y TRABAJAS CON LA INFORMACION QUE NOS DEVUELVE

