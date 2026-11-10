/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */
//crear auna base de datos
const db=new Dexie("FosilParkDB");
//estructura
db.version(1).stores({//definir almacenes de base de datos
    clientes:"++id, &dpi, &placa, nombre"
});
//estructura version 2 
db.version(2).stores({
    clientes:"++id, &dpi, &placa, nombre",
    //almacenar las entradas y salidas de vehiculos
    movimientos: "++id, clienteId, placa, fechaEntrada, fechaSalida, estado, espacio"
});
//abrir base de datos
db.open()//intenta abir base de datos
        .then(function(){//abre correctamente 
         console.log("Base de Datos FósilPark creada correctamente");   
})
        .catch(function(error){//si no abre
        console.error("error al abrir base de datos",error); 
});


