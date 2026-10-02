/**
 * exercises.store.ts — Catálogo de Ejercicios Disponibles
 *
 * 📌 ¿QUÉ HAY AQUÍ?
 * El catálogo de ejercicios que el usuario puede agregar a sus rutinas.
 * Cada ejercicio tiene una imagen local que se carga con `require()`.
 *
 * 📌 ¿CÓMO SE USA?
 * En ExercisePickerModal.tsx se importa `catalogoEjercicios` y se
 * muestra en una lista con imagen, nombre y detalle.
 * Al seleccionar uno, se agrega a la rutina en RoutineModal.tsx.
 *
 * 📌 ¿CÓMO AGREGAR UN NUEVO EJERCICIO?
 * 1. Pon la imagen en: `assets/images/exercises/mi_ejercicio.jpg`
 * 2. Agrega un objeto al arreglo `catalogoEjercicios`:
 *
 *   {
 *     id: "ej-mi-ejercicio",        // ID único con prefijo "ej-"
 *     nombre: "Mi Ejercicio",
 *     detalle: "Descripción breve de la técnica.",
 *     imagen: require("@/assets/images/exercises/mi_ejercicio.jpg"),
 *   }
 *
 * 📌 ¿QUÉ ES `require()`?
 * Es la forma de importar imágenes locales en React Native.
 * El "@/" es un alias que apunta a la raíz del proyecto (`src/`),
 * configurado en tsconfig.json como "paths": { "@/*": ["./src/*"] }
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INTERFAZ: EjercicioCatalogo
// Define la forma de cada ejercicio en el catálogo.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface EjercicioCatalogo {
  id: string;     // Identificador único: "ej-sentadilla-barra"
  nombre: string; // Nombre visible: "Sentadilla con Barra"
  detalle: string; // Descripción técnica del ejercicio
  imagen: any;    // Imagen local cargada con require() — `any` porque React Native lo requiere
}

/**
 * CATÁLOGO COMPLETO DE EJERCICIOS
 * Arreglo que se muestra en el selector de ejercicios (ExercisePickerModal).
 */
export const catalogoEjercicios: EjercicioCatalogo[] = [
  {
    id: "ej-remo-barra",
    nombre: "Remo con Barra",
    // Descripción técnica del movimiento — aparece como subtítulo en la tarjeta
    detalle: "Ejercicio compuesto para espalda media, dorsales y trapecios. Mantén la espalda recta a 45°.",
    // require() carga la imagen en tiempo de compilación (bundle time)
    // El path "@/" apunta a src/ gracias al alias en tsconfig.json
    imagen: require("@/assets/images/exercises/Remo_con_barra.jpg"),
  },
  {
    id: "ej-curl-biceps-barra-z",
    nombre: "Curl de Bíceps Barra Z",
    detalle: "Aislamiento para bíceps braquial. La barra Z previene la sobrecarga en muñecas y antebrazos.",
    imagen: require("@/assets/images/exercises/cur_de_biceps_barra_z.jpg"),
  },
  {
    id: "ej-jalon-pecho",
    nombre: "Jalón al Pecho",
    detalle: "Tracción en polea alta para amplitud dorsal. Lleva la barra controlado hacia la parte superior del pecho.",
    imagen: require("@/assets/images/exercises/jalon_al_pecho.jpg"),
  },
  {
    id: "ej-sentadilla-barra",
    nombre: "Sentadilla con Barra",
    detalle: "Fuerza integral de piernas y glúteos. Mantén rodillas alineadas con la punta de los pies y pecho erguido.",
    imagen: require("@/assets/images/exercises/sentadilla_con_barra.jpg"),
  },
  {
    id: "ej-sentadilla-libre",
    nombre: "Sentadilla Libre",
    detalle: "Movimiento funcional de cuádriceps y movilidad sin cargas pesadas. Ideal para calentamiento y técnica.",
    imagen: require("@/assets/images/exercises/sentadilla_libre.jpg"),
  },
];
