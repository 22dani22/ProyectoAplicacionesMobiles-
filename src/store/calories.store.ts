/**
 * calories.store.ts — Modelos de Datos para el Contador de Calorías
 *
 * Los alimentos se guardan en Firestore: users/{uid}/alimentos/{alimentoId}
 * Cada alimento lleva su `fecha` (YYYY-MM-DD local) para consultar solo los de hoy.
 * Ver src/hooks/useAlimentos.ts
 */

// Un "type" en TypeScript limita los valores posibles a una lista fija.
export type TipoComida = "Desayuno" | "Almuerzo" | "Cena" | "Snack";

// Representa un alimento registrado por el usuario en un día.
export interface Alimento {
  id: string;               // ID del documento en Firestore
  nombre: string;           // Nombre del alimento: "Avena con plátano"
  calorias: number;         // Cantidad de kcal estimadas
  tipoComida: TipoComida;   // Momento del día: "Desayuno", "Almuerzo", etc.
  hora: string;             // Hora de registro en formato "HH:MM" (ej: "08:30")
  fecha: string;            // Día del registro "YYYY-MM-DD" (hora local)
  creadoEn: number;         // Date.now() al crearlo, para ordenar
}
