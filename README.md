# 🏋️‍♂️ FitPulse - Aplicación Móvil de Fitness y Nutrición

FitPulse es una aplicación móvil desarrollada con **React Native** y **Expo (SDK 57)**, diseñada para el seguimiento de entrenamientos en el gimnasio, gestión de rutinas con ejercicios y series, y planificación diaria de calorías.

---

## 📚 Índice
1. [Tecnologías y Bibliotecas](#-tecnologías-y-bibliotecas)
2. [Estructura del Proyecto](#-estructura-del-proyecto)
3. [Nomenclatura y Variables en Español](#-nomenclatura-y-variables-en-español)
4. [Guía Paso a Paso de Desarrollo](#-guía-paso-a-paso-de-desarrollo)
   - [1. Cómo crear un botón y darle estilo](#1-cómo-crear-un-botón-y-darle-estilo)
   - [2. Cómo crear una nueva pantalla o vista](#2-cómo-crear-una-nueva-pantalla-o-vista)
   - [3. Cómo usar iconos con `@expo/vector-icons`](#3-cómo-usar-iconos-con-expovector-icons)
   - [4. Cómo cargar y mostrar imágenes con `expo-image`](#4-cómo-cargar-y-mostrar-imágenes-con-expo-image)
   - [5. Cómo crear y abrir ventanas modales](#5-cómo-crear-y-abrir-ventanas-modales)
   - [6. Cómo crear un Store o Estado con TypeScript](#6-cómo-crear-un-store-o-estado-con-typescript)
   - [7. Cómo ocultar la barra del sistema en Android](#7-cómo-ocultar-la-barra-del-sistema-en-android)
5. [Comandos Frecuentes y Migraciones](#-comandos-frecuentes-y-migraciones)

---

## 🛠️ Tecnologías y Bibliotecas

La aplicación utiliza el ecosistema oficial y moderno de Expo:

| Biblioteca | Versión | Para qué se usa en el proyecto |
| :--- | :--- | :--- |
| **`expo`** | `~57.0.25` | Plataforma base y entorno de ejecución universal (Android, iOS y Web). |
| **`expo-router`** | `~57.0.23` | Sistema de navegación basado en archivos y carpetas (`src/app/`). |
| **`nativewind` + `tailwindcss`** | `^4.2.7` / `^3.4.19` | Motor de estilos utilitarios mediante `className="..."` idéntico a Tailwind CSS en web. |
| **`@expo/vector-icons`** | `^15.0.2` | Paquete oficial de iconos vectoriales (`Ionicons`, `FontAwesome5`, `MaterialCommunityIcons`, etc.). |
| **`expo-image`** | `~57.0.5` | Componente de imagen de alto rendimiento con caché automático y transiciones suaves. |
| **`expo-navigation-bar`** | `~57.0.3` | Permite controlar y ocultar declarativamente la barra de navegación del sistema en Android. |
| **`react-native-safe-area-context`** | `~5.7.0` | Garantiza que el contenido respete el notch, esquinas redondeadas y barras del dispositivo. |

---

## 📁 Estructura del Proyecto

```text
FitPulse/
├── assets/                          # Recursos multimedia estáticos
│   └── images/
│       ├── exercises/               # Imágenes locales de los ejercicios (.jpg, .png)
│       └── icon.png                 # Icono principal de la app
├── src/
│   ├── app/                         # Enrutamiento basado en archivos (Expo Router)
│   │   ├── _layout.tsx              # Layout raíz (Stack global y NavigationBar)
│   │   └── (tabs)/                  # Grupo de navegación por pestañas inferiores
│   │       ├── _layout.tsx          # Configuración visual de la barra de pestañas
│   │       ├── index.tsx            # Pantalla 1: Inicio
│   │       ├── entrenos.tsx         # Pantalla 2: Entrenamiento y Rutinas
│   │       ├── progreso.tsx         # Pantalla 3: Contador y Planificador de Calorías
│   │       └── perfil.tsx           # Pantalla 4: Perfil de usuario
│   ├── components/                  # Componentes reutilizables
│   │   ├── RoutineModal.tsx         # Modal para crear y editar rutinas y series
│   │   └── ExercisePickerModal.tsx  # Selector visual de ejercicios con catálogo
│   └── store/                       # Modelos de datos y estados iniciales
│       ├── routines.store.ts        # Tipos y datos de Rutina, Ejercicio y Serie
│       ├── exercises.store.ts       # Catálogo con imágenes y detalles de ejercicios
│       └── calories.store.ts        # Registro y tipos de alimentos y comidas
├── global.css                       # Archivo CSS requerido por NativeWind (NO modificar)
├── tailwind.config.js               # Configuración de NativeWind / Tailwind
└── package.json                     # Dependencias y scripts del proyecto
```

### ¿Qué hace `global.css`?

El archivo `global.css` es el más simple posible y **no se debe modificar**. Contiene exactamente 3 líneas que son obligatorias para que NativeWind (Tailwind en React Native) funcione:

```css
@tailwind base;        /* Estilos base y reset de CSS */
@tailwind components;  /* Componentes de Tailwind */
@tailwind utilities;   /* Todas las clases utilitarias: bg-white, rounded-xl, etc. */
```

Este archivo es importado desde `src/app/_layout.tsx` (el layout raíz), lo que activa NativeWind en toda la aplicación. Si eliminas alguna de estas líneas, las clases de estilos dejarán de aplicarse.



---

## 🏷️ Nomenclatura y Variables en Español

Todo el código fuente y los modelos de datos utilizan nombres representativos y legibles en español:

* **Rutinas (`routines.store.ts`)**:
  * `Rutina`: `{ id, nombre, ejercicios, fechaCreacion }`
  * `Ejercicio`: `{ id, nombre, detalle, imagen, series }`
  * `Serie`: `{ id, numeroSerie, peso, repeticiones }`
  * `rutinasIniciales`
* **Catálogo de Ejercicios (`exercises.store.ts`)**:
  * `EjercicioCatalogo`: `{ id, nombre, detalle, imagen }`
  * `catalogoEjercicios`
* **Calorías (`calories.store.ts`)**:
  * `TipoComida`: `"Desayuno" | "Almuerzo" | "Cena" | "Snack"`
  * `Alimento`: `{ id, nombre, calorias, tipoComida, hora }`
  * `alimentosIniciales`

---

## 📖 Guía Paso a Paso de Desarrollo

### 1. Cómo crear un botón y darle estilo

Para crear un botón con respuesta táctil y estilos de Tailwind (NativeWind), usamos `TouchableOpacity`:

```tsx
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function BotonPrincipal() {
  return (
    <TouchableOpacity
      onPress={() => alert("¡Botón presionado!")}
      className="bg-orange-500 py-3.5 px-5 rounded-2xl flex-row items-center justify-center active:bg-orange-600 shadow-sm"
    >
      <Ionicons name="add" size={20} color="#FFFFFF" />
      <Text className="text-white font-bold text-base ml-2">
        Crear Rutina
      </Text>
    </TouchableOpacity>
  );
}
```

* **`bg-orange-500`**: Color de fondo naranja corporativo.
* **`py-3.5 px-5`**: Relleno vertical y horizontal.
* **`rounded-2xl`**: Bordes redondeados pronunciados.
* **`active:bg-orange-600`**: Efecto visual cuando el usuario presiona la pantalla.
* **`flex-row items-center`**: Alinea el icono y el texto horizontalmente al centro.

---

### 2. Cómo crear una nueva pantalla o vista

En Expo Router, **cada archivo dentro de `src/app/` se convierte automáticamente en una pantalla**.

Si deseas crear una pantalla de detalle de ejercicio, crea el archivo `src/app/detalle-ejercicio.tsx`:

```tsx
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PantallaDetalle() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50 px-5 pt-4">
      <Text className="text-2xl font-black text-neutral-900">
        Detalle del Ejercicio
      </Text>
    </SafeAreaView>
  );
}
```

Para navegar hacia ella desde cualquier componente:

```tsx
import { router } from "expo-router";

// En el evento onPress de un botón:
router.push("/detalle-ejercicio");
```

---

### 3. Cómo usar iconos con `@expo/vector-icons`

Expo incluye familias de iconos populares como `Ionicons`, `FontAwesome5`, y `MaterialCommunityIcons`:

```tsx
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

// Icono de casa
<Ionicons name="home" size={24} color="#FF5722" />

// Icono de mancuerna para entrenamientos
<FontAwesome5 name="dumbbell" size={20} color="#8E8E93" />

// Icono de fuego para calorías
<Ionicons name="flame" size={22} color="#EA580C" />
```

> **Consejo**: Puedes consultar el directorio completo de nombres de iconos en: [icons.expo.fyi](https://icons.expo.fyi)

---

### 4. Cómo cargar y mostrar imágenes con `expo-image`

`expo-image` es más rápido y fluido que el componente `Image` tradicional de React Native.

#### A) Imagen local (desde la carpeta `assets`):
```tsx
import { Image } from "expo-image";

<Image
  source={require("@/assets/images/exercises/Remo_con_barra.jpg")}
  style={{ width: 64, height: 64, borderRadius: 12 }}
  contentFit="cover"
  transition={200}
/>
```

#### B) Imagen remota (desde una URL de internet):
```tsx
<Image
  source={{ uri: "https://ejemplo.com/foto.jpg" }}
  style={{ width: "100%", height: 200, borderRadius: 16 }}
  contentFit="cover"
/>
```

---

### 5. Cómo crear y abrir ventanas modales

Un modal es una pantalla emergente superpuesta. Usamos el componente `Modal` nativo junto con `KeyboardAvoidingView` para que el teclado no tape los campos de texto:

```tsx
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";

export function EjemploModal() {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <View>
      <TouchableOpacity onPress={() => setModalAbierto(true)}>
        <Text>Abrir Ventana</Text>
      </TouchableOpacity>

      <Modal visible={modalAbierto} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-3xl p-5 shadow-2xl">
            <Text className="text-lg font-bold text-neutral-900">
              Título del Modal
            </Text>

            <TouchableOpacity
              onPress={() => setModalAbierto(false)}
              className="mt-4 bg-orange-500 py-3 rounded-xl items-center"
            >
              <Text className="text-white font-bold">Cerrar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
```

---

### 6. Cómo crear un Store o Estado con TypeScript

Para mantener los datos organizados y tipados, definimos interfaces claras en la carpeta `src/store/`:

```typescript
// src/store/alimentos.store.ts
export interface Alimento {
  id: string;
  nombre: string;
  calorias: number;
}

export const alimentosPorDefecto: Alimento[] = [
  { id: "1", nombre: "Plátano", calorias: 105 },
];
```

Y en tu pantalla o componente, lo consumes con `useState`:

```tsx
import { useState } from "react";
import { Alimento, alimentosPorDefecto } from "../store/alimentos.store";

export function ListaAlimentos() {
  const [alimentos, setAlimentos] = useState<Alimento[]>(alimentosPorDefecto);

  const agregarAlimento = (nuevo: Alimento) => {
    // Agregamos inmutablemente con spread operator
    setAlimentos([nuevo, ...alimentos]);
  };

  const eliminarAlimento = (idParaBorrar: string) => {
    setAlimentos(alimentos.filter((item) => item.id !== idParaBorrar));
  };
}
```

---

### 7. Cómo ocultar la barra del sistema en Android

En **Expo SDK 57**, se utiliza el componente declarativo `<NavigationBar hidden />` en el archivo raíz [src/app/_layout.tsx](file:///c:/Users/dosor/OneDrive/Escritorio/fitpulse/FitPulse/src/app/_layout.tsx):

```tsx
import "../../global.css";
import { Stack } from "expo-router";
import { NavigationBar } from "expo-navigation-bar";

export default function RootLayout() {
  return (
    <>
      {/* Oculta los botones de atrás/inicio/recientes en Android */}
      <NavigationBar hidden />
      
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
```

---

## ⚡ Comandos Frecuentes y Migraciones

### Iniciar el servidor de desarrollo:
> **Importante**: Asegúrate de estar dentro de la carpeta `FitPulse` antes de ejecutar cualquier comando.

```bash
cd FitPulse
npx expo start
```

### Instalar una nueva biblioteca:
**Nunca uses `npm install` directo para módulos de Expo.** Usa siempre `npx expo install`, ya que resuelve automáticamente la versión exacta compatible con tu SDK (SDK 57):

```bash
# Ejemplo: si deseas instalar una nueva librería nativa
npx expo install <nombre-de-libreria>
```

### Comprobación de tipos con TypeScript:
Verifica que no existan errores de tipos en todo el proyecto:

```bash
npx tsc --noEmit
```

### Limpiar la caché de Metro Bundler:
Si instalas una biblioteca o agregas imágenes y no se reflejan:

```bash
npx expo start -c
```
