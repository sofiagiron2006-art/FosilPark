/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */
//panel administrativo
//comprobar la sesion del administrador 
if (sessionStorage.getItem("adminAutenticado")!=="true"){
    //si no inicio sesion regresa al login
    window.location.href="../html/login.html";
}
// REPARAR MOVIMIENTOS SIN CLIENTE
async function repararMovimientosHuerfanos(){
    try{
        const movimientos = await db.movimientos
            .where("estado")
            .equals("Estacionado")
            .toArray();

        for(const movimiento of movimientos){
            const cliente = await db.clientes.get(movimiento.clienteId);

            if(!cliente){
                await db.movimientos.delete(movimiento.id);
                console.log("Movimiento sin cliente eliminado:", movimiento.id);
            }
        }
    }catch(error){
        console.error("Error al reparar movimientos:", error);
    }
}
//capturar el boton de cerrar sesión
const btnCerrarSesion=document.getElementById("btnCerrarSesion");
//cerrar la sesion administrativa
btnCerrarSesion.addEventListener("click",function(){
    //eliminar la autorizacion de la sesion
    sessionStorage.removeItem("adminAutenticado");
    //regresar al inicio de sesion
    window.location.href="../html/login.html";
});
//almacenar los clientes consultados
let listaClientes=[];
//consultar clientes de IndexedDB
async function consultarClientes(){//operaciones tardan en completarse
    try{
        //obtener todos los clientes almacenados
        const clientes=await db.clientes.toArray();//await espera que indexeddb devuelva los registros
        ////toarray obtiene los datos almacenados 
        //capturar el cuerpo de la tabla
        //guardar clientes consultados
        listaClientes=clientes;
        const tabla=document.getElementById("tablaClientes");
        //contador de clientes
        const total=document.getElementById("totalClientes");
        //total de clientes actualizado
        total.textContent=clientes.length;
        //limpiar el contenido anterior de la tabla elimina el mensaje de vacio
        tabla.innerHTML="";
        //comprobar si existen clientes registrados
        if(clientes.length===0){
            tabla.innerHTML=`<tr>
            <td colspan="6">Todavia no hay clientes registrados</td>
            </tr>`;
            return;
        }
        //recorrer los clientes almacenados de IndemexDB
        clientes.forEach(function(cliente){//repite el proceso por cada cliente registrado 
           //crear una nueva fila
           const fila=document.createElement("tr");
           //identificar al cliente de esta fila
           fila.dataset.id=cliente.id;
           
           //crear las celdas de clientes y colocar sus datos cada celda
           const celdaNombre=fila.insertCell();//insertcell crea celdas de esa fila
           celdaNombre.textContent=cliente.nombre;//datos dentro de una celda
           const celdaDpi=fila.insertCell();
           celdaDpi.textContent=cliente.dpi;
           const celdaTelefono=fila.insertCell();
           celdaTelefono.textContent=cliente.telefono;
           const celdaCorreo=fila.insertCell();
           celdaCorreo.textContent=cliente.correo;
           const celdaPlaca=fila.insertCell();
           celdaPlaca.textContent=cliente.placa;
           const celdaVehiculo=fila.insertCell();
           celdaVehiculo.textContent=cliente.tipovehiculo;
           
           //celda de acciones 
           const celdaAcciones=fila.insertCell();
           //capturar planilla de botones
           const plantilla=document.getElementById("planillaAcciones");
           //copiar el contenido de la plantilla
           const botones=plantilla.content.cloneNode(true);
           //agregar botones a la celda
           celdaAcciones.appendChild(botones);
           
            //fila a la tabla
           tabla.appendChild(fila);
           
        });
    }catch(error){
        console.error("error al consultar los clientes:",error);
    }
}
//funcion de mostrra los clientes que buscamos (aparte los que mostramos en la tabla general)
function mostrarClientes(clientes){
    //capturar el cuerpo de la tabla
    const tabla=document.getElementById("tablaClientes");
    //limpiar tabla antes d ela busqueda
    tabla.innerHTML="";
    //comprobar si existen resultados
    if(clientes.length===0){
        tabla.innerHTML=`<tr>
        <td colspan="6">No se encontraron clientes</td>
        </tr>`;
        return;
    }
    //recorrer clientes encontrados
    clientes.forEach(function(cliente){
        //crear una nueva fila
           const fila=document.createElement("tr");
           //identificar el cliente de esta fila
           fila.dataset.id=cliente.id;
           //crear las celdas de clientes y colocar sus datos cada celda
           const celdaNombre=fila.insertCell();//insertcell crea celdas de esa fila
           celdaNombre.textContent=cliente.nombre;//datos dentro de una celda
           const celdaDpi=fila.insertCell();
           celdaDpi.textContent=cliente.dpi;
           const celdaTelefono=fila.insertCell();
           celdaTelefono.textContent=cliente.telefono;
           const celdaCorreo=fila.insertCell();
           celdaCorreo.textContent=cliente.correo;
           const celdaPlaca=fila.insertCell();
           celdaPlaca.textContent=cliente.placa;
           const celdaVehiculo=fila.insertCell();
           celdaVehiculo.textContent=cliente.tipovehiculo;
           
           //celda de acciones 
           const celdaAcciones=fila.insertCell();
           //capturar planilla de botones
           const plantilla=document.getElementById("planillaAcciones");
           //copiar el contenido de la plantilla
           const botones=plantilla.content.cloneNode(true);
           //agregar botones a la celda
           celdaAcciones.appendChild(botones);
           
           //fila a la tabla
           tabla.appendChild(fila);
    });
    
}
//BUSCADOR DE CLIENTES
////capturar el buscador
const buscarCliente=document.getElementById("buscarCliente");
//detectar la busqueda del administrador
buscarCliente.addEventListener("input", function(){
    //obtener nombre del campo
    const nombreBuscado=buscarCliente.value.toLowerCase().trim();
    //filtrar los clientes por nombre
    const clientesFiltrados=listaClientes.filter(function(cliente){
        return cliente.nombre.toLowerCase().includes(nombreBuscado);
    });
    mostrarClientes(clientesFiltrados);
});
//ELIMINAR CLIENTES
const tablaClientes=document.getElementById("tablaClientes");

tablaClientes.addEventListener("click", async function(event){

    //identificar si se presiono el boton eliminar
    const botonEliminar=event.target.closest(".btn-eliminar");

    //si no se presiono el boton termina
    if(!botonEliminar){
        return;
    }

    //identificar la fila del cliente
    const fila=botonEliminar.closest("tr");

    //obtener el ID del cliente
    const id=Number(fila.dataset.id);

    try{

        // comprobar si el cliente tiene movimientos registrados
        const movimientosCliente = await db.movimientos
            .where("clienteId")
            .equals(id)
            .toArray();

        // impedir eliminar clientes con movimientos o facturas
        if(movimientosCliente.length > 0){
            alert("No se puede eliminar este cliente porque tiene movimientos o facturas registrados.");
            return;
        }

        // confirmar la eliminacion
        const confirmar = confirm("¿Estas seguro de eliminar este cliente?");

        if(!confirmar){
            return;
        }

        // eliminar cliente de IndexedDB
        await db.clientes.delete(id);

        // actualizar la tabla y los contadores
        await consultarClientes();
        await actualizarContadores();

        alert("Cliente eliminado correctamente");

    }catch(error){

        console.error("Error al eliminar el cliente:", error);
        alert("No se pudo eliminar el cliente");

    }
});
//MODIFICAR CLIENTES
tablaClientes.addEventListener("click", async function(event){
    //identificar si se presiono el boton modificar
    const botonModificar = event.target.closest(".btn-modificar");
    if(!botonModificar){
        return;
    }
    //identificar la fila del cliente
    const fila = botonModificar.closest("tr");
    //obtener el ID del cliente
    const id = Number(fila.dataset.id);
    try{
        //buscar los datos actuales del cliente
        const cliente = await db.clientes.get(id);
        if(!cliente){
            alert("No se encontro el cliente");
            return;
        }
        //solicitar los nuevos datos
        const nombre = prompt("Modificar nombre:", cliente.nombre);
        if(nombre === null) return;
        const dpi = prompt("Modificar DPI:", cliente.dpi);
        if(dpi === null) return;
        const telefono = prompt("Modificar telefono:", cliente.telefono);
        if(telefono === null) return;
        const correo = prompt("Modificar correo:", cliente.correo);
        if(correo === null) return;
        const placa = prompt("Modificar placa:", cliente.placa);
        if(placa === null) return;
        const tipovehiculo = prompt("Modificar tipo de vehiculo:", cliente.tipovehiculo);
        if(tipovehiculo === null) return;
        //comprobar que ningun campo este vacio
        if(
            !nombre.trim() ||
            !dpi.trim() ||
            !telefono.trim() ||
            !correo.trim() ||
            !placa.trim() ||
            !tipovehiculo.trim()
        ){
            alert("Todos los campos son obligatorios");
            return;
        }
        //actualizar los datos en IndexedDB
        await db.clientes.update(id, {
            nombre: nombre.trim(),
            dpi: dpi.trim(),
            telefono: telefono.trim(),
            correo: correo.trim(),
            placa: placa.trim(),
            tipovehiculo: tipovehiculo.trim()
        });
        //actualizar la tabla
        await consultarClientes();
        alert("Cliente modificado correctamente");
    }catch(error){
        console.error("Error al modificar el cliente:", error);
        alert("No se pudo modificar el cliente. Verifica que el DPI y la placa no estén registrados en otro cliente.");
    }
});
//ejecucion


//BUSCAR VEHICULOS POR PLACA 

//capturar los elementos del formulario
const buscarPlaca = document.getElementById("buscarPlaca");
const btnBuscarPlaca = document.getElementById("btnBuscarPlaca");
const datosVehiculo = document.getElementById("datosVehiculo");
const btnRegistrarEntrada = document.getElementById("btnRegistrarEntrada");
const mensajeEstacionamiento = document.getElementById("mensajeEstacionamiento");

//variable para almacenar el cliente encontrado
let clienteBuscado = null;

//evento para buscar el vehiculo
btnBuscarPlaca.addEventListener("click", async function(){

    //obtener la placa ingresada
    const placaIngresada = buscarPlaca.value.trim().toUpperCase();
    //limpiar resultados anteriores
    datosVehiculo.textContent = "";
    mensajeEstacionamiento.textContent = "";
    btnRegistrarEntrada.disabled = true;
    clienteBuscado = null;
    //comprobar que se haya ingresado una placa
    if(placaIngresada === ""){
        mensajeEstacionamiento.textContent = "Ingrese una placa para buscar";
        return;
    }
    try{
        //consultar los clientes registrados
        const clientes = await db.clientes.toArray();
        //buscar el cliente por su placa
        clienteBuscado = clientes.find(function(cliente){
            return cliente.placa.trim().toUpperCase() === placaIngresada;
        });
        //comprobar si se encontro el cliente
        if(!clienteBuscado){

            mensajeEstacionamiento.textContent = "No se encontró ningún cliente con esa placa";
            return;
        }
        //mostrar los datos del cliente
        datosVehiculo.textContent =
            "Cliente: " + clienteBuscado.nombre +
            "\nDPI: " + clienteBuscado.dpi +
            "\nTeléfono: " + clienteBuscado.telefono +
            "\nPlaca: " + clienteBuscado.placa +
            "\nVehículo: " + clienteBuscado.tipovehiculo;
        //habilitar el boton de entrada
        btnRegistrarEntrada.disabled = false;
        mensajeEstacionamiento.textContent = "Vehículo encontrado correctamente";
    }catch(error){
        console.error("Error al buscar el vehículo:", error);
        mensajeEstacionamiento.textContent = "Ocurrió un error al buscar el vehículo";
    }
});

//REGISTRAR ENTRADA DEL VEHICULO
btnRegistrarEntrada.addEventListener("click", async function(){
    //comprobar que exista un cliente encontrado
    if(!clienteBuscado){
        mensajeEstacionamiento.textContent = "Primero debe buscar un vehículo";
        return;
    }
    try{
        //consultar los vehiculos que estan estacionados
        const movimientosActivos = await db.movimientos
            .where("estado")
            .equals("Estacionado")
            .toArray();

        //comprobar si el vehiculo ya esta estacionado
        const vehiculoExiste = movimientosActivos.some(function(movimiento){
            return movimiento.placa === clienteBuscado.placa;
        });
        if(vehiculoExiste){
            mensajeEstacionamiento.textContent =
                "Este vehículo ya se encuentra estacionado";
            return;
        }
        //buscar un espacio disponible entre los 20 espacios
        const espaciosOcupados = movimientosActivos.map(function(movimiento){
            return movimiento.espacio;
        });
        let espacioDisponible = 0;
        for(let espacio = 1; espacio <= 20; espacio++){

            if(!espaciosOcupados.includes(espacio)){
                espacioDisponible = espacio;
                break;
            }
        }
        //comprobar que existan espacios disponibles
        if(espacioDisponible === 0){
            mensajeEstacionamiento.textContent =
                "No hay espacios disponibles";
            return;
        }

        await db.movimientos.add({
            clienteId: clienteBuscado.id,
            placa: clienteBuscado.placa,
            fechaEntrada: new Date().toISOString(),
            fechaSalida: null,
            estado: "Estacionado",
            espacio: espacioDisponible
        });
        //mensaje de confirmacion
        mensajeEstacionamiento.textContent =
            "Entrada registrada correctamente. Espacio asignado: " +
            espacioDisponible;
        //limpiar la busqueda anterior
        buscarPlaca.value = "";
        datosVehiculo.textContent = "";
        btnRegistrarEntrada.disabled = true;
        clienteBuscado = null;

        //actualizar la tabla de vehiculos estacionados
        await consultarVehiculosEstacionados();
    }catch(error){
        console.error("Error al registrar la entrada:", error);
        mensajeEstacionamiento.textContent =
            "Ocurrio un error al registrar la entrada";
    }
});

//consultar y mostrar vehiculos estacionados
async function consultarVehiculosEstacionados(){
    try{
        
        const movimientos = await db.movimientos
            .where("estado")
            .equals("Estacionado")
            .toArray();
        
        const tabla = document.getElementById("tablaEstacionamiento");
        //limpiar el contenido anterior
        tabla.innerHTML = "";
       
        if(movimientos.length === 0){
            tabla.innerHTML =
                '<tr><td colspan="6">No hay vehículos estacionados</td></tr>';
            return;
        }
        
        for(const movimiento of movimientos){
            //buscar los datos del cliente relacionado
            const cliente = await db.clientes.get(movimiento.clienteId);
            if(!cliente){
                continue;
            }
            //convertir la fecha de entrada a formato legible
            const fecha = new Date(movimiento.fechaEntrada);
            const fechaFormateada = fecha.toLocaleString("es-GT");
            //crear una fila para la tabla
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${cliente.nombre}</td>
                <td>${movimiento.placa}</td>
                <td>${cliente.tipovehiculo}</td>
                <td>${fechaFormateada}</td>
                <td>${movimiento.espacio}</td>
                <td>
                    <button type="button" class="btn-salida"
                        data-id="${movimiento.id}">
                        Registrar salida
                    </button>
                </td>
            `;
            tabla.appendChild(fila);
        }
    }catch(error){
        console.error("Error al consultar vehículos:", error);
    }
}



//REGISTRAR SALIDA DE VEHICULO
//capturar la tabla de estacionamiento
const tablaEstacionamiento = document.getElementById("tablaEstacionamiento");
//detectar cuando se presiona un boton de salida
tablaEstacionamiento.addEventListener("click", async function(event){
    //comprobar si se presiono el boton registrar salida
    if(event.target.classList.contains("btn-salida")){
        //obtener el id del movimiento
        const idMovimiento = Number(event.target.dataset.id);

        try{
            //buscar el movimiento en la base de datos
            const movimiento = await db.movimientos.get(idMovimiento);
            //comprobar que exista y siga estacionado
            if(!movimiento || movimiento.estado !== "Estacionado"){
                return;
            }
            //obtener los datos del cliente
             const cliente = await db.clientes.get(movimiento.clienteId);

               //obtener el tipo de vehiculo
               const tipoVehiculo = cliente.tipovehiculo
               .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();

                 //establecer las tarifas por hora
                const tarifas = {
                motocicleta: 15,
                automovil: 20,
             camioneta: 30
               };

               //buscar la tarifa correspondiente
              const tarifaHora = tarifas[tipoVehiculo];

            if(tarifaHora === undefined){
               mensajeEstacionamiento.textContent =
             "No se reconoce el tipo de vehículo";
             return;
}

              //calcular el tiempo estacionado
            const fechaSalida = new Date();
            const fechaEntrada = new Date(movimiento.fechaEntrada);

            const diferencia = fechaSalida - fechaEntrada;

             //calcular solamente las horas completas
            const horasCobradas = Math.floor(
            diferencia / (1000 * 60 * 60)
           );
             //determinar el dia y la hora de entrada
const diaEntrada = fechaEntrada.getDay();
const horaEntrada = fechaEntrada.getHours();

//verificar si aplica la tarifa especial
const tarifaEspecial =
    diaEntrada >= 1 &&
    diaEntrada <= 5 &&
    horaEntrada < 10 &&
    diferencia > (6 * 60 * 60 * 1000);

//calcular el total
let totalCobro;

if(tarifaEspecial){
    totalCobro = 50;
}else{
    totalCobro = tarifaHora;
}


            //guardar la salida y el cobro
            //actualizar el movimiento con la fecha de salida
            await db.movimientos.update(idMovimiento, {
                fechaSalida: new Date().toISOString(),
                estado: "Finalizado",
                horasCobradas: horasCobradas,
                tarifaHora: tarifaHora,
                totalCobro: totalCobro
            });
            //mostrar mensaje de confirmacion
           mensajeEstacionamiento.textContent =
    "Salida registrada correctamente. Total a pagar: Q" +
    totalCobro.toFixed(2);
            //actualizar la tabla
            await consultarVehiculosEstacionados();
            await actualizarContadores();
            //abrir la factura del movimiento registrado
            window.location.href = "factura.html?id=" + idMovimiento;
        }catch(error){
            console.error("Error al registrar la salida:", error);
            mensajeEstacionamiento.textContent =
                "Ocurrio un error al registrar la salida";
        }
    }
});
// ELEMENTO DE LA TABLA DEL HISTORIAL
const tablaHistorial = document.getElementById("tablaHistorial");

// CONSULTAR LAS FACTURAS REGISTRADAS
async function consultarHistorialFacturas(){
    try{
        // Obtener todos los movimientos finalizados
        const movimientos = await db.movimientos
            .where("estado")
            .equals("Finalizado")
            .toArray();

        // Ordenar desde la factura más reciente
        movimientos.sort(function(a, b){
            return new Date(b.fechaSalida) - new Date(a.fechaSalida);
        });

        tablaHistorial.innerHTML = "";

        if(movimientos.length === 0){
            tablaHistorial.innerHTML =
                '<tr><td colspan="6">No hay facturas registradas</td></tr>';
            return;
        }

        // Recorrer cada movimiento finalizado
        for(const movimiento of movimientos){

            // Buscar los datos del cliente
            const cliente = await db.clientes.get(movimiento.clienteId);

            if(!cliente){
                continue;
            }

            // Crear una nueva fila
            const fila = document.createElement("tr");

            // Número de factura
            const numero = document.createElement("td");
            numero.textContent = "FP-" + movimiento.id;

            // Nombre del cliente
            const nombre = document.createElement("td");
            nombre.textContent = cliente.nombre;

            // Placa
            const placa = document.createElement("td");
            placa.textContent = movimiento.placa;

            // Fecha de salida
            const fecha = document.createElement("td");
            fecha.textContent =
                new Date(movimiento.fechaSalida).toLocaleString("es-GT");

            // Total pagado
            const total = document.createElement("td");
            total.textContent =
                "Q" + Number(movimiento.totalCobro || 0).toFixed(2);

            // Enlace para volver a abrir la factura
            const accion = document.createElement("td");
            const enlace = document.createElement("a");

            enlace.href = "factura.html?id=" + movimiento.id;
            enlace.textContent = "Ver factura";
            enlace.className = "btn-ver-factura";

            accion.appendChild(enlace);

            // Agregar las celdas a la fila
            fila.appendChild(numero);
            fila.appendChild(nombre);
            fila.appendChild(placa);
            fila.appendChild(fecha);
            fila.appendChild(total);
            fila.appendChild(accion);

            // Agregar la fila a la tabla
            tablaHistorial.appendChild(fila);
        }

    }catch(error){
        console.error("Error al consultar el historial:", error);
    }
}

// ejecutar consulta

// ACTUALIZAR LOS CONTADORES DEL PANEL
async function actualizarContadores(){
    try{
        // Consultar clientes registrados
        const clientes = await db.clientes.toArray();

        // Consultar movimientos
        const movimientos = await db.movimientos.toArray();

        // Identificar vehículos estacionados
        const estacionados = movimientos.filter(function(movimiento){
            return movimiento.estado === "Estacionado";
        });

        // Calcular espacios disponibles
        const espaciosDisponibles = 20 - estacionados.length;

        // Obtener la fecha actual
        const hoy = new Date();

        // Contar movimientos del día
        const movimientosHoy = movimientos.filter(function(movimiento){

            const entrada = new Date(movimiento.fechaEntrada);

            const salida = movimiento.fechaSalida
                ? new Date(movimiento.fechaSalida)
                : null;

            const entradaHoy =
                entrada.getDate() === hoy.getDate() &&
                entrada.getMonth() === hoy.getMonth() &&
                entrada.getFullYear() === hoy.getFullYear();

            const salidaHoy = salida &&
                salida.getDate() === hoy.getDate() &&
                salida.getMonth() === hoy.getMonth() &&
                salida.getFullYear() === hoy.getFullYear();

            return entradaHoy || salidaHoy;
        });

        // Mostrar los resultados en el panel
        document.getElementById("totalClientes").textContent =
            clientes.length;

        document.getElementById("espaciosDisponibles").textContent =
            espaciosDisponibles;

        document.getElementById("vehiculosEstacionados").textContent =
            estacionados.length;

        document.getElementById("totalMovimientos").textContent =
            movimientosHoy.length;

    }catch(error){
        console.error("Error al actualizar los contadores:", error);
    }
}

// EJECUTAR AL CARGAR EL SISTEMA
// INICIAR EL SISTEMA
async function iniciarSistema(){

    await repararMovimientosHuerfanos();

    await consultarClientes();
    await consultarVehiculosEstacionados();
    await consultarHistorialFacturas();
    await actualizarContadores();
}

iniciarSistema();

