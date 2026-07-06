# Orden 01 — Completar el CRUD del Microservicio zonas-espacios

> **Fecha:** 2026-06-01  
> **Objetivo:** Finalizar los controladores REST que exponen el CRUD completo de Zonas y Espacios.

---

## Estado antes de esta orden

Los servicios e interfaces del microservicio estaban completamente implementados desde la sesión anterior (ver `explicacion_tareas.md`). Sin embargo, la **capa de controladores estaba incompleta**, lo que hacía que la API no fuera accesible desde ningún cliente HTTP (como Postman o un frontend).

| Archivo | Problema encontrado |
|---|---|
| `ZonaControlador.java` | Solo `listarZonas()` tenía `@GetMapping`. `crearZona()` sin `@PostMapping`. `actualizarZona()` sin `@PutMapping` ni `@PathVariable`. `eliminarZona()` sin implementar. Import innecesario de `org.apache.coyote.Response`. |
| `EspacioControlador.java` | **No existía**. El servicio `ServicioEspacio` tenía 7 métodos listos pero sin ningún endpoint para exponer. |

---

## Cambio 1 — Corrección de `ZonaControlador.java`

### Problema: métodos sin anotaciones HTTP

En Spring MVC, para que un método de un `@RestController` responda a una petición HTTP, **debe tener una anotación de mapeo** (`@GetMapping`, `@PostMapping`, etc.). Sin ellas, el método existe en Java pero Spring **no registra ninguna ruta** para él.

### Antes (código con errores)

```java
// Sin @PostMapping → Spring nunca registra esta ruta
public ResponseEntity<ZonaResponseDto> crearZona(@Valid @RequestBody ZonaRequestDTO dto){
    ...
}

// Sin @PutMapping ni @PathVariable → el parámetro idZona no viene de la URL
public ResponseEntity<ZonaResponseDto> actualizarZona(@PathVariable UUID idZona, ...){
    ...
}

// Método vacío → no hace nada
//ELIMINAR ZONA
```

### Después (código corregido)

```java
@PostMapping
public ResponseEntity<ZonaResponseDto> crearZona(@Valid @RequestBody ZonaRequestDTO dto) {
    ZonaResponseDto responseDto = servicioZonas.crear(dto);
    return new ResponseEntity<>(responseDto, HttpStatus.CREATED);
}

@PutMapping("/{idZona}")
public ResponseEntity<ZonaResponseDto> actualizarZona(
        @PathVariable UUID idZona,
        @Valid @RequestBody ZonaRequestDTO dto) {
    return ResponseEntity.ok(servicioZonas.actualizar(idZona, dto));
}

@DeleteMapping("/{idZona}")
public ResponseEntity<Void> eliminarZona(@PathVariable UUID idZona) {
    servicioZonas.eliminarZona(idZona);
    return ResponseEntity.noContent().build();
}
```

### Tabla de anotaciones HTTP y cuándo usarlas

| Anotación | Método HTTP | Uso típico | Código respuesta |
|---|---|---|---|
| `@GetMapping` | GET | Consultar / listar datos | 200 OK |
| `@PostMapping` | POST | Crear un nuevo recurso | 201 CREATED |
| `@PutMapping("/{id}")` | PUT | Reemplazar / actualizar recurso | 200 OK |
| `@DeleteMapping("/{id}")` | DELETE | Eliminar un recurso | 204 NO CONTENT |

### ¿Por qué `ResponseEntity.noContent().build()` en DELETE?

Cuando se elimina un recurso, la respuesta no tiene cuerpo (no hay nada que devolver). El estándar HTTP usa el código **204 No Content** para indicar éxito sin cuerpo. `ResponseEntity.noContent().build()` construye exactamente esa respuesta.

---

## Cambio 2 — Creación de `EspacioControlador.java`

### Estructura del controlador (patrón del docente)

```
@RestController               → Marca la clase como controlador REST
@RequestMapping("/api/...")   → Define el prefijo de la ruta base
@RequiredArgsConstructor      → Lombok genera el constructor con los campos final
public class XControlador {
    private final XServicio servicioX;   // inyección por constructor (recomendada)
    
    @GetMapping / @PostMapping / ...     → cada endpoint
}
```

### Endpoints creados

| Método | URL completa | Descripción |
|---|---|---|
| GET | `GET /api/espacios` | Lista todos los espacios |
| GET | `GET /api/espacios/{id}` | Obtiene un espacio por su UUID |
| POST | `POST /api/espacios` | Crea un espacio (el nombre se genera automáticamente) |
| PUT | `PUT /api/espacios/{id}` | Actualiza tipo, estado y descripción del espacio |
| DELETE | `DELETE /api/espacios/{id}` | Elimina el espacio (204 No Content) |
| GET | `GET /api/espacios/estado/{estado}` | Filtra espacios por estado (DISPONIBLE, OCUPADO…) |
| GET | `GET /api/espacios/zona/{idZona}/estado/{estado}` | Filtra por zona **y** estado |
| GET | `GET /api/espacios/estadisticas/{estado}` | Conteo de espacios por estado, agrupado por zona |

### ¿Por qué `@PathVariable` en `estado` de tipo `EstadoEspacio`?

Spring convierte automáticamente el `String` de la URL al tipo del enum gracias a su sistema de conversión de tipos. Por ejemplo, `GET /api/espacios/estado/DISPONIBLE` convierte `"DISPONIBLE"` al valor `EstadoEspacio.DISPONIBLE`. Esto funciona siempre que el valor en la URL coincida **exactamente** con el nombre del enum (mayúsculas incluidas).

### Endpoint de estadísticas — respuesta especial

```java
@GetMapping("/estadisticas/{estado}")
public ResponseEntity<Map<String, Long>> estadisticasPorEstado(@PathVariable EstadoEspacio estado) {
    return ResponseEntity.ok(servicioEspacios.obtenerEspaciosPorEstadoAgrupadosPorZona(estado));
}
```

Este endpoint no devuelve una lista de objetos sino un **mapa JSON** con la forma:
```json
{
  "Zona Norte": 5,
  "Zona Sur": 3,
  "Zona VIP": 1
}
```
La clave es el nombre de la zona, el valor es cuántos espacios tienen ese estado.

---

## Resumen de archivos modificados/creados

| Archivo | Acción | Descripción |
|---|---|---|
| `controladores/ZonaControlador.java` | ✏️ Modificado | Corregidas anotaciones HTTP, implementado `eliminarZona` |
| `controladores/EspacioControlador.java` | ✅ Creado | CRUD completo + 3 endpoints de consulta |
| `docs/orden-01-crud-completado.md` | ✅ Creado | Este documento |
| `docs/zonas-espacios-postman.json` | ✅ Creado | Colección Postman para probar todos los endpoints |

---

## Valores válidos para los enums (útil para Postman)

```
TipoZona:     VIP | VISITANTES | GENERAL | PREFERENCIAL
TipoEspacio:  AUTO | MOTO | BUSETA | BUS | CAMION
EstadoEspacio: DISPONIBLE | OCUPADO | RESERVADO | MANTENIMIENTO
```

> [!NOTE]
> El servidor corre en `http://localhost:8080` con base de datos MySQL en `localhost:3306/zonas_espacios`. El campo `codigo` de Zona y `nombre` de Espacio se generan automáticamente — no se envían en el request body.
