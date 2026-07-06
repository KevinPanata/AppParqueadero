# Explicación de Tareas — Proyecto Zonas y Espacios

## Estado del Proyecto (antes de los cambios)

| Archivo | Problema encontrado |
|---|---|
| `Espacio.java` | Faltaba el campo `estado` (EstadoEspacio), el repositorio ya lo usaba |
| `EspacioRepositorio.java` | `findByIdZona` y `findByEstado(String)` eran incorrectos según el modelo |
| `ZonaResponseDto.java` | Sin Lombok → sin getters/setters, el campo `espaciosDisponibles` sin lógica |
| `EspacioResponseDto.java` | Import de `jakarta.persistence` innecesario, sin Lombok |
| `ZonaRequestDTO.java` | `@NotBlank` en campo `int` (solo aplica a `String`) |
| `EspacioRequestDTO.java` | `@NotBlank` en `TipoEspacio` (enum) y `UUID`, sin Lombok |
| `EspacioServicio.java` | Referenciaba `EspacioRequestDto` (no existe), `eliminarEspacio(String)` vs `UUID` |
| `ServicioZona.java` | Solo métodos vacíos/stub, sin lógica real, con métodos de `Object` innecesarios |
| `ServicioEspacio.java` | No existía la implementación |

---

## Tarea 1 — Buscar espacios por estado agrupados por zona

### ¿Qué pidió el docente?

Un método en `EspacioRepositorio` que devuelva, dado un estado (DISPONIBLE, OCUPADO, etc.), **cuántos espacios de ese estado tiene cada zona**.

### ¿Por qué no se puede hacer con el patrón `findBy...`?

Spring Data JPA genera métodos automáticos como `findByEstado(estado)`, pero ese método solo devuelve una **lista plana** de espacios. Para **agrupar** necesitamos usar **JPQL** (el lenguaje de consulta de JPA) con la cláusula `GROUP BY`.

### La solución

```java
@Query("SELECT e.zona, COUNT(e) FROM Espacio e WHERE e.estado = :estado GROUP BY e.zona")
List<Object[]> findEspaciosPorEstadoAgrupadosPorZona(@Param("estado") EstadoEspacio estado);
```

**Paso a paso de la query JPQL:**

| Parte | Significado |
|---|---|
| `SELECT e.zona, COUNT(e)` | Para cada grupo devuelve la Zona y cuántos espacios hay |
| `FROM Espacio e` | Trabaja sobre la entidad Espacio (tabla `Espacios`) |
| `WHERE e.estado = :estado` | Filtra solo los espacios con el estado que le pasamos |
| `GROUP BY e.zona` | Agrupa todos los resultados por zona |

**Resultado:** una lista de arreglos `Object[]` donde:
- `fila[0]` → objeto `Zona`
- `fila[1]` → `Long` (la cantidad de espacios)

En el **servicio** (`ServicioEspacio`) esto se convierte a un `Map<String, Long>` más fácil de usar:
```
{ "Zona Norte": 5, "Zona Sur": 3 }
```

---

## Tarea 2 — Total de espacios disponibles en `ZonaResponseDto`

### ¿Qué pidió el docente?

El campo `espaciosDisponibles` del DTO de respuesta de Zona debe mostrar **cuántos espacios de esa zona tienen estado `DISPONIBLE`**.

### ¿Dónde se calcula?

No se calcula en la entidad ni en el DTO directamente. Se calcula en el **servicio**, en el método `mapearAResponse(Zona zona)`, cuando construimos el DTO:

```java
private ZonaResponseDto mapearAResponse(Zona zona) {
    // Recorremos la lista de espacios de la zona y contamos los DISPONIBLES
    long disponibles = zona.getEspacios()
            .stream()
            .filter(e -> EstadoEspacio.DISPONIBLE.equals(e.getEstado()))
            .count();

    return ZonaResponseDto.builder()
            // ... otros campos ...
            .espaciosDisponibles((int) disponibles)
            .build();
}
```

**¿Por qué funciona?** La entidad `Zona` tiene una relación `@OneToMany` con `Espacio` (ver el campo `List<Espacio> espacios`). Al cargar una zona, JPA también carga sus espacios. Entonces podemos filtrar directamente en memoria con Java Streams.

> [!NOTE]
> Para que esto funcione eficientemente en producción, la relación debe ser `FetchType.EAGER` o manejar transacciones correctamente. Con `@OneToMany` el default es `LAZY`, lo que significa que los espacios se cargan solo cuando se acceden (lo cual funciona dentro de una transacción activa en el servicio).

---

## Tarea 3 — Generación automática del nombre/código

### Formato esperado

| Entidad | Campo | Formato | Ejemplo |
|---|---|---|---|
| `Zona` | `codigo` | `ZON-[TIPO]-[NN]` | `ZON-VIP-01` |
| `Espacio` | `nombre` | `[3 letras zona]-[TIPO]-[NN]-[NNN]` | `Zon-AUTO-01-001` |

### Código de Zona — `ZON-VIP-01`

Se genera en `ServicioZona.crear()`:

```java
private String generarCodigoZona(String tipoZona, int numero) {
    String numFormateado = String.format("%02d", numero);  // 1 → "01", 10 → "10"
    return "ZON-" + tipoZona + "-" + numFormateado;
}
```

El número es **secuencial**: se cuenta cuántas zonas ya existen con `zonaRepositorio.count()` y se suma 1.

### Nombre de Espacio — `Zon-AUTO-01-001`

Se genera en `ServicioEspacio.crearEspacio()`:

```java
private String generarNombreEspacio(Zona zona, String tipoEspacio, int numeroEspacio) {
    // "Zonas" → "Zon" (primeras 3 letras del nombre de la zona)
    String prefijoZona = zona.getNombre().substring(0, 3);
    
    // Del código "ZON-VIP-01" extraemos "01"
    String numZona = extraerNumeroDeZona(zona.getCodigo());
    
    // El espacio número 1 dentro de su zona → "001"
    String numEspacio = String.format("%03d", numeroEspacio);
    
    return prefijoZona + "-" + tipoEspacio + "-" + numZona + "-" + numEspacio;
}
```

**Ejemplo completo:**
- Zona con nombre `"Zona Norte"` y código `"ZON-VIP-01"`
- Se crea el espacio #3 de tipo AUTO
- Resultado: `"Zon-AUTO-01-003"`

---

## Patrón del docente (estilo de programación)

El docente sigue este patrón consistente en todo el proyecto:

```
entidades/    → @Entity + @Table + Lombok (@Data @Builder @NoArgsConstructor @AllArgsConstructor)
dto/          → Request DTOs + validaciones Jakarta (@NotNull, @NotBlank, @Min, @Max)
response/     → Response DTOs + Lombok
repositorios/ → interfaces JpaRepository + métodos findBy + @Query para consultas complejas
servicios/
  interfaz/   → interface con los métodos del contrato
  impl/       → @Service que implements la interfaz, constructor con repositorios inyectados,
                métodos privados mapearAResponse() para convertir entidad → DTO
```

> [!IMPORTANT]
> El docente usa **inyección por constructor** (no `@Autowired` en campo), lo cual es la práctica recomendada por Spring:
> ```java
> public ServicioZona(ZonaRepositorio zonaRepositorio, EspacioRepositorio espacioRepositorio) {
>     this.zonaRepositorio = zonaRepositorio;
>     this.espacioRepositorio = espacioRepositorio;
> }
> ```
