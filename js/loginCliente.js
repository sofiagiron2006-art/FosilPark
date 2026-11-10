/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


// elementos del formulario
const formulario = document.getElementById("loginClienteForm");
const mensaje = document.getElementById("mensajeLoginCliente");

// verificar la contraseña protegida
async function verificarContrasena(contrasena, salBase64){

    const encoder = new TextEncoder();

    const clave = await crypto.subtle.importKey(
        "raw",
        encoder.encode(contrasena),
        "PBKDF2",
        false,
        ["deriveBits"]
    );

    const sal = Uint8Array.from(
        atob(salBase64),
        caracter => caracter.charCodeAt(0)
    );

    const resultado = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: sal,
            iterations: 310000,
            hash: "SHA-256"
        },
        clave,
        256
    );

    return Array.from(new Uint8Array(resultado))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

// iniciar sesión del cliente
formulario.addEventListener("submit", async function(event){

    event.preventDefault();

    const correo = document.getElementById("correoCliente").value.trim().toLowerCase();
    const contrasena = document.getElementById("contrasenaCliente").value;

    try{

        // buscar cliente por correo electrónico
        const clientes = await db.clientes.toArray();

        const cliente = clientes.find(function(cliente){
            return cliente.correo.trim().toLowerCase() === correo;
        });

        if(!cliente){
            mensaje.textContent = "Correo o contraseña incorrectos";
            mensaje.style.color = "red";
            return;
        }

        // comprobar que el cliente tenga contraseña registrada
        if(!cliente.contrasenaSal || !cliente.contrasenaHash){
            mensaje.textContent = "Esta cuenta no tiene una contraseña registrada. Debes actualizar tu registro.";
            mensaje.style.color = "red";
            return;
        }

        // comprobar contraseña
        const hashIngresado = await verificarContrasena(
            contrasena,
            cliente.contrasenaSal
        );

        if(hashIngresado !== cliente.contrasenaHash){
            mensaje.textContent = "Correo o contraseña incorrectos";
            mensaje.style.color = "red";
            return;
        }

        // guardar la sesión del cliente
        sessionStorage.setItem(
            "clienteAutenticado",
            cliente.id
        );

        // ingresar al portal de facturas
        window.location.href = "misfacturas.html";

    }catch(error){

        console.error("Error al iniciar sesión:", error);

        mensaje.textContent = "Ocurrió un error al iniciar sesión";
        mensaje.style.color = "red";
    }
});


