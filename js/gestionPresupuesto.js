let presupuesto = 0;
let gastos = [];
let idGasto = 0;

function actualizarPresupuesto(valor) {
    const nuevoValor = Number(valor);
    if (!isNaN(nuevoValor) && nuevoValor >= 0) {
        presupuesto = nuevoValor;
        return presupuesto;
    } else {
        return -1;
    }
}

function mostrarPresupuesto() {
    return `Tu presupuesto actual es de ${presupuesto} €`;
}

function CrearGasto(descripcion, valor, fecha, ...etiquetas) {
    var valorInicial = Number(valor);
    this.descripcion = descripcion ? String(descripcion) : "";

    if (!isNaN(valorInicial) && valorInicial >= 0) {
        this.valor = valorInicial;
    } else {
        this.valor = 0;
    }

    this.fecha = 0;
    this.etiquetas = [];

    this.anyadirEtiquetas = function(...etiquetasNuevas) {
        for (let i = 0; i < etiquetasNuevas.length; i++) {
            let etiqueta = String(etiquetasNuevas[i]);
            if (this.etiquetas.indexOf(etiqueta) === -1) {
                this.etiquetas.push(etiqueta);
            }
        }
    };

    this.borrarEtiquetas = function(...etiquetasABorrar) {
        for (let i = 0; i < etiquetasABorrar.length; i++) {
            let etiqueta = String(etiquetasABorrar[i]);
            let index = this.etiquetas.indexOf(etiqueta);
            if (index !== -1) this.etiquetas.splice(index, 1);
        }
    };

    this.actualizarFecha = function(fechaString) {
        let timestamp = Date.parse(fechaString);
        if (!isNaN(timestamp) && timestamp > 0) {
            this.fecha = timestamp;
            return true;
        }
        return false;
    };

    if (!this.actualizarFecha(fecha)) this.fecha = new Date().getTime();
    if (etiquetas.length > 0) this.anyadirEtiquetas(...etiquetas);

    this.mostrarGasto = function() {
        return `Gasto correspondiente a ${this.descripcion} con valor ${this.valor} €`;
    };

    this.actualizarDescripcion = function(nuevaDescripcion) {
        this.descripcion = nuevaDescripcion ? String(nuevaDescripcion) : "";
    };

    this.actualizarValor = function(nuevoValor) {
        let valorAComprobar = Number(nuevoValor);
        if (!isNaN(valorAComprobar) && valorAComprobar >= 0) this.valor = valorAComprobar;
    };

    this.mostrarGastoCompleto = function() {
        const fechaObj = new Date(this.fecha);
        const dia = fechaObj.getDate();
        const mes = fechaObj.getMonth() + 1;
        const anyo = fechaObj.getFullYear();
        const horas = String(fechaObj.getHours()).padStart(2, '0');
        const minutos = String(fechaObj.getMinutes()).padStart(2, '0');
        const segundos = String(fechaObj.getSeconds()).padStart(2, '0');
        const fechaLocalizada = `${dia}/${mes}/${anyo}, ${horas}:${minutos}:${segundos}`;

        let etiquetasTexto = "\nEtiquetas:\n";
        if (this.etiquetas.length > 0) {
            etiquetasTexto += this.etiquetas.map(e => `- ${e}`).join("\n") + "\n";
        }

        return `${this.mostrarGasto()}.\nFecha: ${fechaLocalizada}${etiquetasTexto}`;
    };

    this.obtenerPeriodoAgrupacion = function(periodo) {
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
}

function listarGastos() {
    return gastos;
}

function anyadirGasto(gasto) {
    gasto.id = idGasto++;
    gastos.push(gasto);
}

function borrarGasto(id) {
    for (let i = 0; i < gastos.length; i++) {
        if (gastos[i].id === id) {
            gastos.splice(i, 1);
            return;
        }
    }
}

function calcularTotalGastos() {
    return gastos.reduce((total, gasto) => total + gasto.valor, 0);
}

function calcularBalance() {
    return presupuesto - calcularTotalGastos();
}

function filtrarGastos(filtros = {}) {
    const { fechaDesde, fechaHasta, valorMinimo, valorMaximo, descripcionContiene, etiquetasTiene } = filtros;

    const tsDesde = fechaDesde ? Date.parse(fechaDesde) : 0;
    const tsHasta = fechaHasta ? Date.parse(fechaHasta) : Infinity;

    const minValor = !isNaN(Number(valorMinimo)) && Number(valorMinimo) >= 0 ? Number(valorMinimo) : 0;
    const maxValor = !isNaN(Number(valorMaximo)) && Number(valorMaximo) >= 0 ? Number(valorMaximo) : Infinity;

    const textoContieneLower = descripcionContiene ? String(descripcionContiene).toLowerCase() : null;

    let etiquetasBusquedaLower = null;
    if (Array.isArray(etiquetasTiene) && etiquetasTiene.length > 0) {
        etiquetasBusquedaLower = etiquetasTiene.map(tag => String(tag).toLowerCase());
    }

    return gastos.filter(gasto => {
        const fechaGasto = gasto.fecha;
        const valorGasto = gasto.valor;

        const filtroFecha = fechaGasto >= tsDesde && fechaGasto <= tsHasta;
        const filtroValor = valorGasto >= minValor && valorGasto <= maxValor;

        let filtroDescripcion = true;
        if (textoContieneLower !== null) {
            filtroDescripcion = gasto.descripcion.toLowerCase().includes(textoContieneLower);
        }

        let filtroEtiquetas = true;
        if (etiquetasBusquedaLower !== null) {
            filtroEtiquetas = gasto.etiquetas.some(tag => etiquetasBusquedaLower.includes(tag.toLowerCase()));
        }

        return filtroFecha && filtroValor && filtroDescripcion && filtroEtiquetas;
    });
}

function agruparGastos(periodo = 'mes', etiquetas = [], fechaDesde, fechaHasta) {
    const gastosFiltrados = filtrarGastos({ fechaDesde, fechaHasta, etiquetasTiene: etiquetas });

    return gastosFiltrados.reduce((acum, gasto) => {
        const clavePeriodo = gasto.obtenerPeriodoAgrupacion(periodo);
        acum[clavePeriodo] = (acum[clavePeriodo] || 0) + gasto.valor;
        return acum;
    }, {});
}

export {
    mostrarPresupuesto,
    actualizarPresupuesto,
    CrearGasto,
    listarGastos,
    anyadirGasto,
    borrarGasto,
    calcularTotalGastos,
    calcularBalance,
    filtrarGastos,
    agruparGastos
};

