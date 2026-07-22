import fs from 'fs';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================
const URL_USUARIOS = 'http://localhost:8080/api/users'; // Cambiado a /users
const URL_ZONAS = 'http://localhost:8081/api/zonas';
const URL_ESPACIOS = 'http://localhost:8081/api/espacios';
const URL_VEHICULOS = 'http://localhost:3000/vehiqlos';

// Si tus endpoints están protegidos por JWT, coloca el token aquí.
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYWNvcm9uYWRvIiwicm9sZXMiOlsiUk9MRV9BRE1JTklTVFJBRE9SIl0sImlhdCI6MTc4NDU4MTQwMiwiZXhwIjoxNzg0NjY3ODAyfQ.VsGm3eQG2aouD_elBOxZ842--L3fQGsEUkJM8amFWx8';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}` // Descomenta si necesitas enviar token
};

// ============================================================================
// HELPERS PARA GENERAR DATOS
// ============================================================================
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomString = (length) => Math.random().toString(36).substring(2, length + 2).toUpperCase();
const randomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));

function generarPersona(i) {
  return {
    dni: `10000${String(i).padStart(5, '0')}`, // DNI único de 10 dígitos
    firstName: `Nombre${i}`,
    secondName: `Segundo${i}`,
    middleName: `Apellido${i}`,
    lastName: `Materno${i}`,
    email: `usuario${i}@correo.com`,
    phone: `099${String(i).padStart(7, '0')}`,
    address: `Direccion ${i}`,
    nationality: "Ecuatoriana"
  };
}

function generarVehiculo(i) {
  const tipos = ['Auto', 'Moto', 'Camioneta'];
  const tipo = tipos[i % 3];

  let datos = {
    marca: "Toyota",
    modelo: "Modelo " + randomLetter() + randomLetter(), // Solo letras, el regex no acepta numeros
    color: "Rojo",
    anio: randomInt(2010, 2024),
    clasificacion: "Gasolina"
  };

  if (tipo === 'Auto') {
    datos.placa = `ABC-${String(1000 + i)}`; // ABC-1234
    datos.numPuertas = randomInt(2, 5);
    datos.capacidadMaletero = randomInt(200, 500);
  } else if (tipo === 'Moto') {
    datos.placa = `AB-${String(100 + i)}A`; // AB-123A
    datos.tipo = "Deportiva";
    datos.cilindraje = randomInt(150, 1000);
  } else if (tipo === 'Camioneta') {
    datos.placa = `XYZ-${String(1000 + i)}`; // ABC-1234
    datos.cabina = "Doble cabina";
    datos.capacidadCarga = randomInt(500, 1000);
  }

  return { tipo, datos };
}

// ============================================================================
// SCRIPT PRINCIPAL
// ============================================================================
async function run() {
  console.log("🚀 Iniciando el poblado de base de datos (50 registros)...");

  // 1. Crear 1 Zona con capacidad 50
  let idZona = null;
  try {
    const zonaBody = {
      nombre: `ZT${randomString(4)}`, // MAX 10 chars
      descripcion: "Zona generada para pruebas de carga",
      capacidad: 50,
      tipo: "GENERAL"
    };
    console.log("Creando Zona...");
    const resZona = await fetch(URL_ZONAS, { method: 'POST', headers, body: JSON.stringify(zonaBody) });
    const dataZona = await resZona.json();
    idZona = dataZona.id;
    console.log(`✅ Zona creada con ID: ${idZona}`);
  } catch (error) {
    console.error("❌ Error creando Zona:", error.message);
    return;
  }

  // 2. Crear 50 Espacios, 50 Personas, 50 Vehiculos
  for (let i = 1; i <= 50; i++) {
    console.log(`\n--- Generando registro ${i} de 50 ---`);

    // Crear Espacio
    try {
      const espacioBody = {
        descripcion: `Espacio de prueba ${i}`,
        tipo: i % 2 === 0 ? "AUTO" : "MOTO",
        idZona: idZona
      };
      const res = await fetch(URL_ESPACIOS, { method: 'POST', headers, body: JSON.stringify(espacioBody) });
      if (res.ok) console.log(`✅ Espacio ${i} creado`);
      else console.error(`❌ Error Espacio ${i}:`, await res.text());
    } catch (e) { console.error("Error red Espacio:", e.message); }

    // Crear Persona
    try {
      const personaBody = generarPersona(i);
      const res = await fetch(URL_USUARIOS, { method: 'POST', headers, body: JSON.stringify(personaBody) });
      if (res.ok) console.log(`✅ Persona ${i} creada (DNI: ${personaBody.dni})`);
      else console.error(`❌ Error Persona ${i}:`, await res.text());
    } catch (e) { console.error("Error red Persona:", e.message); }

    // Crear Vehiculo
    try {
      const vehiculoBody = generarVehiculo(i);
      const res = await fetch(URL_VEHICULOS, { method: 'POST', headers, body: JSON.stringify(vehiculoBody) });
      if (res.ok) console.log(`✅ Vehículo ${i} creado (Placa: ${vehiculoBody.datos.placa})`);
      else console.error(`❌ Error Vehículo ${i}:`, await res.text());
    } catch (e) { console.error("Error red Vehiculo:", e.message); }
  }

  console.log("\n🎉 ¡Proceso completado!");
  console.log("Ya puedes hacer pruebas de latencia (Cache Miss vs Cache Hit) con los nuevos DNIs, Placas y el ID del espacio generado.");
}

run();
