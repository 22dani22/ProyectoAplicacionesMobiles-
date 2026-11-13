/**
 * perfil.tsx — Perfil del usuario
 *
 * Muestra los datos reales del usuario (Firestore: users/{uid}),
 * permite editar el nombre y la meta de calorías, y cerrar sesión.
 */
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";
import { MAX_NOMBRE_PERSONA, mensajeErrorFirebase, validarNombre } from "@/lib/utils";

export default function PerfilScreen() {
  const { user, perfil, cerrarSesion, actualizarPerfil, recuperarContrasena } = useAuth();

  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState("");
  const [meta, setMeta] = useState("");

  const nombreVisible = perfil?.nombre ?? user?.displayName ?? "Usuario";
  const emailVisible = perfil?.email ?? user?.email ?? "";
  const inicial = nombreVisible.trim().charAt(0).toUpperCase() || "U";

  const abrirEditar = () => {
    setNombre(nombreVisible);
    setMeta(String(perfil?.metaCalorias ?? 2000));
    setModalVisible(true);
  };

  const guardar = async () => {
    const metaNumero = parseInt(meta, 10);
    const validacionNombre = validarNombre(nombre, "tu nombre", MAX_NOMBRE_PERSONA);
    if (validacionNombre.error) {
      Alert.alert("Nombre inválido", validacionNombre.error);
      return;
    }
    if (isNaN(metaNumero) || metaNumero < 500)
      return Alert.alert("Meta inválida", "La meta debe ser de al menos 500 kcal.");
    try {
      await actualizarPerfil({ nombre: validacionNombre.valor, metaCalorias: metaNumero });
      setModalVisible(false);
    } catch (e) {
      Alert.alert("Error", mensajeErrorFirebase(e));
    }
  };

  const cambiarContrasena = () => {
    if (!emailVisible) return;
    Alert.alert(
      "Cambiar contraseña",
      `Te enviaremos un enlace a ${emailVisible} para elegir una nueva contraseña.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar",
          onPress: () =>
            recuperarContrasena(emailVisible)
              .then(() => Alert.alert("Correo enviado", "Revisa tu bandeja de entrada (y spam)."))
              .catch((e) => Alert.alert("Error", mensajeErrorFirebase(e))),
        },
      ]
    );
  };

  const confirmarCerrarSesion = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: () => cerrarSesion().catch((e) => Alert.alert("Error", mensajeErrorFirebase(e))),
      },
    ]);
  };

  const opciones = [
    { icono: "person-outline" as const, titulo: "Datos personales", accion: abrirEditar },
    { icono: "key-outline" as const, titulo: "Cambiar contraseña", accion: cambiarContrasena },
    {
      icono: "help-circle-outline" as const,
      titulo: "Ayuda y soporte",
      accion: () =>
        Alert.alert("Ayuda", "Tus rutinas y calorías se guardan en la nube asociadas a tu cuenta."),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top", "left", "right"]}>
      <ScrollView className="flex-1 px-5 pt-3" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-3xl font-extrabold text-neutral-900">Perfil</Text>
        </View>

        {/* Tarjeta de usuario */}
        <View
          className="mb-6 flex-row items-center rounded-2xl border border-neutral-200 bg-white p-4"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.10)" }}
        >
          <View className="h-16 w-16 items-center justify-center rounded-full bg-orange-500">
            <Text className="text-2xl font-black text-white">{inicial}</Text>
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-xl font-bold text-neutral-900" numberOfLines={1}>
              {nombreVisible}
            </Text>
            <Text className="text-sm text-neutral-500" numberOfLines={1}>
              {emailVisible}
            </Text>
            <Text className="mt-1 text-xs font-semibold text-orange-600">
              Meta diaria: {perfil?.metaCalorias ?? 2000} kcal
            </Text>
          </View>
        </View>

        {/* Opciones */}
        <View
          className="mb-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.10)" }}
        >
          {opciones.map((opcion, idx) => (
            <Pressable
              key={opcion.titulo}
              onPress={opcion.accion}
              className={`flex-row items-center justify-between p-4 active:bg-neutral-100 ${
                idx < opciones.length - 1 ? "border-b border-neutral-100" : ""
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons name={opcion.icono} size={22} color="#4B5563" />
                <Text className="ml-3 text-base font-medium text-neutral-800">{opcion.titulo}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </Pressable>
          ))}
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity
          onPress={confirmarCerrarSesion}
          className="mb-10 flex-row items-center justify-center rounded-2xl border border-red-200 bg-red-50 py-4 active:bg-red-100"
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text className="ml-2 text-base font-bold text-red-500">Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal: editar datos personales */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="rounded-3xl border border-neutral-200 bg-white p-6"
            style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
          >
            <Text className="mb-4 text-center text-xl font-bold text-neutral-900">
              Datos personales
            </Text>

            <Text className="mb-1.5 text-xs font-bold uppercase text-neutral-600">Nombre</Text>
            <TextInput
              className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base font-semibold text-neutral-900"
              value={nombre}
              onChangeText={setNombre}
              maxLength={MAX_NOMBRE_PERSONA}
              placeholder="Tu nombre"
              placeholderTextColor="#9CA3AF"
            />

            <Text className="mb-1.5 text-xs font-bold uppercase text-neutral-600">
              Meta diaria (kcal)
            </Text>
            <TextInput
              className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-base font-semibold text-neutral-900"
              value={meta}
              onChangeText={setMeta}
              keyboardType="numeric"
              placeholder="2000"
              placeholderTextColor="#9CA3AF"
            />

            <View className="flex-row">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="mr-2 flex-1 items-center rounded-xl bg-neutral-100 py-3"
              >
                <Text className="text-base font-bold text-neutral-700">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={guardar}
                className="ml-2 flex-1 items-center rounded-xl bg-orange-500 py-3"
              >
                <Text className="text-base font-bold text-white">Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
