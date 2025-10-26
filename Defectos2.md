# Informe Técnico de Análisis Arquitectónico y de Calidad de Código

## Table of Contents
1. [Diagnóstico general](#diagnóstico-general)
2. [Ejemplos concretos de desprolijidad](#ejemplos-concretos-de-desprolijidad)
3. [Propuestas prácticas de mejora (priorizadas)](#propuestas-prácticas-de-mejora-priorizadas)
4. [Cierre / Prioridad inmediata sugerida](#cierre--prioridad-inmediata-sugerida)

---

## Diagnóstico general

### Resumen ejecutivo
La aplicación está dividida en cliente **Angular (SPA)** y servidor **Fastify/TypeScript**.  
A simple vista hay separaciones físicas (carpetas `client` y `server`) pero, arquitectónicamente, el código muestra mezcla de responsabilidades y hábitos que dificultan el mantenimiento y las pruebas.

### Capas actuales observadas

- **Presentación (UI):** `client/src/*` — componentes y la mayor parte del estado UI.  
- **Aplicación / Endpoints HTTP:** `server/src/routes/*` — handlers Fastify que exponen lógica vía HTTP.  
- **Persistencia ligera:** `patient-intake-store.ts` (Map in-memory).  
- **Infraestructura:** `server/src/plugins/*` (GenAI, CORS, etc.) y utilidades en `server/src/utils/*`.

### Separación por capas
Parcialmente lograda. La estructura sugiere capas, pero las responsabilidades se mezclan dentro de las rutas y del cliente.  
No hay una capa clara de dominio o casos de uso que centralice reglas de negocio.

### Estado de coherencia y estilo
- Lógica de negocio repetida en múltiples rutas.  
- Código duplicado entre backend y frontend (ej. parsing de respuestas LLM).  
- “God file” en cliente (`app.ts`, ~850 líneas).  
- Naming consistente, pero con nombres genéricos como `patient-intake-store.ts` o `parse-string-array.ts`.

### Testabilidad y mantenibilidad
- Testabilidad reducida por lógica inline en endpoints y componentes.  
- Dificultad de testing unitario sin levantar infra.  
- Mantenibilidad baja-moderada: flujo repetido (`normalize → build prompt → call GenAI → parse → merge → upsert`).

### Conclusión del diagnóstico
La arquitectura física existe, pero la **separación lógica es débil**.  
Controladores y UI contienen reglas de negocio y orquestación directa de IA/persistencia.  
Duplicación, acoplamiento fuerte y riesgo de inconsistencias.

---

## Ejemplos concretos de desprolijidad

| Archivo | Descripción | Problema |
|----------|--------------|-----------|
| `index.ts` | Handler POST (líneas ~40–110) | Construcción de prompt clínico y llamada directa a GenAI; mezcla validación, normalización y parsing. |
| `index.ts` (drugs) | `buildDrugPrompt` dentro del handler (~líneas 1–120) | Duplicación respecto a allergies y antecedents; mismo flujo repetido. |
| `index.ts` (antecedents) | Similar a drugs y allergies | Prompt hardcodeado, parseo y persistencia en el mismo handler. |
| `patient-intake-store.ts` | Define `Map` global + normalizadores + `upsertPatientIntake` | Mezcla persistencia con lógica de dominio. Sin interfaz Repository. |
| `app.ts` | 850+ líneas | “God file”: UI, parsing, dedupe, merges, llamadas HTTP duplicadas con el servidor. |
| `parse-string-array.ts` vs `extractAntecedents()` | Duplicación de parsing entre cliente y servidor | Riesgo de inconsistencia entre entornos. |
| `genai.ts` | Cliente GenAI directo | Falta de Adapter o servicio que centralice retries, errores y validación. |
| `cors.ts` | Configuración base correcta | Riesgo en defaults si falta variable `CORS_ALLOWED_ORIGINS`. |

### Resumen de ejemplos
- Controladores con múltiples responsabilidades (validación, prompts, persistencia).  
- Duplicación cliente/servidor.  
- Estado global sin abstracción (`Map` mutable).  
- Archivos extensos y rutas redundantes.

---

## Propuestas prácticas de mejora (priorizadas)

### Prioridad alta

#### 1. Extraer un Adapter de GenAI (`server/src/services/genai-adapter.ts`)
Encapsula SDK, validación, timeouts y retries.

**Snippet:**
```ts
export class GenAIAdapter {
  async generate(prompt: string) {
    try {
      const res = await fastify.genAIClient.models.generateContent(prompt);
      return res.text();
    } catch (err) {
      console.error("GenAIAdapter error", err);
      throw new Error("AI call failed");
    }
  }
}
```

**Beneficio:** centraliza errores, desacopla SDK del dominio.

---

#### 2. Mover parsing al backend
Usar `parse-string-array.ts` como fuente única de verdad.  
El cliente debe recibir arrays ya procesados (`string[]`).

**Beneficio:** elimina duplicación, simplifica cliente, evita divergencias.

---

#### 3. Crear capa de servicios / casos de uso (`patient-intake-service.ts`)
Encapsular flujo completo:
```ts
class PatientIntakeService {
  constructor(private genai: GenAIAdapter, private repo: PatientIntakeRepository) {}

  async suggestAntecedents(payload) {
    const parsed = await this.genai.generatePrompt(payload);
    return this.repo.mergeAntecedents(parsed);
  }
}
```

**Beneficio:** endpoints delegan lógica, mayor testabilidad.

---

### Prioridad media

#### 4. Encapsular `patient-intake-store.ts`
Crear:
- `PatientIntakeRepository` (interface)
- `InMemoryPatientIntakeRepository` (implementación)
- Separar normalizadores (`server/src/domain/normalizers.ts`)

**Beneficio:** facilita persistencia real y tests de integración.

---

#### 5. Refactor de rutas
Controllers deben limitarse a:
1. Validar inputs.
2. Llamar al servicio.
3. Mapear a response.

Mover prompts a `server/src/prompts/` y reusar funciones comunes.

---

#### 6. Reducir `app.ts`
Extraer lógica a servicios Angular:
- `patient-intake.service.ts`: HTTP + estado.
- Reducir `app.ts` a renderización y bindings.

**Beneficio:** mejora legibilidad y reduce acoplamiento.

---

### Prioridad baja

#### 7. Tipado y contratos consistentes
Sincronizar tipos TS entre front y back.  
Eliminar campos innecesarios como `model` en UI.

#### 8. Tests unitarios
- `parse-string-array`
- `normalizeStringList`
- `GenAIAdapter` (mock SDK)

#### 9. Logging / observabilidad
Normalizar logs, agregar métricas (latencia, errores).

#### 10. Seguridad / configuración
- `.env` fuera del repo.  
- Sanitización de inputs de prompt.

---

## Plan de acción sugerido

| Sprint | Acciones | Objetivo |
|---------|-----------|-----------|
| **Día 1** | Extraer `GenAIAdapter`, unificar parse en `parse-string-array.ts`. | Reducir duplicación y centralizar IA. |
| **Día 2–3** | Crear `PatientIntakeService`, `PatientIntakeRepository`, refactorizar 1 ruta (antecedents). | Mejor separación de capas. |
| **Día 4+** | Refactor cliente Angular (`patient-intake.service.ts`, reducción de `app.ts`). | Simplificación UI y consistencia. |

---

## Cierre / Prioridad inmediata sugerida
1. Extraer **GenAIAdapter**.  
2. Unificar parsing en servidor.  
3. Crear **PatientIntakeService** y migrar orquestación.  
4. Refactor mínimo en cliente (servicio Angular).  

**Resultado esperado:** backend modular, duplicación reducida y cliente más limpio.

---

**Autor:** Auditoría Técnica  
**Fecha:** Octubre 2025  
**Tipo de informe:** Evaluación arquitectónica y recomendaciones prácticas

