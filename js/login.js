/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */
//elementos del formulario login(administrador)
const formulario=document.getElementById("loginForm");
const mensaje=document.getElementById("mensajelogin");

//evaluar las credenciales del administrador admin 2026
const usuarioAdmin="admin";
const contraseñaAdmin="2026";
//enviar formulario
formulario.addEventListener("submit",function(event){
    event.preventDefault();
    //obtener los datos de los campos
    const usuario=document.getElementById("usuario").value.trim();
    const contraseña=document.getElementById("contraseña").value;
    //evaluar y comparar las credenciales si da acceso o no 
    //identificando el administrador
    if(usuario===usuarioAdmin && contraseña===contraseñaAdmin){
        //guardar el estado de la sesion
        sessionStorage.setItem("adminAutenticado","true");
        window.location.href = "../html/sistema.html";//las credenciales correctas abriran el panel administrativos
        //mensaje de acceso
        mensaje.textContent="Acceso exitoso, las credenciales son validas";
        mensaje.className="mensaje-login";
    }else{
        //mostrar error mensaje
        mensaje.textContent="Usuario o contraseña incorrectos";
        mensaje.className="error-login";
    }
});


