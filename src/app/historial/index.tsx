/**
 * historial/index.tsx — Historial completo de entrenamientos
 *
 * Lista todos los entrenamientos terminados del usuario
 * (users/{uid}/entrenamientos), del más reciente al más antiguo.
 * Se abre desde Inicio → "Tus entrenamientos" → "Ver todos".
 */
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { useEntrenamientos } from "@/hooks/useEntrenamientos";
import { TarjetaEntrenamiento } from "@/components/TarjetaEntrenamiento";
import { mensajeErrorFirebase } from "@/lib/utils";

export default function PantallaHistorial() {
  const { user } = useAuth();
  const { entrenamientos, cargando, error } = useEntrenamientos(user?.uid);

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      {/* CABECERA con botón volver */}
      <View className="flex-row items-center border-b border-neutral-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-2 p-1">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-neutral-900">Tus entrenamientos</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {cargando && (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        )}

        {!cargando && error ? (
          <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <Text className="font-bold text-red-700">No se pudo cargar el historial</Text>
            <Text className="mt-1 text-sm text-red-600">{mensajeErrorFirebase(error)}</Text>
          </View>
        ) : null}

        {!cargando && !error && entrenamientos.length === 0 && (
          <View className="items-center rounded-2xl border border-dashed border-neutral-300 bg-white p-8">
            <Ionicons name="calendar-outline" size={28} color="#EA580C" />
            <Text className="mt-2 text-center font-bold text-neutral-800">
              Aún no has terminado entrenamientos
            </Text>
            <Text className="mt-1 text-center text-sm text-neutral-500">
              Empieza una rutina desde Entrenos y finalízala para verla aquí.
            </Text>
          </View>
        )}

        {!cargando && entrenamientos.length > 0 && (
          <Text className="mb-3 text-sm font-semibold text-neutral-500">
            {entrenamientos.length}{" "}
            {entrenamientos.length === 1 ? "entrenamiento" : "entrenamientos"}
          </Text>
        )}

        {entrenamientos.map((e) => (
          <TarjetaEntrenamiento key={e.id} entrenamiento={e} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
