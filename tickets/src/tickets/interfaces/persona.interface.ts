export interface Persona {
    id: string;
    dni: string;
    firtsName: string;
    secondName: string;
    middleName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    nationality: string;
    active: boolean;
    createdAt: Date;
    lastModified?: Date;
}