/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


// verificar la sesión del cliente
const idCliente = sessionStorage.getItem("clienteAutenticado");

// elementos de la página
const listaFacturas = document.getElementById("listaFacturas");
const datosCliente = document.getElementById("datosCliente");
const cerrarSesion = document.getElementById("cerrarSesion");

// si no hay sesión, regresar al inicio de sesión
if (!idCliente) {
    window.location.href = "loginCliente.html";
}

// cerrar sesión
cerrarSesion.addEventListener("click", function(event) {
    event.preventDefault();

    sessionStorage.removeItem("clienteAutenticado");

    window.location.href = "loginCliente.html";
});

// consultar las facturas del cliente
async function consultarMisFacturas() {

    try {

        // obtener los datos del cliente
        const cliente = await db.clientes.get(Number(idCliente));

        if (!cliente) {
            listaFacturas.textContent = "No se encontró la cuenta del cliente.";
            return;
        }

        // mostrar el nombre del cliente
        datosCliente.textContent = "Bienvenido/a, " + cliente.nombre;

        // buscar movimientos relacionados con este cliente
        const movimientos = await db.movimientos
            .where("clienteId")
            .equals(Number(idCliente))
            .toArray();

        // mostrar solamente los estacionamientos finalizados
        const facturas = movimientos
            .filter(function(movimiento) {
                return movimiento.estado === "Finalizado";
            });

        // ordenar las facturas de la más reciente a la más antigua
        facturas.sort(function(a, b) {
            return new Date(b.fechaSalida) - new Date(a.fechaSalida);
        });

        // comprobar si existen facturas
        if (facturas.length === 0) {
            listaFacturas.textContent = "Todavía no tienes facturas disponibles.";
            return;
        }

        // limpiar el contenido anterior
        listaFacturas.innerHTML = "";

        // mostrar cada factura
        facturas.forEach(function(movimiento) {

            const tarjeta = document.createElement("div");
            tarjeta.className = "factura-cliente";

            const titulo = document.createElement("h3");
            titulo.textContent = "Factura FP-" +
                (movimiento.numeroFactura || movimiento.id);

            const placa = document.createElement("p");
            placa.textContent = "Placa: " + movimiento.placa;

            const fecha = document.createElement("p");
            fecha.textContent = "Fecha de salida: " +
                new Date(movimiento.fechaSalida).toLocaleString("es-GT");

            const total = document.createElement("p");
            total.textContent = "Total pagado: Q" +
                Number(movimiento.totalCobro).toFixed(2);

            const enlace = document.createElement("a");
            enlace.href = "factura.html?id=" + movimiento.id;
            enlace.textContent = "Ver factura";
            enlace.className = "boton";

            tarjeta.appendChild(titulo);
            tarjeta.appendChild(placa);
            tarjeta.appendChild(fecha);
            tarjeta.appendChild(total);
            tarjeta.appendChild(enlace);

            listaFacturas.appendChild(tarjeta);

        });

    } catch(error) {

        console.error("Error al consultar las facturas:", error);

        listaFacturas.textContent =
            "Ocurrió un error al consultar tus facturas.";
    }
}

// ejecutar la consulta
if (idCliente) {
    consultarMisFacturas();
}

