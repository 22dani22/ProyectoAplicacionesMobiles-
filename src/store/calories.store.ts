/**
 * calories.store.ts — Modelos de Datos para el Contador de Calorías
 *
 * 📌 ¿QUÉ HAY AQUÍ?
 * - El tipo TipoComida: define las categorías de comida permitidas
 * - La interfaz Alimento: forma de cada registro de comida
 * - alimentosIniciales: datos de ejemplo que se muestran al arrancar la app
 *
 * 📌 ¿CÓMO SE USA?
 * En progreso.tsx se importa `alimentosIniciales` y se pasa al useState:
 *
 *   const [alimentos, setAlimentos] = useState<Alimento[]>(alimentosIniciales);
 *
 * Desde ahí, setAlimentos actualiza la lista cuando el usuario
 * agrega o elimina alimentos.
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TIPO: TipoComida
// Un "type" en TypeScript limita los valores posibles a una lista fija.
// Solo se puede asignar uno de estos 4 valores a TipoComida.
// Esto previene errores de escritura (typos) en el código.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type TipoComida = "Desayuno" | "Almuerzo" | "Cena" | "Snack";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFAZ: Alimento
// Representa un alimento registrado por el usuario en el día.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface Alimento {
  id: string;               // Identificador único (se genera con Date.now())
  nombre: string;           // Nombre del alimento: "Avena con plátano"
  calorias: number;         // Cantidad de kcal estimadas
  tipoComida: TipoComida;   // Momento del día: "Desayuno", "Almuerzo", etc.
  hora: string;             // Hora de registro en formato "HH:MM" (ej: "08:30")
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DATOS INICIALES
// Son los alimentos que aparecen al abrir la pantalla de Calorías
// por primera vez. Útil para que la pantalla no luzca vacía.
//
// Para empezar sin datos de ejemplo: export const alimentosIniciales: Alimento[] = [];
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const alimentosIniciales: Alimento[] = [
  {
    id: "alim-1",
    nombre: "Avena con leche y plátano",
    calorias: 380,
    tipoComida: "Desayuno",
    hora: "08:30",
  },
  {
    id: "alim-2",
    nombre: "Pechuga de pollo a la plancha con arroz",
    calorias: 550,
    tipoComida: "Almuerzo",
    hora: "13:45",
  },
  {
    id: "alim-3",
    nombre: "Manzana con crema de cacahuate",
    calorias: 190,
    tipoComida: "Snack",
    hora: "17:00",
  },
];
