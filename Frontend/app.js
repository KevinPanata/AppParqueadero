// app.js

// Configuración
const API_ESPACIOS = 'http://localhost:8081/api/espacios';
const API_ZONAS = 'http://localhost:8081/api/zonas';
const SSE_URL = 'http://localhost:3004/sse/espacios';

// Elementos DOM
const container = document.getElementById('contenedorPrincipal');
const totalSpan = document.getElementById('totalElementos');
const totalCount = document.getElementById('totalCount');
const disponibleCount = document.getElementById('disponibleCount');
const ocupadoCount = document.getElementById('ocupadoCount');
const reservadoCount = document.getElementById('reservadoCount');
const lastUpdateSpan = document.getElementById('lastUpdate');
const indicator = document.getElementById('indicator');
const statusText = document.getElementById('statusText');
const sseStatus = document.getElementById('sseStatus');
const vistaActual = document.getElementById('vistaActual');
const vistaFooter = document.getElementById('vistaFooter');
const btnCambiarVista = document.getElementById('btnCambiarVista');
const filtrosContainer = document.getElementById('filtrosContainer');

// Estado
let espaciosData = [];
let zonasData = [];
let vistaActualTipo = 'espacios'; // 'espacios' o 'zonas'
let filtroActual = 'todos';
let eventSource = null;

// Utilidades
const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString('es-ES', { 
        hour12: false,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

const setConnectionStatus = (connected) => {
    if (connected) {
        indicator.className = 'w-3 h-3 bg-green-500 rounded-full inline-block animate-pulse';
        statusText.textContent = 'Conectado';
        sseStatus.textContent = 'Conectado';
        sseStatus.className = 'font-medium text-green-600';
    } else {
        indicator.className = 'w-3 h-3 bg-red-500 rounded-full inline-block';
        statusText.textContent = 'Desconectado';
        sseStatus.textContent = 'Desconectado';
        sseStatus.className = 'font-medium text-red-600';
    }
};

const showToast = (message, type = 'info') => {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} show`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${type === 'success' ? 'fa-check-circle text-green-500' : type === 'error' ? 'fa-exclamation-circle text-red-500' : 'fa-info-circle text-blue-500'}"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Cambiar vista entre Espacios y Zonas
const cambiarVista = () => {
    if (vistaActualTipo === 'espacios') {
        vistaActualTipo = 'zonas';
        vistaActual.textContent = 'Zonas';
        vistaFooter.textContent = 'Zonas';
        btnCambiarVista.innerHTML = '<i class="fas fa-exchange-alt"></i> Ver Espacios';
        filtrosContainer.style.display = 'none'; // Ocultar filtros en vista de zonas
        renderizarZonas(zonasData);
    } else {
        vistaActualTipo = 'espacios';
        vistaActual.textContent = 'Espacios';
        vistaFooter.textContent = 'Espacios';
        btnCambiarVista.innerHTML = '<i class="fas fa-exchange-alt"></i> Ver Zonas';
        filtrosContainer.style.display = 'flex'; // Mostrar filtros en vista de espacios
        renderizarEspacios(espaciosData);
    }
};

// API Calls
const fetchEspacios = async () => {
    try {
        const response = await fetch(API_ESPACIOS);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener espacios:', error);
        showToast('Error al cargar espacios: ' + error.message, 'error');
        return null;
    }
};

const fetchZonas = async () => {
    try {
        const response = await fetch(API_ZONAS);
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener zonas:', error);
        showToast('Error al cargar zonas: ' + error.message, 'error');
        return null;
    }
};

// Renderizado de Espacios
const renderizarEspacios = (espacios) => {
    if (!espacios || espacios.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500">
                <i class="fas fa-parking text-6xl mb-4 text-gray-300"></i>
                <p class="text-xl">No hay espacios disponibles</p>
                <p class="text-sm text-gray-400 mt-2">Los espacios aparecerán aquí cuando estén configurados</p>
            </div>
        `;
        actualizarEstadisticas([]);
        return;
    }

    // Filtrar si es necesario
    let espaciosFiltrados = espacios;
    if (filtroActual !== 'todos') {
        espaciosFiltrados = espacios.filter(esp => 
            esp.estado.toLowerCase() === filtroActual.toLowerCase()
        );
    }

    if (espaciosFiltrados.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500">
                <i class="fas fa-search text-6xl mb-4 text-gray-300"></i>
                <p class="text-xl">No hay espacios con el filtro "${filtroActual}"</p>
            </div>
        `;
        actualizarEstadisticas(espacios);
        return;
    }

    const html = espaciosFiltrados.map((esp) => {
        const estadoClass = `bg-${esp.estado.toLowerCase()}`;
        const estadoIcon = esp.estado.toLowerCase() === 'disponible' ? 'fa-check-circle' :
                          esp.estado.toLowerCase() === 'ocupado' ? 'fa-times-circle' :
                          esp.estado.toLowerCase() === 'reservado' ? 'fa-clock' : 'fa-tools';
        const estadoColor = esp.estado.toLowerCase() === 'disponible' ? 'text-green-500' :
                           esp.estado.toLowerCase() === 'ocupado' ? 'text-red-500' :
                           esp.estado.toLowerCase() === 'reservado' ? 'text-yellow-500' : 'text-gray-500';
        
        return `
            <div class="espacio-card ${estadoClass} rounded-lg shadow p-4 flex flex-col gap-2">
                <div class="flex items-start justify-between">
                    <div>
                        <div class="font-bold text-lg text-gray-800">${esp.nombre || 'Sin nombre'}</div>
                        <div class="text-sm text-gray-600">Zona: ${esp.nombreZona || 'Sin zona'}</div>
                    </div>
                    <div class="flex items-center gap-1">
                        <i class="fas ${estadoIcon} ${estadoColor}"></i>
                        <span class="estado-badge estado-${esp.estado.toLowerCase()}">${esp.estado}</span>
                    </div>
                </div>
                
                <div class="text-xs text-gray-500 space-y-1 mt-1">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-tag w-4 text-gray-400"></i>
                        <span>Tipo: ${esp.tipo || 'No especificado'}</span>
                    </div>
                    ${esp.descripcion ? `
                    <div class="flex items-center gap-2">
                        <i class="fas fa-info-circle w-4 text-gray-400"></i>
                        <span>${esp.descripcion}</span>
                    </div>
                    ` : ''}
                    ${esp.fechaActualizacion ? `
                    <div class="flex items-center gap-2">
                        <i class="fas fa-clock w-4 text-gray-400"></i>
                        <span>Actualizado: ${formatDate(esp.fechaActualizacion)}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="mt-2 pt-2 border-t border-gray-200 flex justify-end">
                    <span class="text-xs text-gray-400">ID: ${esp.id.substring(0, 8)}</span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
    actualizarEstadisticas(espacios);
};

// Renderizado de Zonas
const renderizarZonas = (zonas) => {
    if (!zonas || zonas.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500">
                <i class="fas fa-layer-group text-6xl mb-4 text-gray-300"></i>
                <p class="text-xl">No hay zonas disponibles</p>
                <p class="text-sm text-gray-400 mt-2">Las zonas aparecerán aquí cuando estén configuradas</p>
            </div>
        `;
        actualizarEstadisticasZonas([]);
        return;
    }

    const html = zonas.map((zona) => {
        // Determinar color según estado
        const estadoColor = zona.activo ? 'text-green-500' : 'text-red-500';
        const estadoText = zona.activo ? 'Activa' : 'Inactiva';
        
        return `
            <div class="bg-white rounded-lg shadow hover:shadow-lg transition-all p-4 flex flex-col gap-2 border-l-4 ${zona.activo ? 'border-green-500' : 'border-red-500'}">
                <div class="flex items-start justify-between">
                    <div>
                        <div class="font-bold text-lg text-gray-800">${zona.nombre || 'Sin nombre'}</div>
                        <div class="text-sm text-gray-600">Código: ${zona.codigo || 'N/A'}</div>
                    </div>
                    <div class="flex items-center gap-1">
                        <i class="fas ${zona.activo ? 'fa-check-circle' : 'fa-times-circle'} ${estadoColor}"></i>
                        <span class="text-xs font-semibold ${estadoColor}">${estadoText}</span>
                    </div>
                </div>
                
                <div class="text-xs text-gray-500 space-y-1 mt-1">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-warehouse w-4 text-gray-400"></i>
                        <span>Tipo: ${zona.tipo || 'No especificado'}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="fas fa-users w-4 text-gray-400"></i>
                        <span>Capacidad: ${zona.capacidad || 0} espacios</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="fas fa-parking w-4 text-gray-400"></i>
                        <span>Espacios disponibles: ${zona.espaciosDisponibles || 0}</span>
                    </div>
                    ${zona.descripcion ? `
                    <div class="flex items-center gap-2">
                        <i class="fas fa-info-circle w-4 text-gray-400"></i>
                        <span>${zona.descripcion}</span>
                    </div>
                    ` : ''}
                    ${zona.fechaCreacion ? `
                    <div class="flex items-center gap-2">
                        <i class="fas fa-calendar-plus w-4 text-gray-400"></i>
                        <span>Creada: ${formatDate(zona.fechaCreacion)}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="mt-2 pt-2 border-t border-gray-200 flex justify-between">
                    <span class="text-xs text-gray-400">ID: ${zona.id.substring(0, 8)}</span>
                    <span class="text-xs ${zona.activo ? 'text-green-500' : 'text-red-500'}">
                        <i class="fas ${zona.activo ? 'fa-circle' : 'fa-circle'} text-[8px]"></i>
                        ${zona.activo ? 'Activa' : 'Inactiva'}
                    </span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
    actualizarEstadisticasZonas(zonas);
};

// Estadísticas para Espacios
const actualizarEstadisticas = (espacios) => {
    const total = espacios.length;
    const disponibles = espacios.filter(e => e.estado?.toLowerCase() === 'disponible').length;
    const ocupados = espacios.filter(e => e.estado?.toLowerCase() === 'ocupado').length;
    const reservados = espacios.filter(e => e.estado?.toLowerCase() === 'reservado').length;
    
    totalCount.textContent = total;
    disponibleCount.textContent = disponibles;
    ocupadoCount.textContent = ocupados;
    reservadoCount.textContent = reservados;
    totalSpan.textContent = `${total} espacios`;
};

// Estadísticas para Zonas
const actualizarEstadisticasZonas = (zonas) => {
    const total = zonas.length;
    const activas = zonas.filter(z => z.activo).length;
    const inactivas = zonas.filter(z => !z.activo).length;
    
    totalCount.textContent = total;
    disponibleCount.textContent = activas;
    ocupadoCount.textContent = inactivas;
    reservadoCount.textContent = 0;
    totalSpan.textContent = `${total} zonas`;
};

// Cargar datos
const cargarDatos = async () => {
    try {
        const espacios = await fetchEspacios();
        const zonas = await fetchZonas();
        
        if (espacios) {
            espaciosData = espacios;
        }
        if (zonas) {
            zonasData = zonas;
        }
        
        // Renderizar según la vista actual
        if (vistaActualTipo === 'espacios') {
            renderizarEspacios(espaciosData);
        } else {
            renderizarZonas(zonasData);
        }
        
        setConnectionStatus(true);
        lastUpdateSpan.textContent = formatDate(new Date());
        showToast('Datos actualizados correctamente', 'success');
    } catch (error) {
        console.error('Error al cargar datos:', error);
        setConnectionStatus(false);
    }
};

// Filtrar espacios
const filtrarEspacios = (filtro) => {
    filtroActual = filtro;
    
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filtro === filtro) {
            btn.classList.add('active');
        }
    });
    
    renderizarEspacios(espaciosData);
};

// Conectar SSE
const conectarSSE = () => {
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }

    try {
        eventSource = new EventSource(SSE_URL);

        eventSource.onopen = () => {
            console.log('SSE: conexión establecida');
            setConnectionStatus(true);
            showToast('Conexión SSE establecida', 'success');
        };

        eventSource.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);
                console.log('SSE recibido:', payload);
                cargarDatos();
            } catch (e) {
                console.error('Error al parsear evento SSE:', e);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE error:', error);
            setConnectionStatus(false);
            showToast('Error en conexión SSE, reintentando...', 'warning');
            
            setTimeout(() => {
                if (eventSource) {
                    eventSource.close();
                    eventSource = null;
                }
                conectarSSE();
            }, 5000);
        };

    } catch (error) {
        console.error('Error al conectar SSE:', error);
        setConnectionStatus(false);
        showToast('Error al conectar SSE: ' + error.message, 'error');
    }
};

// Inicialización
(async () => {
    await cargarDatos();
    conectarSSE();
    
    setInterval(() => {
        if (!eventSource || eventSource.readyState !== EventSource.OPEN) {
            cargarDatos();
        }
    }, 30000);
})();

// Exportar funciones
window.cargarDatos = cargarDatos;
window.filtrarEspacios = filtrarEspacios;
window.cambiarVista = cambiarVista;