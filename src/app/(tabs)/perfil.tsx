import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function PerfilScreen() {
  const opciones = [
    { icono: "person-outline" as const, titulo: "Datos personales" },
    { icono: "notifications-outline" as const, titulo: "Notificaciones y recordatorios" },
    { icono: "shield-checkmark-outline" as const, titulo: "Privacidad y seguridad" },
    { icono: "help-circle-outline" as const, titulo: "Ayuda y soporte" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top", "left", "right"]}>
      <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-3xl font-extrabold text-neutral-900">Perfil</Text>
        </View>

        {/* Tarjeta de usuario */}
        <View className="mb-6 flex-row items-center rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-orange-500">
            <Ionicons name="person" size={32} color="#ffffff" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-xl font-bold text-neutral-900">Usuario FitPulse</Text>
            <Text className="text-sm text-neutral-500">usuario@ejemplo.com</Text>
          </View>
        </View>

        {/* Opciones */}
        <View className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden mb-6">
          {opciones.map((opcion, idx) => (
            <Pressable
              key={idx}
              className={`flex-row items-center justify-between p-4 active:bg-neutral-100 ${
                idx < opciones.length - 1 ? "border-b border-neutral-100" : ""
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons name={opcion.icono} size={22} color="#4B5563" />
                <Text className="ml-3 text-base font-medium text-neutral-800">
                  {opcion.titulo}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
