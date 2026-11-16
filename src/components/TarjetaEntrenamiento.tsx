/**
 * TarjetaEntrenamiento.tsx — Resumen de un entrenamiento terminado
 *
 * Se usa en Inicio ("Tus entrenamientos") y en el Historial completo.
 * Al presionarla abre el detalle: /historial/[id]
 */
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import type { EntrenamientoGuardado } from "@/hooks/useEntrenamientos";
import { formatearDuracion, formatearFecha } from "@/lib/utils";

export function TarjetaEntrenamiento({ entrenamiento }: { entrenamiento: EntrenamientoGuardado }) {
  const completo = entrenamiento.seriesCompletadas >= entrenamiento.seriesTotales;

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({ pathname: "/historial/[id]", params: { id: entrenamiento.id } })
      }
      className="mb-3 flex-row items-center rounded-2xl border border-neutral-200 bg-white p-4 active:bg-neutral-50"
    >
      <View
        className={`h-11 w-11 items-center justify-center rounded-xl ${
          completo ? "bg-green-100" : "bg-orange-100"
        }`}
      >
        <Ionicons
          name={completo ? "trophy-outline" : "barbell-outline"}
          size={22}
          color={completo ? "#15803D" : "#EA580C"}
        />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-base font-bold text-neutral-900" numberOfLines={1}>
          {entrenamiento.rutinaNombre}
        </Text>
        <Text className="mt-0.5 text-xs text-neutral-500">
          {formatearFecha(entrenamiento.fecha)} · {formatearDuracion(entrenamiento.duracionSegundos)}{" "}
          · {entrenamiento.seriesCompletadas}/{entrenamiento.seriesTotales} series
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}
