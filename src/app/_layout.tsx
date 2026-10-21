/**
 * _layout.tsx — Layout Raíz (Root Layout)
 *
 * 📌 ¿QUÉ ES ESTE ARCHIVO?
 * En Expo Router, cada carpeta puede tener un "_layout.tsx".
 * El de la raíz (`src/app/_layout.tsx`) es el primero en ejecutarse
 * y envuelve a TODA la aplicación. Todo lo que pongas aquí afecta
 * a todas las pantallas.
 *
 * 📌 ¿CUÁNDO SE USA?
 * Úsalo para:
 *   - Configuración global de navegación
 *   - Importar estilos globales (global.css)
 *   - Ocultar barras del sistema (NavigationBar)
 *   - Proveedores globales (Context, Redux, etc.)
 */

// Importamos los estilos de NativeWind (Tailwind para React Native)
// IMPORTANTE: Debe estar en el layout raíz para que funcione en toda la app
import "../../global.css";

// Stack: componente de navegación en pila de Expo Router
// Equivalente a un historial de páginas (ir hacia adelante/atrás)
import { Stack } from "expo-router";

import React, { useEffect } from "react";
import { Platform } from "react-native";

// NavigationBar: controla la barra de navegación inferior de Android
// (los botones de inicio, atrás y recientes del sistema)
import * as NavigationBar from "expo-navigation-bar";

export default function RootLayout() {
  useEffect(() => {
    // En Android, ocultamos la barra de navegación del sistema para modo inmersivo
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
    }
  }, []);

  return (
    // Fragment (<>) agrupa elementos sin añadir un contenedor extra al DOM
    <>
      {/*
       * Stack: define que la navegación entre pantallas será en "pila"
       * headerShown: false → oculta la barra de título nativa en TODAS las pantallas
       *
       * Stack.Screen name="(tabs)": registra el grupo de pestañas.
       * El nombre "(tabs)" corresponde a la carpeta `src/app/(tabs)/`
       * Los paréntesis en el nombre indican que es un "grupo de rutas"
       * (no aparece en la URL/path de navegación)
       */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
