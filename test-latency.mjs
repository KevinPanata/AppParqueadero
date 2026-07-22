import fs from 'fs';

const URL_TICKETS = 'http://localhost:3001/tickets';
const URL_ESPACIOS = 'http://localhost:8081/api/espacios';

// Usando el mismo token de seed.mjs
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtYWNvcm9uYWRvIiwicm9sZXMiOlsiUk9MRV9BRE1JTklTVFJBRE9SIl0sImlhdCI6MTc4NDU4MTQwMiwiZXhwIjoxNzg0NjY3ODAyfQ.VsGm3eQG2aouD_elBOxZ842--L3fQGsEUkJM8amFWx8';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TOKEN}`
};

async function measureTime(name, url, body) {
  const start = performance.now();
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  const end = performance.now();
  const time = (end - start).toFixed(2);
  
  const data = await res.json();
  
  if (!res.ok) {
    console.log(`❌ [${name}] falló (${time} ms):`, data.message || data.error);
    return false;
  }
  
  console.log(`✅ [${name}] completado en: ${time} ms (Ticket ID: ${data.id})`);
  return true;
}

async function runTest() {
  console.log("🔍 Buscando espacios disponibles...");
  const resEspacios = await fetch(URL_ESPACIOS, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
  const espacios = await resEspacios.json();
  
  const disponibles = espacios.filter(e => e.estado === 'DISPONIBLE');
  if (disponibles.length < 2) {
    console.log("❌ No hay al menos 2 espacios disponibles para la prueba.");
    return;
  }

  const idEspacio1 = disponibles[0].id;
  const idEspacio2 = disponibles[1].id;
  
  // Vamos a usar la Persona 10 y el Vehículo 10 del seed
  const dniTest = "1000000010";
  const placaTest = "AB-110A"; // Sabemos que el 10 fue moto, placa AB-110A

  console.log("\n=======================================================");
  console.log(`🚗 Iniciando Prueba de Latencia para Vehículo: ${placaTest}, DNI: ${dniTest}`);
  console.log("=======================================================\n");

  const body1 = {
    placa: placaTest,
    dni: dniTest,
    idEspacio: idEspacio1,
    fechaHoraIngreso: new Date().toISOString()
  };

  console.log("⏳ Petición 1 (Cache Miss) - Debería ser más lenta porque consulta a los 3 microservicios...");
  await measureTime("Primera Petición", URL_TICKETS, body1);
  
  console.log("\n-------------------------------------------------------");
  
  const body2 = {
    placa: placaTest,
    dni: dniTest,
    idEspacio: idEspacio2, // Usamos otro espacio porque el anterior ya se ocupó
    fechaHoraIngreso: new Date().toISOString()
  };

  console.log("⚡ Petición 2 (Cache Hit) - Debería ser casi instantánea porque la persona y el vehículo están en Redis...");
  await measureTime("Segunda Petición", URL_TICKETS, body2);
  
  console.log("\n=======================================================");
  console.log("🏁 Prueba Finalizada. Compara los tiempos en milisegundos (ms).");
}

runTest();
