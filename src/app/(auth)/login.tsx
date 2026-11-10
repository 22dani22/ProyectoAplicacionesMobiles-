/**
 * login.tsx — Iniciar sesión con correo y contraseña
 *
 * Al iniciar sesión correctamente NO hace falta navegar: el Stack.Protected
 * del layout raíz detecta el usuario y muestra las pestañas automáticamente.
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
import { mensajeErrorFirebase } from "@/lib/utils";

export default function PantallaLogin() {
  const { iniciarSesion, recuperarContrasena } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);

  const entrar = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Campos requeridos", "Ingresa tu correo y tu contraseña.");
      return;
    }
    setEnviando(true);
    try {
      await iniciarSesion(email, password);
    } catch (e) {
      Alert.alert("No se pudo iniciar sesión", mensajeErrorFirebase(e));
    } finally {
      setEnviando(false);
    }
  };

  const olvideContrasena = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Recuperar contraseña",
        "Escribe tu correo en el campo de arriba y vuelve a pulsar este enlace."
      );
      return;
    }
    try {
      await recuperarContrasena(email);
      Alert.alert(
        "Correo enviado",
        `Si existe una cuenta con ${email.trim()}, recibirás un enlace para restablecer la contraseña. Revisa también la carpeta de spam.`
      );
    } catch (e) {
      Alert.alert("Error", mensajeErrorFirebase(e));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View className="mb-10 items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl bg-orange-500">
              <Ionicons name="barbell" size={40} color="#FFFFFF" />
            </View>
            <Text className="text-3xl font-black text-neutral-900">FitPulse</Text>
            <Text className="mt-1 text-base text-neutral-500">Entrena, registra y progresa</Text>
          </View>

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
            placeholder="••••••"
            esContrasena
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={entrar}
          />

          <TouchableOpacity onPress={olvideContrasena} className="mb-6 self-end">
            <Text className="text-sm font-semibold text-orange-600">¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={entrar}
            disabled={enviando}
            className="items-center rounded-2xl bg-orange-500 py-4 active:bg-orange-600"
            style={{ opacity: enviando ? 0.7 : 1 }}
          >
            {enviando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-bold text-white">Iniciar sesión</Text>
            )}
          </TouchableOpacity>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-neutral-500">¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push("/registro")}>
              <Text className="text-sm font-bold text-orange-600">Regístrate</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
