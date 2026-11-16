/**
 * dialogos.ts — Avisos y confirmaciones multiplataforma
 *
 * En Android/iOS se usa Alert.alert (diálogo nativo).
 * En web (navegador / Docker) Alert.alert de React Native NO muestra nada,
 * así que se usa window.alert / window.confirm del navegador.
 */
import { Alert, Platform } from "react-native";

/** Muestra un aviso informativo con un solo botón "OK". */
export function avisar(titulo: string, mensaje: string) {
  if (Platform.OS === "web") {
    window.alert(`${titulo}\n\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje);
}

/**
 * Pide confirmación antes de una acción.
 * `alConfirmar` solo se ejecuta si el usuario acepta.
 */
export function confirmar(opciones: {
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  destructivo?: boolean;
  alConfirmar: () => void;
}) {
  const { titulo, mensaje, textoConfirmar, destructivo, alConfirmar } = opciones;

  if (Platform.OS === "web") {
    if (window.confirm(`${titulo}\n\n${mensaje}`)) alConfirmar();
    return;
  }

  Alert.alert(titulo, mensaje, [
    { text: "Cancelar", style: "cancel" },
    {
      text: textoConfirmar,
      style: destructivo ? "destructive" : "default",
      onPress: alConfirmar,
    },
  ]);
}
