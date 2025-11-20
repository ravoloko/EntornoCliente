// --- LÓGICA DE NEGOCIO SIMULADA (Necesitas tu archivo gestionPresupuesto.js) ---
// ASUMIMOS que gestionPresupuesto.js exporta estas funciones:
// (crearGasto, obtenerGastos, guardarGasto, borrarGasto)
import { crearGasto, obtenerGastos, guardarGasto, borrarGasto } from './gestionPresupuesto.js'; 

// Obtener referencias del DOM
const template = document.getElementById('gasto-template');
const listadoGastos = document.getElementById('listado-gastos');
const formCrearGasto = document.getElementById('form-crear-gasto');

// --- DATOS INICIALES Y LISTA LOCAL ---
let listaGastos = obtenerGastos() || [];

// Crear un gasto inicial para pruebas si la lista está vacía (Punto 38)
if (listaGastos.length === 0) {
    // Usamos la lógica de negocio para crear un gasto
    listaGastos.push(crearGasto("Libros de texto", 45.00, "2025-11-20", ["educacion"]));
}


// ----------------------------------------------------------------------
// I. CLASE DEL WEB COMPONENT <mi-gasto>
// ----------------------------------------------------------------------

class MiGasto extends HTMLElement {
    
    constructor() {
        super();
        
        // Usar Shadow DOM (Punto 23)
        this.attachShadow({ mode: 'open' }); 
        
        // Clonar plantilla
        const content = template.content.cloneNode(true);
        this.shadowRoot.appendChild(content);

        this._gasto = null; // Propiedad para almacenar el objeto gasto (Punto 24)
        this.form = this.shadowRoot.querySelector('.edicion-form');
        
        // Añadir listeners a los botones del componente
        this.shadowRoot.querySelector('.editar-btn').addEventListener('click', this._toggleFormulario.bind(this));
        this.shadowRoot.querySelector('.cancelar-btn').addEventListener('click', this._toggleFormulario.bind(this));
        this.shadowRoot.querySelector('.borrar-btn').addEventListener('click', this._borrarGasto.bind(this));
        this.form.addEventListener('submit', this._guardarEdicion.bind(this));
    }

    // El setter se llama al asociar un objeto gasto (ej: componente.gasto = objeto)
    set gasto(gastoObj) {
        this._gasto = gastoObj; 
        
        // Mostrar los datos en la plantilla (Punto 32)
        this.shadowRoot.querySelector('#descripcion-output').textContent = gastoObj.descripcion;
        this.shadowRoot.querySelector('#valor-output').textContent = `${gastoObj.valor.toFixed(2)} €`;
        this.shadowRoot.querySelector('#fecha-output').textContent = gastoObj.fecha;
        this.shadowRoot.querySelector('#etiquetas-output').textContent = gastoObj.etiquetas.join(', ');
        
        // Rellenar el formulario de edición con los valores actuales
        this.shadowRoot.querySelector('.edit-descripcion').value = gastoObj.descripcion;
        this.shadowRoot.querySelector('.edit-valor').value = gastoObj.valor;
        this.shadowRoot.querySelector('.edit-fecha').value = gastoObj.fecha;
        this.shadowRoot.querySelector('.edit-etiquetas').value = gastoObj.etiquetas.join(', ');
    }

    get gasto() {
        return this._gasto;
    }

    // Muestra u oculta el formulario (Punto 11)
    _toggleFormulario() {
        this.form.style.display = (this.form.style.display === 'flex') ? 'none' : 'flex';
    }

    // Borra el gasto (Punto 9, 10)
    _borrarGasto() {
        if (confirm(`¿Confirmas borrar el gasto de "${this._gasto.descripcion}"?`)) {
            borrarGasto(this._gasto.id); 
            this.remove(); // Elimina el componente de la vista
        }
    }

    // Guarda los cambios del formulario de edición (Punto 15)
    _guardarEdicion(e) {
        e.preventDefault(); // Prevenir la recarga de la página (Punto 36)
        
        // 1. Obtener nuevos valores y actualizar el objeto
        this._gasto.descripcion = this.shadowRoot.querySelector('.edit-descripcion').value;
        this._gasto.valor = parseFloat(this.shadowRoot.querySelector('.edit-valor').value);
        this._gasto.fecha = this.shadowRoot.querySelector('.edit-fecha').value;
        const etiquetasStr = this.shadowRoot.querySelector('.edit-etiquetas').value;
        this._gasto.etiquetas = etiquetasStr.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        
        // 2. Guardar en la lógica de negocio
        guardarGasto(this._gasto); 
        
        // 3. Actualizar la vista (llama al setter 'set gasto()')
        this.gasto = this._gasto; 
        
        // 4. Cerrar formulario
        this._toggleFormulario();
    }
}

// ----------------------------------------------------------------------
// II. INICIALIZACIÓN Y LÓGICA DE CREACIÓN
// ----------------------------------------------------------------------

// Registrar el componente (Punto 21)
customElements.define('mi-gasto', MiGasto);

// Función para renderizar todos los gastos
function renderizarGastos(gastos) {
    listadoGastos.innerHTML = ''; 
    gastos.forEach(gasto => {
        const componenteGasto = document.createElement('mi-gasto');
        componenteGasto.gasto = gasto; // Asociar el objeto gasto al componente (Punto 26, 34)
        listadoGastos.appendChild(componenteGasto);
    });
}

// Lógica para manejar la creación del nuevo gasto (Punto 20)
function handleCrearGasto(e) {
    e.preventDefault(); // Prevenir la recarga
    
    // 1. Obtener valores
    const descripcion = document.getElementById('nueva-descripcion').value;
    const valor = parseFloat(document.getElementById('nuevo-valor').value);
    const fecha = document.getElementById('nueva-fecha').value;
    const etiquetasStr = document.getElementById('nuevas-etiquetas').value;
    const etiquetas = etiquetasStr.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    // 2. Crear el gasto (con la lógica de negocio)
    const nuevoGasto = crearGasto(descripcion, valor, fecha, etiquetas);
    
    // 3. Añadir a la lista local (si es necesario)
    if (!listaGastos.includes(nuevoGasto)) {
         listaGastos.push(nuevoGasto);
    }
   
    // 4. Crear y añadir el nuevo Web Component a la vista
    const nuevoComponente = document.createElement('mi-gasto');
    nuevoComponente.gasto = nuevoGasto;
    listadoGastos.appendChild(nuevoComponente);

    e.target.reset(); // Limpiar formulario
}

// Iniciar la aplicación:
renderizarGastos(listaGastos);
formCrearGasto.addEventListener('submit', handleCrearGasto);