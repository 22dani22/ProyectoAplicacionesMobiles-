/**
 * index.tsx — Inicio: resumen real del día del usuario
 *
 * Muestra el saludo con el nombre, las calorías de hoy frente a la meta
 * y las rutinas guardadas en Firestore.
 */
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { useRutinas } from "@/hooks/useRutinas";
import { useAlimentos } from "@/hooks/useAlimentos";
import { fechaHoy } from "@/lib/utils";

export default function InicioScreen() {
  const { user, perfil } = useAuth();
  const [hoy] = useState(fechaHoy);
  const { rutinas } = useRutinas(user?.uid);
  const { totalCalorias, alimentos } = useAlimentos(user?.uid, hoy);

  const meta = perfil?.metaCalorias ?? 2000;
  const porcentaje = Math.min(100, Math.round((totalCalorias / meta) * 100));
  const restantes = Math.max(0, meta - totalCalorias);
  const nombre = (perfil?.nombre ?? user?.displayName ?? "").split(" ")[0];
  const rutinaDestacada = rutinas[0];

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top", "left", "right"]}>
      <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            FitPulse
          </Text>
          <Text className="text-3xl font-extrabold text-neutral-900">
            ¡Hola{nombre ? `, ${nombre}` : ""}! 👋
          </Text>
          <Text className="mt-1 text-base text-neutral-500">
            ¿Listo para tu entrenamiento de hoy?
          </Text>
        </View>

        {/* Tarjeta calorías de hoy */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/progreso")}
          className="mb-6 rounded-2xl bg-orange-500 p-5 shadow-sm"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-white/90">Calorías de hoy</Text>
            <Ionicons name="flame" size={20} color="#FFFFFF" />
          </View>
          <Text className="mt-1 text-2xl font-bold text-white">
            {totalCalorias} / {meta} kcal
          </Text>
          <View className="mt-4 h-2 w-full rounded-full bg-white/30">
            <View className="h-2 rounded-full bg-white" style={{ width: `${porcentaje}%` }} />
          </View>
          <Text className="mt-2 text-xs font-semibold text-white/90">
            {totalCalorias > meta
              ? `Te pasaste ${totalCalorias - meta} kcal`
              : `Te quedan ${restantes} kcal · ${alimentos.length} alimentos registrados`}
          </Text>
        </TouchableOpacity>

        {/* Estadísticas rápidas */}
        <View className="mb-6 flex-row">
          <View className="mr-2 flex-1 rounded-2xl border border-neutral-200 bg-white p-4">
            <Ionicons name="barbell-outline" size={22} color="#EA580C" />
            <Text className="mt-2 text-2xl font-black text-neutral-900">{rutinas.length}</Text>
            <Text className="text-xs font-medium text-neutral-500">Rutinas guardadas</Text>
          </View>
          <View className="ml-2 flex-1 rounded-2xl border border-neutral-200 bg-white p-4">
            <Ionicons name="pie-chart-outline" size={22} color="#EA580C" />
            <Text className="mt-2 text-2xl font-black text-neutral-900">{porcentaje}%</Text>
            <Text className="text-xs font-medium text-neutral-500">De tu meta diaria</Text>
          </View>
        </View>

        {/* Rutina destacada */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-bold text-neutral-800">Tu última rutina</Text>
          {rutinaDestacada ? (
            <TouchableOpacity
              onPress={() => router.push("/entrenos")}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <Text className="text-base font-bold text-neutral-900">{rutinaDestacada.nombre}</Text>
              <Text className="mt-1 text-sm text-neutral-500">
                {rutinaDestacada.ejercicios.length} ejercicios ·{" "}
                {rutinaDestacada.ejercicios.reduce((acc, ej) => acc + ej.series.length, 0)} series
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/entrenos")}
              className="items-center rounded-xl border border-dashed border-neutral-300 bg-white p-5"
            >
              <Text className="font-semibold text-neutral-700">Aún no tienes rutinas</Text>
              <Text className="mt-1 text-sm font-bold text-orange-600">+ Crear mi primera rutina</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
