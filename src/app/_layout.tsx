/**
 * _layout.tsx — Layout Raíz (Root Layout)
 *
 * 📌 ¿QUÉ HACE?
 * Envuelve a TODA la aplicación:
 *   - Importa los estilos globales (NativeWind)
 *   - Provee la sesión del usuario (AuthProvider)
 *   - Mantiene el splash visible hasta saber si hay sesión
 *   - Protege las rutas con Stack.Protected:
 *       · Sin sesión → solo se puede ver el grupo (auth): login y registro
 *       · Con sesión → solo se puede ver el grupo (tabs): la app
 *     Al iniciar o cerrar sesión, Expo Router redirige automáticamente.
 *
 * ⚠️ IMPORTANTE (error "Couldn't find a navigation context")
 * El layout raíz NUNCA debe devolver `null` mientras carga la sesión:
 * si el <Stack> no existe, las pantallas se renderizan sin contexto de
 * navegación y la app se cae. En su lugar, el <Stack> se dibuja siempre y
 * el splash nativo tapa la pantalla hasta que Firebase responde.
 * (Patrón oficial: https://docs.expo.dev/router/advanced/authentication/)
 */

// IMPORTANTE: Debe estar en el layout raíz para que funcione en toda la app
import "../../global.css";

import { useEffect } from "react";
import { SplashScreen, Stack } from "expo-router";
import { NavigationBar } from "expo-navigation-bar";

import { AuthProvider, useAuth } from "@/context/AuthContext";

// Mantiene el splash hasta que Firebase resuelva la sesión guardada
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Oculta la barra de navegación del sistema en Android (modo inmersivo) */}
      <NavigationBar hidden />
      {/* Controla el splash; no dibuja nada */}
      <ControlSplash />
      <RootNavigator />
    </AuthProvider>
  );
}

/** Oculta el splash recién cuando Firebase ya sabe si hay sesión. */
function ControlSplash() {
  const { cargando } = useAuth();

  useEffect(() => {
    if (!cargando) SplashScreen.hide();
  }, [cargando]);

  return null;
}

function RootNavigator() {
  const { user } = useAuth();

  // El <Stack> se renderiza SIEMPRE (aunque `cargando` sea true).
  // Mientras carga, `user` es null y se monta el grupo (auth) detrás del splash.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Con sesión: pestañas de la app */}
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      {/* Sin sesión: login y registro */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
