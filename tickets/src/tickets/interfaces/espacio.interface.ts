export enum TipoEspacio {
    AUTO = 'AUTO',
    MOTO = 'MOTO',
    BUSETA = 'BUSETA',
    BUS = 'BUS',
    CAMION = 'CAMION'
}

export enum EstadoEspacio {
    DISPONIBLE = 'DISPONIBLE',
    OCUPADO = 'OCUPADO',
    RESERVADO = 'RESERVADO',
    MANTENIMIENTO = 'MANTENIMIENTO',
    INACTIVO = 'INACTIVO'
}

export enum TipoZona {
    VIP = 'VIP',
    VISITANTES = 'VISITANTES',
    GENERAL = 'GENERAL',
    PREFERENCIAL = 'PREFERENCIAL'
}

export interface Zona {
    id: string;
    nombre: string;
    codigo: string;
    descripcion?: string;
    capacidad: number;
    tipo: TipoZona;
    activo: boolean;
    fechaCreacion?: Date;
    fechaActualizacion?: Date;
}

export interface Espacio {
    id: string;
    nombre: string;
    descripcion?: string;
    tipo: TipoEspacio;
    estado: EstadoEspacio;
    zona?: Zona;
    fechaCreacion?: Date;
    fechaActualizacion?: Date;
}