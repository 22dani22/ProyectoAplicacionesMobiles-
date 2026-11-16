/**
 * utils.ts — Utilidades compartidas
 */

export const MAX_NOMBRE_PERSONA = 60;
export const MAX_NOMBRE_RUTINA = 60;
export const MAX_NOMBRE_ALIMENTO = 80;

/** Limpia espacios y valida longitud sin limitar alfabetos ni puntuación. */
export function validarNombre(
  texto: string,
  etiqueta: string,
  maximo: number
): { valor: string; error: string | null } {
  const valor = texto.trim().replace(/\s+/g, " ");
  const cantidadCaracteres = Array.from(valor).length;
  const nombreEtiqueta = etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1);

  if (!valor) {
    return { valor, error: `Ingresa ${etiqueta}.` };
  }

  if (cantidadCaracteres > maximo) {
    return { valor, error: `${nombreEtiqueta} admite un máximo de ${maximo} caracteres.` };
  }

  return { valor, error: null };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERIES: límites y validación de peso / repeticiones
// Se usan en el modal de rutinas, en el entrenamiento en curso
// y otra vez en los hooks justo antes de guardar en Firestore.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const PESO_MAX = 500; // kg
export const REPS_MIN = 1;
export const REPS_MAX = 100;
export const MAX_SERIES_POR_EJERCICIO = 20;
export const MAX_EJERCICIOS_POR_RUTINA = 30;

/** Deja solo dígitos (para repeticiones). "1a2" → "12" */
export function limpiarEntero(texto: string): string {
  return texto.replace(/\D/g, "");
}

/**
 * Deja solo dígitos y UN punto decimal con máximo 1 decimal (para el peso).
 * Acepta coma como separador: "22,5" → "22.5". "2x0.55" → "20.5"
 */
export function limpiarDecimal(texto: string): string {
  const soloValidos = texto.replace(/,/g, ".").replace(/[^\d.]/g, "");
  const [entero, ...resto] = soloValidos.split(".");
  if (resto.length === 0) return entero;
  return `${entero}.${resto.join("").slice(0, 1)}`;
}

/** Texto del campo → número. Vacío → NaN (se marca como inválido). */
export function textoANumero(texto: string): number {
  return texto === "" || texto === "." ? NaN : Number(texto);
}

/** Peso válido: 0 a 500 kg con máximo 1 decimal (0 = peso corporal). */
export function pesoValido(peso: number): boolean {
  return (
    Number.isFinite(peso) &&
    peso >= 0 &&
    peso <= PESO_MAX &&
    Math.abs(Math.round(peso * 10) - peso * 10) < 1e-9
  );
}

/** Repeticiones válidas: entero de 1 a 100. */
export function repsValidas(repeticiones: number): boolean {
  return (
    Number.isInteger(repeticiones) && repeticiones >= REPS_MIN && repeticiones <= REPS_MAX
  );
}

/**
 * Revisa todos los ejercicios y series. Devuelve el primer error encontrado
 * (mensaje listo para mostrar) o null si todo está bien.
 */
export function validarEjercicios(
  ejercicios: { nombre: string; series: { numeroSerie: number; peso: number; repeticiones: number }[] }[]
): string | null {
  if (ejercicios.length > MAX_EJERCICIOS_POR_RUTINA) {
    return `Una rutina admite un máximo de ${MAX_EJERCICIOS_POR_RUTINA} ejercicios.`;
  }
  for (const ej of ejercicios) {
    if (ej.series.length > MAX_SERIES_POR_EJERCICIO) {
      return `"${ej.nombre}" supera el máximo de ${MAX_SERIES_POR_EJERCICIO} series.`;
    }
    for (const s of ej.series) {
      if (!pesoValido(s.peso)) {
        return `"${ej.nombre}", serie ${s.numeroSerie}: el peso debe estar entre 0 y ${PESO_MAX} kg (máximo 1 decimal).`;
      }
      if (!repsValidas(s.repeticiones)) {
        return `"${ej.nombre}", serie ${s.numeroSerie}: las repeticiones deben ser un número entero entre ${REPS_MIN} y ${REPS_MAX}.`;
      }
    }
  }
  return null;
}

/** Segundos → "mm:ss" o "h:mm:ss" (cronómetro). */
export function formatearCronometro(totalSegundos: number): string {
  const h = Math.floor(totalSegundos / 3600);
  const m = Math.floor((totalSegundos % 3600) / 60);
  const s = totalSegundos % 60;
  const mmss = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
}

/** Segundos → texto corto: "45 s", "12 min", "1 h 5 min". */
export function formatearDuracion(totalSegundos: number): string {
  if (totalSegundos < 60) return `${totalSegundos} s`;
  const h = Math.floor(totalSegundos / 3600);
  const m = Math.floor((totalSegundos % 3600) / 60);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-11-15" → "Hoy" o "15 nov 2026". */
export function formatearFecha(fecha: string): string {
  if (fecha === fechaHoy()) return "Hoy";
  const [anio, mes, dia] = fecha.split("-").map(Number);
  if (!anio || !mes || !dia) return fecha;
  return `${dia} ${MESES[mes - 1]} ${anio}`;
}

/** Fecha LOCAL de hoy en formato YYYY-MM-DD (no UTC, para no saltar de día por la noche). */
export function fechaHoy(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Traduce los códigos de error de Firebase a mensajes en español. */
export function mensajeErrorFirebase(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/email-already-in-use":
      return "Ese correo ya está registrado.";
    case "auth/invalid-email":
      return "El correo no tiene un formato válido.";
    case "auth/missing-password":
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Correo o contraseña incorrectos.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.";
    case "auth/network-request-failed":
    case "unavailable":
      return "Sin conexión a internet. Revisa tu red.";
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
      return "Firebase no está configurado: revisa el archivo .env.";
    case "permission-denied":
      return "Sin permiso. Revisa las reglas de seguridad de Firestore.";
    default:
      return (error as Error)?.message ?? "Ocurrió un error inesperado.";
  }
}
