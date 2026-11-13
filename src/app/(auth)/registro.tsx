/**
 * registro.tsx — Crear cuenta nueva (nombre, correo, contraseña)
 *
 * Crea el usuario en Firebase Auth y su documento users/{uid} en Firestore.
 * Al terminar, el Stack.Protected del layout raíz muestra la app automáticamente.
 */
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { CampoTexto } from "@/components/CampoTexto";
import { MAX_NOMBRE_PERSONA, mensajeErrorFirebase, validarNombre } from "@/lib/utils";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PantallaRegistro() {
  const { registrar } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [enviando, setEnviando] = useState(false);

  const crearCuenta = async () => {
    const validacionNombre = validarNombre(nombre, "tu nombre", MAX_NOMBRE_PERSONA);
    if (validacionNombre.error) {
      Alert.alert("Nombre inválido", validacionNombre.error);
      return;
    }
    if (!EMAIL_VALIDO.test(email.trim()))
      return Alert.alert("Correo inválido", "Ingresa un correo electrónico válido.");
    if (password.length < 6)
      return Alert.alert("Contraseña débil", "La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirmar)
      return Alert.alert("Las contraseñas no coinciden", "Vuelve a escribir la confirmación.");

    setEnviando(true);
    try {
      await registrar(validacionNombre.valor, email, password);
    } catch (e) {
      Alert.alert("No se pudo crear la cuenta", mensajeErrorFirebase(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => router.back()} className="mb-6 self-start p-1">
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>

          <Text className="text-3xl font-black text-neutral-900">Crear cuenta</Text>
          <Text className="mb-8 mt-1 text-base text-neutral-500">
            Guarda tus rutinas y calorías en la nube.
          </Text>

          <CampoTexto
            etiqueta="Nombre"
            icono="person-outline"
            placeholder="Tu nombre"
            maxLength={MAX_NOMBRE_PERSONA}
            autoCapitalize="words"
            autoComplete="name"
            value={nombre}
            onChangeText={setNombre}
          />
          <CampoTexto
            etiqueta="Correo electrónico"
            icono="mail-outline"
            placeholder="tu@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <CampoTexto
            etiqueta="Contraseña"
            icono="lock-closed-outline"
            placeholder="Mínimo 6 caracteres"
            esContrasena
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
          />
          <CampoTexto
            etiqueta="Confirmar contraseña"
            icono="lock-closed-outline"
            placeholder="Repite la contraseña"
            esContrasena
            value={confirmar}
            onChangeText={setConfirmar}
            onSubmitEditing={crearCuenta}
          />

          <TouchableOpacity
            onPress={crearCuenta}
            disabled={enviando}
            className="mt-2 items-center rounded-2xl bg-orange-500 py-4 active:bg-orange-600"
            style={{ opacity: enviando ? 0.7 : 1 }}
          >
            {enviando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-bold text-white">Crear cuenta</Text>
            )}
          </TouchableOpacity>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-neutral-500">¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-sm font-bold text-orange-600">Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
