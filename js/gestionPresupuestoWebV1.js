
// 1. Importación de la Lógica de Negocio 

import { 
    CrearGasto, // Función constructora para crear objetos gasto
    anyadirGasto, // Para agregar un gasto a la lista global
    borrarGasto, // Para eliminar un gasto por ID
    listarGastos, // Para obtener el listado completo de gastos
    calcularTotalGastos, // Para calcular el total gastado
    actualizarPresupuesto, // Necesario para fijar un presupuesto inicial
    mostrarPresupuesto // Para obtener el texto del presupuesto
} from './gestionPresupuesto.js';



// 2. Inicialización de Datos (Ayuda para Pruebas) 


function inicializarDatosParaPruebas() {
    // Fija un presupuesto inicial (ejemplo: 1000)
    actualizarPresupuesto(1000); 

    // Crea y añade algunos gastos iniciales para que la lista no esté vacía al cargar
    anyadirGasto(new CrearGasto("Compra de supermercado", 45.50, "2025-11-15", "alimentacion", "casa"));
    anyadirGasto(new CrearGasto("Gasolina coche", 60.00, "2025-11-16", "transporte"));
    anyadirGasto(new CrearGasto("Cena restaurante", 35.00, "2025-11-18", "ocio", "comida"));
}


// 3. Funciones de Renderizado (Actualizan la Interfaz) 


// Llama a las funciones que actualizan el balance y el listado
function renderizarTodo() {
    renderizarBalance();
    renderizarListadoGastos();
}

// Dibuja el total de gastos y el balance en la capa 'total-gastos' 
function renderizarBalance() {
    const contenedor = document.getElementById('total-gastos');
    const totalGastos = calcularTotalGastos();
    const balanceTexto = mostrarPresupuesto(); 
    const presupuestoActual = 1000; // Asumimos 1000 del inicializador
    
    contenedor.innerHTML = `
        <p><strong>Presupuesto:</strong> ${balanceTexto}</p>
        <p><strong>Total de Gastos:</strong> ${totalGastos.toFixed(2)} €</p>
        <p><strong>Balance Restante:</strong> ${(presupuestoActual - totalGastos).toFixed(2)} €</p>
    `;
}

// Dibuja la lista de gastos en la capa 'listado-gastos' 
function renderizarListadoGastos() {
    const contenedor = document.getElementById('listado-gastos');
    contenedor.innerHTML = ''; // Limpia el contenido anterior antes de redibujar

    const listaGastos = listarGastos(); // Obtiene el array de gastos de la lógica de negocio

    if (listaGastos.length === 0) {
        contenedor.innerHTML = '<p>No hay gastos registrados.</p>';
        return;
    }

    const ul = document.createElement('ul'); // Crea la lista desordenada <ul> 

    listaGastos.forEach(gasto => { // Recorre cada gasto del array
        const li = document.createElement('li');
        li.className = 'gasto-item';
        
        // Muestra los datos del gasto 
        li.innerHTML = `
            <strong>ID:</strong> ${gasto.id} | 
            <strong>Descripción:</strong> ${gasto.descripcion} | 
            <strong>Valor:</strong> ${gasto.valor.toFixed(2)} €<br>
            <strong>Fecha:</strong> ${new Date(gasto.fecha).toLocaleDateString()} | 
            <strong>Etiquetas:</strong> ${gasto.etiquetas.join(', ')}
        `;

        // Crea el botón de borrado 
        const botonBorrar = document.createElement('button');
        botonBorrar.textContent = 'Borrar';

        // Asocia un evento al botón de borrado 
        botonBorrar.addEventListener('click', () => {
            // Pide confirmación antes de borrar el gasto 
            if (confirm(`¿Estás seguro de que quieres borrar el gasto ID ${gasto.id}: "${gasto.descripcion}"?`)) {
                borrarGasto(gasto.id); // Llama a la función de la lógica de negocio
                renderizarTodo(); // Vuelve a dibujar toda la interfaz para reflejar el cambio 
            }
        });

        li.appendChild(botonBorrar); // Añade el botón al elemento de lista
        ul.appendChild(li); 
    });

    contenedor.appendChild(ul); // Inyecta la lista final en el HTML
}

// Crea y añade el formulario de creación de gastos 
function renderizarFormulario() {
    const contenedor = document.getElementById('formulario-gasto');
    const form = document.createElement('form'); // Crea el elemento <form> 
    form.id = 'crearGastoForm';
    
    // Contiene los campos necesarios para crear un gasto 
    form.innerHTML = `
        <label for="descripcion">Descripción:</label>
        
        <input type="text" id="descripcion" name="descripcion" required><br><br>
        
        <label for="valor">Valor (€):</label>
        <input type="number" id="valor" name="valor" min="0" step="0.01" required><br><br>
        
        <label for="fecha">Fecha (YYYY-MM-DD):</label>
        <input type="date" id="fecha" name="fecha" value="${new Date().toISOString().substring(0, 10)}"><br><br>
        
        <label for="etiquetas">Etiquetas (separadas por comas):</label>
        <input type="text" id="etiquetas" name="etiquetas"><br><br>
        
        <button type="submit">Añadir Gasto</button>
    `;

    // Asocia la función que manejará el envío de datos 
    form.addEventListener('submit', manejarEnvioFormulario);
    
    contenedor.appendChild(form);
}


// 4. Manejo del Formulario


function manejarEnvioFormulario(e) {
    e.preventDefault(); // Detiene el envío normal del formulario para evitar recargar la página 

    // 1. Obtiene los valores del formulario
    const descripcion = document.getElementById('descripcion').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const fecha = document.getElementById('fecha').value;
    
    // Convierte el string de etiquetas a un array, limpiando espacios y vacíos
    const etiquetasString = document.getElementById('etiquetas').value;
    const etiquetasArray = etiquetasString ? etiquetasString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [];

    // 2. Crea el objeto Gasto y lo añade
    const nuevoGasto = new CrearGasto(descripcion, valor, fecha, ...etiquetasArray);
    anyadirGasto(nuevoGasto); // Llama a la lógica de negocio para guardar el gasto [cite: 261]

    // 3. Limpia el formulario y actualiza la interfaz
    document.getElementById('crearGastoForm').reset(); // Reinicia el formulario
    renderizarTodo(); // Actualiza el total y el listado [cite: 277]
}



// 5. Arranque de la Aplicación


// Ejecuta las funciones de inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    inicializarDatosParaPruebas(); // Carga datos de prueba (presupuesto y gastos)
    renderizarFormulario(); // Dibuja el formulario
    renderizarTodo(); // Dibuja el balance y el listado inicial
});