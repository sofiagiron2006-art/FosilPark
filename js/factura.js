/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */
//capturar los datos de la factura
const numeroFactura = document.getElementById("numeroFactura");
const nombreCliente = document.getElementById("nombreCliente");
const dpiCliente = document.getElementById("dpiCliente");
const placaVehiculo = document.getElementById("placaVehiculo");
const tipoVehiculo = document.getElementById("tipoVehiculo");
const fechaEntrada = document.getElementById("fechaEntrada");
const fechaSalida = document.getElementById("fechaSalida");
const tarifaHora = document.getElementById("tarifaHora");
const totalCobro = document.getElementById("totalCobro");

//obtener el id del movimiento desde la direccion
const parametros = new URLSearchParams(window.location.search);
const idMovimiento = Number(parametros.get("id"));

//consultar los datos guardados
async function mostrarFactura(){

    try{

        //comprobar que exista un id valido
        if(!idMovimiento){
            alert("No se indicó el número de movimiento");
            return;
        }

        //esperar a que la base de datos este abierta
        await db.open();

        //buscar el movimiento
        const movimiento = await db.movimientos.get(idMovimiento);

        if(!movimiento || movimiento.estado !== "Finalizado"){
            alert("No se encontró una factura válida");
            return;
        }

        //buscar los datos del cliente
        const cliente = await db.clientes.get(movimiento.clienteId);

        if(!cliente){
            alert("No se encontraron los datos del cliente");
            return;
        }

        //mostrar los datos del cliente
        numeroFactura.textContent = "FP-" + movimiento.id;
        nombreCliente.textContent = cliente.nombre;
        dpiCliente.textContent = cliente.dpi;

        //mostrar los datos del vehiculo
        placaVehiculo.textContent = movimiento.placa;
        tipoVehiculo.textContent = cliente.tipovehiculo;

        //mostrar las fechas
        fechaEntrada.textContent =
            new Date(movimiento.fechaEntrada).toLocaleString("es-GT");

        fechaSalida.textContent =
            new Date(movimiento.fechaSalida).toLocaleString("es-GT");

        //mostrar el cobro
        
        tarifaHora.textContent =
            "Q" + movimiento.tarifaHora.toFixed(2);

        totalCobro.textContent =
            "Q" + movimiento.totalCobro.toFixed(2);

    }catch(error){

        console.error("Error al generar la factura:", error);
        alert("Ocurrió un error al generar la factura");
    }
}

//mostrar la factura
mostrarFactura();

//imprimir factura
document.getElementById("btnImprimir").addEventListener("click",function(){
    window.print();
});

