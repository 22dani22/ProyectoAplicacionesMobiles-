/**
 * CampoNumero.tsx — Campo de texto que SOLO acepta números
 *
 * Se usa para el peso (con 1 decimal) y las repeticiones (enteros).
 *
 * 📌 DOBLE PROTECCIÓN
 *   1. keyboardType abre el teclado numérico en el celular.
 *   2. Cada vez que cambia el texto se eliminan los caracteres no numéricos.
 *      Esto es necesario en web o con teclado físico, donde sí se pueden
 *      escribir letras aunque el keyboardType sea numérico.
 *
 * 📌 ¿POR QUÉ GUARDA SU PROPIO TEXTO?
 * Si el campo mostrara directamente el número, al escribir "22." el punto
 * desaparecería (Number("22.") = 22). Por eso se guarda el texto tal cual
 * se escribe y al padre se le entrega el número ya convertido.
 */
import React, { useState } from "react";
import { TextInput } from "react-native";

import { limpiarDecimal, limpiarEntero, textoANumero } from "@/lib/utils";

interface PropiedadesCampoNumero {
  valor: number;                    // Valor inicial (NaN = vacío)
  decimal?: boolean;                // true = peso (1 decimal), false = reps (entero)
  invalido?: boolean;               // true = borde rojo
  alCambiar: (valor: number) => void; // Recibe el número (NaN si quedó vacío)
  className?: string;
}

export function CampoNumero({
  valor,
  decimal = false,
  invalido = false,
  alCambiar,
  className = "",
}: PropiedadesCampoNumero) {
  const [texto, setTexto] = useState(() => (Number.isFinite(valor) ? String(valor) : ""));

  const manejarCambio = (nuevoTexto: string) => {
    const limpio = decimal ? limpiarDecimal(nuevoTexto) : limpiarEntero(nuevoTexto);
    setTexto(limpio);
    alCambiar(textoANumero(limpio));
  };

  return (
    <TextInput
      value={texto}
      onChangeText={manejarCambio}
      keyboardType={decimal ? "decimal-pad" : "number-pad"}
      inputMode={decimal ? "decimal" : "numeric"} // Teclado numérico también en web
      maxLength={decimal ? 5 : 3} // "500.0" / "100"
      placeholder="0"
      placeholderTextColor="#9CA3AF"
      selectTextOnFocus
      className={`rounded-lg border px-2 py-1.5 text-center text-sm font-bold text-neutral-900 ${
        invalido ? "border-red-500 bg-red-50" : "border-neutral-200 bg-white"
      } ${className}`}
    />
  );
}
