/**
 * (tabs)/_layout.tsx — Layout de las Pestañas (Tab Bar)
 *
 * 📌 ¿QUÉ ES ESTE ARCHIVO?
 * Define la barra de navegación inferior con pestañas (tabs).
 * Cada <Tabs.Screen> corresponde a un archivo .tsx dentro de esta
 * carpeta `(tabs)/`, y aparece como una pestaña en la barra inferior.
 *
 * 📌 CONVENCIÓN DE CARPETAS EN EXPO ROUTER
 * La carpeta se llama `(tabs)` con paréntesis → es un "grupo de rutas".
 * Los grupos NO aparecen en la URL de navegación, solo agrupan pantallas.
 * Ejemplo: la pantalla `(tabs)/entrenos.tsx` se navega como `/entrenos`
 *
 * 📌 ORDEN DE LAS PESTAÑAS
 * El orden en que aparecen los <Tabs.Screen> aquí es el orden
 * en que se muestran en la barra inferior de la app.
 */

// Tabs: componente de Expo Router que crea la barra de navegación inferior
import { Tabs } from "expo-router";

// Librerías de iconos de @expo/vector-icons (incluye Ionicons, FontAwesome, Material, etc.)
// Se usa un ícono diferente para el estado activo (focused=true) e inactivo
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

// Platform: detecta si la app corre en iOS o Android
// Se usa para ajustar alturas y padding según la plataforma
import { Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // Oculta el encabezado nativo en todas las pantallas
        headerShown: false,

        // Color del ícono/texto cuando la pestaña ESTÁ seleccionada (activa)
        tabBarActiveTintColor: "#FF5722",   // Naranja

        // Color del ícono/texto cuando la pestaña NO está seleccionada
        tabBarInactiveTintColor: "#8E8E93", // Gris

        // Estilos del contenedor de la barra de tabs
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F0F0F0",

          // Altura diferente para iOS y Android
          // iOS necesita más espacio por el "notch" o barra de gestos inferior
          height: Platform.OS === "ios" ? 85 : 65,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,

          // Sombra (elevation en Android, shadow* en iOS)
          elevation: 4,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },

        // Estilo del texto de la etiqueta debajo del ícono
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 2,
        },
      }}
    >
      {/*
       * Cada Tabs.Screen registra una pantalla en la barra inferior.
       * - name: nombre del archivo .tsx en esta carpeta (sin extensión)
       *         "index" → src/app/(tabs)/index.tsx
       * - title: texto que se muestra debajo del ícono
       * - tabBarIcon: función que recibe { color, focused } y devuelve un ícono
       *   - color: el tintColor activo o inactivo según screenOptions
       *   - focused: true si esa pestaña está seleccionada
       */}

      {/* PESTAÑA 1: Inicio (index.tsx) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"} // Relleno si activo, contorno si inactivo
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* PESTAÑA 2: Entrenos (entrenos.tsx) — CRUD de Rutinas */}
      <Tabs.Screen
        name="entrenos"
        options={{
          title: "Entrenos",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="dumbbell" size={20} color={color} />
          ),
        }}
      />

      {/* PESTAÑA 3: Calorías (progreso.tsx) — Contador de Calorías */}
      <Tabs.Screen
        name="progreso"
        options={{
          title: "Calorías",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "flame" : "flame-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* PESTAÑA 4: Perfil (perfil.tsx) */}
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={23}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
