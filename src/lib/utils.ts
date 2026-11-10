/**
 * utils.ts — Utilidades compartidas
 */

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
