/**
 * ExercisePickerModal.tsx — Selector de Ejercicios del Catálogo
 *
 * 📌 ¿QUÉ HACE ESTE COMPONENTE?
 * Muestra un modal con todos los ejercicios del catálogo (exercises.store.ts)
 * permitiendo buscar y seleccionar uno para agregarlo a una rutina.
 *
 * 📌 FLUJO DE USO
 * 1. RoutineModal presiona "Agregar Ejercicio" → setSelectorVisible(true)
 * 2. Este componente se muestra con la lista completa del catálogo
 * 3. El usuario puede buscar filtrando por nombre o detalle
 * 4. Al presionar un ejercicio:
 *    a. Llama a `alSeleccionar(ejercicio)` → el padre lo agrega a la rutina
 *    b. Llama a `alCerrar()` → oculta este modal
 *    c. Limpia el texto de búsqueda (setBusqueda(""))
 *
 * 📌 ¿POR QUÉ FlatList Y NO ScrollView + map()?
 * FlatList renderiza los elementos de forma diferida (lazy):
 *   - Solo renderiza los que son visibles en pantalla
 *   - Recicla los elementos que salen de la pantalla (como RecyclerView en Android)
 * Esto es MÁS EFICIENTE que map() para listas largas.
 * Para listas cortas (<20 ítems), map() es suficiente.
 */

import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,          // Lista optimizada para grandes colecciones
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { catalogoEjercicios, EjercicioCatalogo } from "../store/exercises.store";

// Props que recibe este componente
interface PropiedadesModalSelector {
  visible: boolean;                                    // Mostrar u ocultar
  alCerrar: () => void;                               // Callback al cerrar
  alSeleccionar: (ejercicio: EjercicioCatalogo) => void; // Callback al seleccionar
}

export function ModalSelectorEjercicio({
  visible,
  alCerrar,
  alSeleccionar,
}: PropiedadesModalSelector) {

  // Estado del campo de búsqueda
  const [busqueda, setBusqueda] = useState("");

  // ──────────────────────────────────────────
  // FILTRADO EN TIEMPO REAL
  // Se recalcula en cada render cuando cambia `busqueda`.
  // toLowerCase() hace la búsqueda insensible a mayúsculas/minúsculas.
  // includes() retorna true si el texto de búsqueda aparece en el nombre o detalle.
  // ──────────────────────────────────────────
  const ejerciciosFiltrados = catalogoEjercicios.filter((ej) =>
    ej.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    ej.detalle.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-black/60 justify-end"
      >
        <View className="bg-white rounded-t-3xl max-h-[85%] border-t border-neutral-200 shadow-2xl">

          {/* CABECERA: Título + botón Cerrar */}
          <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-neutral-200">
            <Text className="text-neutral-900 text-lg font-bold">
              Seleccionar Ejercicio
            </Text>
            <TouchableOpacity
              onPress={alCerrar}
              className="w-8 h-8 rounded-full bg-neutral-100 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* BUSCADOR
              El campo se vincula al estado `busqueda` con value/onChangeText.
              clearButtonMode="while-editing": muestra × para limpiar en iOS. */}
          <View className="px-5 pt-3 pb-2">
            <View className="flex-row items-center bg-neutral-100 rounded-xl px-3 py-2 border border-neutral-200">
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-2 text-neutral-900 text-base"
                placeholder="Buscar por nombre o músculo..."
                placeholderTextColor="#9CA3AF"
                value={busqueda}
                onChangeText={setBusqueda}
                clearButtonMode="while-editing"
              />
            </View>
          </View>

          {/* LISTA DE EJERCICIOS CON FlatList
              - data: arreglo de datos a renderizar (ejerciciosFiltrados)
              - keyExtractor: función que devuelve un id único por ítem
                (equivalente al key={} del map())
              - renderItem: función que recibe { item } y devuelve el JSX de cada fila
              - ListEmptyComponent: JSX a mostrar cuando la lista está vacía */}
          <FlatList
            data={ejerciciosFiltrados}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  alSeleccionar(item); // 1. Informa al padre qué ejercicio se eligió
                  alCerrar();          // 2. Cierra este modal
                  setBusqueda("");     // 3. Limpia la búsqueda para la próxima vez
                }}
                className="flex-row items-center bg-white border border-neutral-200 rounded-2xl p-3 mb-3 shadow-xs active:bg-orange-50/50"
              >
                {/* Imagen del ejercicio con transición de 200ms al cargar */}
                <Image
                  source={item.imagen}
                  style={{ width: 64, height: 64, borderRadius: 12 }}
                  contentFit="cover"
                  transition={200} // Fade-in de 200ms al cargar la imagen
                />

                {/* Información: Nombre y Descripción */}
                <View className="flex-1 ml-3 mr-2">
                  <Text className="text-neutral-900 font-bold text-base">
                    {item.nombre}
                  </Text>
                  {/* numberOfLines={2}: corta el texto a 2 líneas con "..." */}
                  <Text
                    className="text-neutral-500 text-xs mt-1 leading-4"
                    numberOfLines={2}
                  >
                    {item.detalle}
                  </Text>
                </View>

                {/* Ícono + (indicador visual de que se puede agregar) */}
                <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center">
                  <Ionicons name="add" size={20} color="#EA580C" />
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View className="items-center py-10">
                <Ionicons name="fitness-outline" size={40} color="#9CA3AF" />
                <Text className="text-neutral-500 font-medium mt-2">
                  {"No se encontraron ejercicios con "}
                  <Text className="font-semibold text-neutral-600">{busqueda}</Text>
                </Text>
              </View>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
