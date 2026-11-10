/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// extraer elementos de los campos del usuario
const formulario = document.getElementById("registroForm");
const botonRegistrar = document.getElementById("btnRegistrar");
const mensaje = document.getElementById("mensajeRegistro");
const resumen = document.getElementById("resumenCliente");

// generar una sal aleatoria
function generarSal(){
    const sal = crypto.getRandomValues(new Uint8Array(16));
    return btoa(String.fromCharCode(...sal));
}

// proteger la contraseña mediante PBKDF2
async function generarHash(contrasena, salBase64){

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

// registrar clientes
botonRegistrar.addEventListener("click", async function(){

    // verificar los campos
    if(!formulario.reportValidity()){
        return;
    }

    // capturar los datos ingresados
    const nombre = document.getElementById("nombre").value.trim();
    const dpi = document.getElementById("dpi").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const placa = document.getElementById("placa").value.trim().toUpperCase();
    const tipovehiculo = document.getElementById("tipovehiculo").value;

    // capturar las contraseñas
    const contrasena = document.getElementById("contrasena").value;
    const confirmarContrasena = document.getElementById("confirmarContrasena").value;

    // comprobar que las contraseñas coincidan
    if(contrasena !== confirmarContrasena){
        mensaje.textContent = "Las contraseñas no coinciden";
        mensaje.style.color = "red";
        return;
    }

    try{

        // generar la sal y el hash de la contraseña
        const sal = generarSal();
        const hash = await generarHash(contrasena, sal);

        // crear objeto con los datos del cliente
        const cliente = {
            nombre: nombre,
            dpi: dpi,
            telefono: telefono,
            correo: correo,
            placa: placa,
            tipovehiculo: tipovehiculo,
            contrasenaSal: sal,
            contrasenaHash: hash
        };

        // guardar el cliente en IndexedDB
        await db.clientes.add(cliente);

        const fecha = new Date();
        const fechaRegistro = fecha.toLocaleDateString("es-GT");

        // mostrar mensaje de éxito
        mensaje.textContent = "¡Cliente registrado correctamente!";
        mensaje.style.color = "green";

        // mostrar los datos registrados
        resumen.innerHTML = `
            <h2>¡Cliente registrado correctamente!</h2>
            <p><strong>Nombre:</strong> ${cliente.nombre}</p>
            <p><strong>DPI:</strong> ${cliente.dpi}</p>
            <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
            <p><strong>Correo:</strong> ${cliente.correo}</p>
            <p><strong>Placa:</strong> ${cliente.placa}</p>
            <p><strong>Vehículo:</strong> ${cliente.tipovehiculo}</p>
            <p><strong>Fecha de registro:</strong> ${fechaRegistro}</p>
            <p>Ya puedes iniciar sesión para consultar tus facturas.</p>
        `;

        // limpiar el formulario
        formulario.reset();

    }catch(error){

        if(error.name === "ConstraintError"){
            mensaje.textContent = "El DPI y la placa ya están registradas";
        }else{
            mensaje.textContent = "Error al registrar el cliente";
            console.error("Error:", error);
        }

        mensaje.style.color = "red";
    }
});



    

