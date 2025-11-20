// js/gestionPresupuesto.js
// --- LÓGICA DE NEGOCIO ORIGINAL, ADAPTADA PARA EXPORTACIÓN ---

let presupuesto = 0;
let gastos = [];
let idGasto = 1; // Inicializado en 1 para IDs únicos

// --- FUNCIÓN CONSTRUCTORA ORIGINAL (USADA INTERNAMENTE) ---
function GastoConstructor(descripcion, valor, fecha, etiquetasArray) {
    var valorInicial = Number(valor);
    this.descripcion = descripcion ? String(descripcion) : "";

    if (!isNaN(valorInicial) && valorInicial >= 0) {
        this.valor = valorInicial;
    } else {
        this.valor = 0;
    }
    
    // Convertir la fecha a timestamp o usar la fecha actual
    this.fecha = Date.parse(fecha) ? Date.parse(fecha) : new Date().getTime(); 
    
    // Asegurar que las etiquetas sean un array
    this.etiquetas = Array.isArray(etiquetasArray) ? etiquetasArray.map(String) : [];
    
    // Función auxiliar para obtener la fecha en formato 'YYYY-MM-DD' (para el input HTML)
    this.getFechaFormatoInput = function() {
         const d = new Date(this.fecha);
         // Formato ISO: YYYY-MM-DD
         return d.toISOString().split('T')[0];
    }
    
    // Necesario para el filtrado, si se usa:
    this.obtenerPeriodoAgrupacion = function(periodo) {
        // ... (Implementación de obtenerPeriodoAgrupacion)
         const fechaObj = new Date(this.fecha);
         const anyo = fechaObj.getFullYear();
         const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
         const dia = String(fechaObj.getDate()).padStart(2, '0');
         
         switch (periodo) {
            case 'anyo': return String(anyo);
            case 'dia': return `${anyo}-${mes}-${dia}`;
            case 'mes':
            default: return `${anyo}-${mes}`;
         }
    };
    
    // Aquí puedes incluir todas las demás funciones de tu constructor original (actualizarFecha, mostrarGasto, etc.)
}

// ----------------------------------------------------------------------------------
// --- FUNCIONES EXPORTADAS REQUERIDAS POR gestionPresupuestoWebV2.js ---
// ----------------------------------------------------------------------------------

/**
 * Función requerida por el Web Component para crear un nuevo gasto.
 * Se llama 'crearGasto' (minúscula) y devuelve el objeto con las propiedades esperadas.
 */
export function crearGasto(descripcion, valor, fecha, etiquetas) {
    const nuevoObjetoGasto = new GastoConstructor(descripcion, valor, fecha, etiquetas);
    
    // Asignar ID y añadir a la lista (similar a tu función anyadirGasto)
    nuevoObjetoGasto.id = idGasto++; 
    gastos.push(nuevoObjetoGasto);
    
    // Devolvemos el objeto en un formato compatible con el setter del Web Component
    return {
        id: nuevoObjetoGasto.id,
        descripcion: nuevoObjetoGasto.descripcion,
        valor: nuevoObjetoGasto.valor,
        fecha: nuevoObjetoGasto.getFechaFormatoInput(), // Formato YYYY-MM-DD
        etiquetas: nuevoObjetoGasto.etiquetas
    };
}

/**
 * Función requerida para obtener la lista de gastos inicial.
 * Se llama 'obtenerGastos' (minúscula).
 */
export function obtenerGastos() {
    // Mapeamos para que los objetos devueltos incluyan el ID y la fecha en formato YYYY-MM-DD
    return gastos.map(g => ({
        id: g.id,
        descripcion: g.descripcion,
        valor: g.valor,
        fecha: g.getFechaFormatoInput(), // Formato YYYY-MM-DD
        etiquetas: g.etiquetas
    }));
}

/**
 * Función requerida para guardar los cambios de un gasto editado.
 */
export function guardarGasto(gastoActualizado) {
    const index = gastos.findIndex(g => g.id === gastoActualizado.id);
    if (index !== -1) {
        // Actualizar las propiedades del objeto original en la lista
        gastos[index].descripcion = gastoActualizado.descripcion;
        gastos[index].valor = gastoActualizado.valor;
        // La fecha debe ser actualizada al timestamp (como hace tu constructor)
        gastos[index].fecha = Date.parse(gastoActualizado.fecha);
        gastos[index].etiquetas = gastoActualizado.etiquetas;
    }
}

/**
 * Función requerida para borrar un gasto.
 */
export function borrarGasto(id) {
    const idNum = parseInt(id);
    const indice = gastos.findIndex(g => g.id === idNum);
    if (indice !== -1) {
        gastos.splice(indice, 1);
    }
}


// --- OTRAS FUNCIONES ORIGINALES (Exportadas) ---
// Se exportan para que tu código las pueda usar si las necesita en un futuro.
export function actualizarPresupuesto(valor) { /* ... */ } // Tu función original
export function mostrarPresupuesto() { /* ... */ } // Tu función original
export function listarGastos() { return gastos; } // Tu función original
export function calcularTotalGastos() { /* ... */ } // Tu función original
export function calcularBalance() { /* ... */ } // Tu función original
export function filtrarGastos(filtros = {}) { /* ... */ } // Tu función original
export function agruparGastos(periodo = 'mes', etiquetas = [], fechaDesde, fechaHasta) { /* ... */ } // Tu función original