# Informe de Análisis de Código — Backend & Frontend

## Table of Contents
1. [Lista corta de archivos problemáticos](#lista-corta-de-archivos-problemáticos)
2. [Observaciones transversales y patrones detectados](#observaciones-transversales-y-patrones-detectados)
3. [Sugerencias de refactorización (priorizadas)](#sugerencias-de-refactorización-priorizadas)
4. [Conclusión](#conclusión)

---

## 1. Lista corta de archivos problemáticos

| Archivo | Problema principal | Señales detectadas |
|----------|--------------------|--------------------|
| **app.ts** | "God file" (≈850 líneas) que mezcla UI, llamadas HTTP, parsing de respuestas del modelo y lógica de negocio. | Parsing y merge de respuestas LLM, validaciones, límites en fetches, normalización de datos y reglas en la UI en lugar de una capa de servicios. |
| **index.ts** (varias rutas) | Lógica de negocio incrustada en endpoints (prompts clínicos, merges, persistencia). | Prompts hardcodeados, fusión de sugerencias, llamadas directas a `upsertPatientIntake`. |
| **index.ts** (drugs) | Lógica duplicada entre rutas. | `buildDrugPrompt` y `genAI` invocados dentro del handler; duplicación de flujo `antecedents` / `allergies`. |
| **index.ts** (antecedents) | Misma familia de responsabilidades repetida. | Prompt hardcodeado, parseo y persistencia en el mismo handler. |
| **index.ts** (start) | Orquestación y generación de prompt clínico dentro de la ruta. | Validación y normalización mezcladas con construcción de texto y llamadas a GenAI. |
| **patient-intake-store.ts** | Responsabilidades mezcladas: persistencia + normalización + generación de keys. | `normalize*` y `upsert` conviven con `Map` global; mutaciones no encapsuladas. |
| **app.ts vs parse-string-array.ts** | Duplicación de lógica entre cliente y servidor. | `extractAntecedents` en cliente replica `parse-string-array.ts`; riesgo de inconsistencias. |
| **parse-string-array.ts** | Bien ubicado pero mal usado. | Su duplicación en cliente indica falta de capa compartida o frontera clara. |
| **client/components/** | Lógica excesiva en componentes de UI. | Transformaciones de listas y sets dentro del componente; alta dependencia del estado global en `app.ts`. |
| **server/routes/** | Violación transversal de separación de capas. | Prompts clínicos hardcodeados y repetidos; mismo flujo de parseo y persistencia en todas las rutas. |
| **genai.ts** | Uso inconsistente del cliente GenAI. | Cada ruta maneja retries y validaciones de respuesta por su cuenta. |
| **cors.ts** | Potencial sobrecarga futura en lógica de plugin. | Map/filter sobre configuración de orígenes; no crítico pero visible. |

---

## 2. Observaciones transversales y patrones detectados

### Lógica de negocio en capas erróneas
Los endpoints y la UI implementan reglas y validaciones clínicas (por ejemplo, límites de sugerencias, merges, deduplicación).  
Estas reglas deberían residir en una capa de dominio o en casos de uso dedicados.

### Duplicación
- Prompts clínicos similares en múltiples rutas.  
- Parseo y normalización de respuestas LLM duplicadas entre cliente y servidor.  
- Lógica de merge/dedupe repetida.

### Violación de separación de capas
Los controladores acceden directamente al store y al SDK de GenAI.  
Deberían orquestar las operaciones, no ejecutar reglas de negocio directamente.

### Estado global mutable
`patientIntakeStore` (un `Map` global) es mutado directamente desde múltiples rutas, sin interfaz ni control de concurrencia.

### “God file” en la UI
`app.ts` concentra demasiadas responsabilidades: renderizado, fetch, normalización, merge y lógica clínica.  
Esto dificulta el testing, mantenimiento y la extensión modular.

---

## 3. Sugerencias de refactorización (priorizadas)

### 1. Extraer la lógica de negocio a servicios o casos de uso
Crear una carpeta `services/` o `application/use-cases/` con métodos como:

```ts
suggestAntecedents()
suggestAllergies()
suggestDrugs()
saveSelections()
```

Los endpoints deben limitarse a parsear requests y delegar la orquestación a estas funciones.

---

### 2. Centralizar el acceso a GenAI
Crear un **adapter o servicio** que encapsule:
- Retries, timeouts y manejo de errores.  
- Parsing de respuestas LLM.  
- Validación y logging de prompts.

Ejemplo:

```ts
// infrastructure/ai/GenAIService.ts
class GenAIService {
  async generatePrompt(prompt: string): Promise<string[]> {
    try {
      const res = await client.generate(prompt);
      return parseResponse(res);
    } catch (e) {
      log.error("GenAI error", e);
      throw new AIServiceError();
    }
  }
}
```

---

### 3. Unificar parsing de arrays LLM
Mover la lógica de parsing a un único módulo backend (`shared/parsers/parseStringArray.ts`)  
y reutilizarlo desde cliente si es necesario (como paquete compartido).

---

### 4. Reducir responsabilidades en `app.ts`
Separar en:
- **Servicios:** llamadas HTTP y sincronización.  
- **Hooks:** gestión de estado local.  
- **Componentes:** render puro.

---

### 5. Encapsular el `patientIntakeStore`
Reemplazar el `Map` global por una interfaz `IIntakeRepository`:

```ts
interface IIntakeRepository {
  upsert(data: PatientIntake): Promise<void>;
  findById(id: string): Promise<PatientIntake | null>;
}
```

Esto permite controlar concurrencia, implementar tests unitarios y migrar a persistencia real sin reescribir lógica de negocio.

---

## 4. Conclusión

El proyecto presenta una base funcional sólida, pero con un alto nivel de acoplamiento entre capas y duplicación de lógica entre cliente y servidor.  
Una refactorización basada en principios de **Clean Architecture** permitiría mejorar:

- Mantenibilidad y escalabilidad.  
- Testabilidad por capas.  
- Reutilización limpia entre frontend y backend.  
- Claridad en las responsabilidades y límites de dominio.

---

**Elaborado por:** Auditoría Técnica  
**Fecha:** Octubre 2025  
**Tipo de informe:** Revisión arquitectónica y de calidad de código

