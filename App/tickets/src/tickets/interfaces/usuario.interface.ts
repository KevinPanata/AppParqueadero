export interface Usuario {
  id: string;
  username: string;
  active: boolean;
  person: {
    id: string;
    dni: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    nationality: string;
  };
  roles: string[];
}