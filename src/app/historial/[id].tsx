/**
 * historial/[id].tsx — Detalle de un entrenamiento terminado
 *
 * Muestra la rutina, fecha, duración y cada ejercicio con sus series:
 * las completadas en verde (✓) y las no realizadas en gris.
 */
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { useEntrenamientos } from "@/hooks/useEntrenamientos";
import { obtenerImagenEjercicio } from "@/store/exercises.store";
import { formatearDuracion, formatearFecha } from "@/lib/utils";

export default function PantallaDetalleEntrenamiento() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { entrenamientos, cargando } = useEntrenamientos(user?.uid);

  const entrenamiento = entrenamientos.find((e) => e.id === id);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      {/* CABECERA con botón volver */}
      <View className="flex-row items-center border-b border-neutral-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-2 p-1">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-black text-neutral-900" numberOfLines={1}>
          {entrenamiento?.rutinaNombre ?? "Entrenamiento"}
        </Text>
      </View>

      {cargando ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : !entrenamiento ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="alert-circle-outline" size={40} color="#9CA3AF" />
          <Text className="mt-3 text-center text-lg font-bold text-neutral-800">
            No se encontró el entrenamiento
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {/* RESUMEN: fecha, duración y series */}
          <View className="mb-4 flex-row">
            <Resumen icono="calendar-outline" valor={formatearFecha(entrenamiento.fecha)} etiqueta="Fecha" />
            <Resumen
              icono="time-outline"
              valor={formatearDuracion(entrenamiento.duracionSegundos)}
              etiqueta="Duración"
            />
            <Resumen
              icono="checkmark-done-outline"
              valor={`${entrenamiento.seriesCompletadas}/${entrenamiento.seriesTotales}`}
              etiqueta="Series"
            />
          </View>

          {/* EJERCICIOS */}
          {entrenamiento.ejercicios.map((ej, indice) => {
            const imagen = obtenerImagenEjercicio(ej.catalogoId ?? undefined);
            return (
              <View
                key={`${ej.nombre}-${indice}`}
                className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <View className="mb-3 flex-row items-center">
                  {imagen ? (
                    <Image
                      source={imagen}
                      style={{ width: 40, height: 40, borderRadius: 10 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                      <Ionicons name="barbell-outline" size={20} color="#EA580C" />
                    </View>
                  )}
                  <Text className="ml-3 flex-1 text-base font-bold text-neutral-900" numberOfLines={1}>
                    {ej.nombre}
                  </Text>
                </View>

                {ej.series.map((s) => (
                  <View
                    key={s.numeroSerie}
                    className={`mb-1.5 flex-row items-center rounded-xl px-3 py-2 ${
                      s.completada ? "bg-green-100" : "bg-neutral-100"
                    }`}
                  >
                    <Text
                      className={`w-20 font-bold ${s.completada ? "text-green-700" : "text-neutral-400"}`}
                    >
                      Serie {s.numeroSerie}
                    </Text>
                    <Text
                      className={`flex-1 font-semibold ${
                        s.completada ? "text-green-800" : "text-neutral-400 line-through"
                      }`}
                    >
                      {s.peso} kg × {s.repeticiones} reps
                    </Text>
                    <Ionicons
                      name={s.completada ? "checkmark-circle" : "close-circle-outline"}
                      size={20}
                      color={s.completada ? "#16A34A" : "#9CA3AF"}
                    />
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/** Cuadro pequeño del resumen (ícono + valor + etiqueta) */
function Resumen({
  icono,
  valor,
  etiqueta,
}: {
  icono: React.ComponentProps<typeof Ionicons>["name"];
  valor: string;
  etiqueta: string;
}) {
  return (
    <View className="mx-1 flex-1 items-center rounded-2xl border border-neutral-200 bg-white p-3">
      <Ionicons name={icono} size={20} color="#EA580C" />
      <Text className="mt-1 text-base font-black text-neutral-900" numberOfLines={1}>
        {valor}
      </Text>
      <Text className="text-xs text-neutral-500">{etiqueta}</Text>
    </View>
  );
}
