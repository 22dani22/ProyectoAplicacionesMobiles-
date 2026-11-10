/**
 * routines.store.ts — Modelos de Datos para Rutinas
 *
 * 📌 ¿QUÉ ES UN "STORE"?
 * Un store (almacén) en esta app guarda:
 *   1. Los tipos de datos (interfaces TypeScript)
 *   2. Los datos iniciales (listas de ejemplo)
 *
 * Los datos se guardan en Firebase Firestore (ver src/hooks/useRutinas.ts).
 * El store solo define las "formas" de los datos.
 *
 * 📌 ESTRUCTURA DE DATOS (Anidada)
 *
 *   Rutina
 *   ├── id, nombre, fechaCreacion
 *   └── ejercicios: Ejercicio[]
 *       ├── id, nombre, detalle, imagen
 *       └── series: Serie[]
 *           └── id, numeroSerie, peso, repeticiones
 *
 * Cada Rutina tiene varios Ejercicios, y cada Ejercicio tiene varias Series.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFAZ: Serie
// Representa UNA fila en la tabla de series de un ejercicio.
// Ejemplo: "Serie 1 → 20kg × 10 repeticiones"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface Serie {
  id: string;          // Identificador único (se genera con Date.now())
  numeroSerie: number; // Número de serie (1, 2, 3...)
  peso: number;        // Peso en kg
  repeticiones: number; // Cantidad de repeticiones
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFAZ: Ejercicio
// Representa un ejercicio dentro de una rutina.
// Un ejercicio puede tener múltiples series.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface Ejercicio {
  id: string;          // Identificador único
  nombre: string;      // Nombre del ejercicio: "Sentadilla con Barra"
  detalle?: string;    // Descripción técnica (opcional, el "?" lo hace opcional)
  // ID del ejercicio en el catálogo (exercises.store.ts).
  // La imagen NO se guarda en Firestore (un require() no es serializable):
  // se obtiene al mostrarla con obtenerImagenEjercicio(catalogoId).
  catalogoId?: string;
  series: Serie[];     // Lista de series (arreglo de Serie)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFAZ: Rutina
// Representa una rutina de entrenamiento completa.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface Rutina {
  id: string;              // Identificador único
  nombre: string;          // Nombre de la rutina: "Pierna Intensa"
  ejercicios: Ejercicio[]; // Lista de ejercicios en la rutina
  fechaCreacion?: string;  // Fecha de creación (opcional, no se usa aún)
}

// Las rutinas se guardan en Firestore: users/{uid}/rutinas/{rutinaId}
// Ver src/hooks/useRutinas.ts
