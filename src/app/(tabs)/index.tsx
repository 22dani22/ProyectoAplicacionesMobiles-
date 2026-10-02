import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InicioScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top", "left", "right"]}>
      <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            FitPulse
          </Text>
          <Text className="mt-2 text-base font-semibold text-orange-500">holaaaaa</Text>
          <Text className="text-3xl font-extrabold text-neutral-900">
            ¡Hola de nuevo! 👋
          </Text>
          <Text className="mt-1 text-base text-neutral-500">
            ¿Listo para tu entrenamiento de hoy?
          </Text>
        </View>

        {/* Tarjeta resumen */}
        <View className="mb-6 rounded-2xl bg-orange-500 p-5 shadow-sm">
          <Text className="text-sm font-semibold text-white/90">Meta semanal</Text>
          <Text className="mt-1 text-2xl font-bold text-white">4 de 5 días completados</Text>
          <View className="mt-4 h-2 w-full rounded-full bg-white/30">
            <View className="h-2 w-4/5 rounded-full bg-white" />
          </View>
        </View>

        {/* Sección entrenamientos sugeridos */}
        <View className="mb-6">
          <Text className="mb-3 text-lg font-bold text-neutral-800">
            Entrenamiento recomendado
          </Text>
          <View className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <Text className="text-base font-bold text-neutral-900">Fuerza Tren Superior</Text>
            <Text className="mt-1 text-sm text-neutral-500">45 minutos • 6 ejercicios • Intermedio</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
