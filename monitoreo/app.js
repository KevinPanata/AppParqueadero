const API_ZONAS = 'http://localhost:8081/api/zonas';
const API_ESPACIOS_GENERAL = 'http://localhost:8081/api/espacios';

let zonaActual = null;

const zonasList = document.getElementById('zonasList');
const espaciosContainer = document.getElementById('espaciosContainer');
const tituloPrincipal = document.getElementById('tituloPrincipal');
const subtitulo = document.getElementById('subtitulo');
const lastUpdate = document.getElementById('lastUpdate');

const formatDate = (date) => new Date(date).toLocaleString('es-ES', { hour12: false });

const mantenerConectado = () => {
    const indicator = document.getElementById('indicator');
    const statusText = document.getElementById('statusText');
    indicator.className = 'w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]';
    statusText.textContent = 'Conectado';
};

// --- FUNCIONES PARA LOS BOTONES ---
const eliminarZona = async (event, idZona) => {
    event.stopPropagation(); 
    if(confirm("¿Intentar desactivar esta zona?")) {
        try {
            const res = await fetch(`${API_ZONAS}/${idZona}/estado?nuevoEstado=ELIMINADA`, { method: 'PATCH' });
            if (res.ok) {
                cargarTodo();
            } else {
                const error = await res.json();
                alert("Validación del Backend:\n" + (error.message || "No se puede eliminar porque hay vehículos."));
            }
        } catch(e) { console.error("Error", e); }
    }
};

const reactivarZona = async (event, idZona) => {
    event.stopPropagation(); 
    if(confirm("¿Deseas volver a habilitar esta zona?")) {
        try {
            await fetch(`${API_ZONAS}/${idZona}/estado?nuevoEstado=ACTIVA`, { method: 'PATCH' });
            cargarTodo();
        } catch(e) { console.error("Error", e); }
    }
};

// --- RENDERIZAR ZONAS (CON BOTONES) ---
const renderZonas = (zonas) => {
    zonasList.innerHTML = zonas.map(zona => {
        let borderColor = 'border-green-500';
        let textColor = 'text-green-400';
        let badgeText = '● Activa';
        
        // Botón por defecto: Eliminar
        let botonAccion = `<button onclick="eliminarZona(event, '${zona.id}')" class="bg-slate-900 hover:bg-red-900 text-slate-400 hover:text-white px-2 py-1 rounded transition-colors text-[10px] uppercase font-bold">🗑️ Desactivar</button>`;

        if (zona.estado === 'MANTENIMIENTO') {
            borderColor = 'border-indigo-500';
            textColor = 'text-indigo-400';
            badgeText = '🔧 Mantenimiento';
        } else if (zona.estado === 'ELIMINADA') {
            borderColor = 'border-red-500';
            textColor = 'text-red-400';
            badgeText = '❌ Inactiva';
            // Si está inactiva, cambiamos el botón a Reactivar
            botonAccion = `<button onclick="reactivarZona(event, '${zona.id}')" class="bg-slate-900 hover:bg-green-700 text-slate-400 hover:text-white px-2 py-1 rounded transition-colors text-[10px] uppercase font-bold">✅ Reactivar</button>`;
        }

        return `
            <div onclick="seleccionarZona('${zona.id}', '${zona.nombre}')" 
                 class="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 cursor-pointer transition-all border-l-4 ${borderColor} ${zona.estado === 'ELIMINADA' ? 'opacity-50' : ''}">
                <div class="font-semibold">${zona.nombre}</div>
                <div class="text-sm text-slate-400">${zona.codigo || ''}</div>
                <div class="flex justify-between items-center text-xs mt-3">
                    <span class="${textColor} font-medium">${badgeText}</span>
                    ${botonAccion}
                </div>
            </div>
        `;
    }).join('');
};

const renderEspaciosHTML = (espaciosAgrupados) => {
    let html = '';
    
    if (Object.keys(espaciosAgrupados).length === 0) {
        espaciosContainer.innerHTML = `<div class="col-span-full text-center py-20 text-slate-400">No hay espacios disponibles.</div>`;
        return;
    }

    for (const [nombreZona, espaciosDeZona] of Object.entries(espaciosAgrupados)) {
        html += `
            <div class="col-span-full mt-6 mb-2 first:mt-0">
                <h3 class="text-xl font-bold text-slate-300 border-b border-slate-700 pb-2 flex items-center gap-2">
                    📍 ${nombreZona}
                </h3>
            </div>
        `;

        html += espaciosDeZona.map(esp => {
            let estadoClass = 'bg-disponible';
            let badgeClass = 'bg-green-500/20 text-green-400';

            if (esp.estado === 'OCUPADO') { 
                estadoClass = 'bg-ocupado'; badgeClass = 'bg-red-500/20 text-red-400'; 
            } else if (esp.estado === 'RESERVADO') { 
                estadoClass = 'bg-reservado'; badgeClass = 'bg-amber-500/20 text-amber-400'; 
            } else if (esp.estado === 'MANTENIMIENTO' || esp.estado === 'EN_MANTENIMIENTO') { 
                estadoClass = 'bg-mantenimiento'; badgeClass = 'bg-indigo-500/20 text-indigo-400'; 
            } else if (esp.estado === 'INACTIVO') {
                estadoClass = 'bg-slate-800 border-l-[6px] border-slate-500 opacity-50'; badgeClass = 'bg-slate-500/20 text-slate-400';
            }

            return `
                <div class="bg-card ${estadoClass} rounded-3xl p-6 text-white transition-all duration-300">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="text-2xl font-bold">${esp.nombre}</div>
                            <div class="text-slate-400 text-sm mt-1">${esp.descripcion || ''}</div>
                        </div>
                        <span class="px-4 py-1.5 text-xs font-bold rounded-2xl ${badgeClass}">${esp.estado}</span>
                    </div>
                    <div class="mt-6 text-xs text-slate-400 flex justify-between items-center">
                        <span>Tipo: <strong class="text-slate-200">${esp.tipo}</strong></span>
                    </div>
                </div>
            `;
        }).join('');
    }

    espaciosContainer.innerHTML = html;
    lastUpdate.textContent = formatDate(new Date());
};

const cargarTodo = async () => {
    try {
        // 1. Zonas
        const resZonas = await fetch(API_ZONAS);
        const zonas = await resZonas.json();
        renderZonas(zonas);

        // Diccionario infalible de Zonas
        const diccionarioZonas = {};
        zonas.forEach(z => { diccionarioZonas[z.id] = z.nombre; });

        // 2. Espacios
        const resEspacios = await fetch(API_ESPACIOS_GENERAL);
        let espacios = await resEspacios.json();

        // 3. Filtrar
        if (zonaActual) {
            espacios = espacios.filter(e => e.idZona === zonaActual);
        }

        // 4. Agrupar forzosamente con el diccionario
        const grupos = {};
        espacios.forEach(esp => {
            const nombreZ = diccionarioZonas[esp.idZona] || 'Zona Desconocida';
            if(!grupos[nombreZ]) grupos[nombreZ] = [];
            grupos[nombreZ].push(esp);
        });
        
        renderEspaciosHTML(grupos);
        mantenerConectado();
    } catch (e) {
        console.error("Error cargando el dashboard:", e);
    }
};

const seleccionarZona = (idZona, nombreZona) => {
    zonaActual = idZona;
    tituloPrincipal.textContent = nombreZona;
    subtitulo.textContent = "Espacios de la zona seleccionada";
    cargarTodo(); 
};

const verTodasLasZonas = () => {
    zonaActual = null;
    tituloPrincipal.textContent = "Dashboard General";
    subtitulo.textContent = "Todos los espacios por zona";
    cargarTodo(); 
};

// Bucle de actualización cada 2 segundos
(async () => {
    await verTodasLasZonas(); 
    setInterval(cargarTodo, 2000); 
})();