/**
 * entrenos.tsx — Pantalla de Entrenamiento (CRUD de Rutinas)
 *
 * 📌 ¿QUÉ HACE ESTA PANTALLA?
 * Muestra y gestiona todas las rutinas del usuario.
 * Permite: Crear, Ver, Editar y Eliminar rutinas (CRUD completo).
 *
 * 📌 ESTADO LOCAL (useState)
 * ┌──────────────────────┬────────────────────────────────────────────────┐
 * │ Variable             │ Descripción                                    │
 * ├──────────────────────┼────────────────────────────────────────────────┤
 * │ rutinas              │ Lista completa de rutinas del usuario          │
 * │ modalVisible         │ true = muestra el modal de crear/editar        │
 * │ rutinaAEditar        │ Rutina seleccionada para editar (null = nueva) │
 * │ mostrarBanner        │ true = muestra el banner informativo amarillo  │
 * │ menuOpcionesVisible  │ true = muestra el menú inferior (···)          │
 * │ rutinaSeleccionada   │ Rutina sobre la que se abrió el menú (···)     │
 * └──────────────────────┴────────────────────────────────────────────────┘
 *
 * 📌 FLUJO CRUD
 *
 *   [Crear]  → abrirModalCrear() → ModalRutina → guardarRutina()
 *              rutinaAEditar = null → crea nueva con Date.now() como id
 *
 *   [Editar] → abrirMenuOpciones() → abrirModalEditar() → ModalRutina → guardarRutina()
 *              rutinaAEditar = rutina → sobreescribe la existente por id
 *
 *   [Eliminar] → abrirMenuOpciones() → eliminarRutina() → Alert de confirmación
 *                filtra la rutina del array por id
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,  // Botón que se oscurece al presionar
  Alert,             // Diálogo nativo del sistema (confirmación, error)
  Modal,             // Ventana flotante encima del contenido
  Pressable,         // Área presionable más flexible que TouchableOpacity
} from "react-native";

// SafeAreaView: respeta los bordes seguros del dispositivo (notch, barra de estado)
import { SafeAreaView } from "react-native-safe-area-context";

// expo-image: reemplazo optimizado de <Image> de React Native
// Soporta caché, transiciones, formatos modernos (WebP, AVIF)
import { Image } from "expo-image";

import { Ionicons } from "@expo/vector-icons";

// Tipos del store de rutinas
import { rutinasIniciales, Rutina } from "../../store/routines.store";

// Componente Modal para crear/editar rutinas (definido en components/)
import { ModalRutina } from "../../components/RoutineModal";

export default function PantallaEntrenos() {
  // ──────────────────────────────────────────
  // ESTADO LOCAL
  // useState<Tipo>(valorInicial) → retorna [valor, setter]
  // Cuando se llama al setter, React re-renderiza el componente
  // ──────────────────────────────────────────

  // Lista de rutinas — inicia con rutinasIniciales (vacía por defecto)
  const [rutinas, setRutinas] = useState<Rutina[]>(rutinasIniciales);

  // Controla si el modal de crear/editar está visible
  const [modalVisible, setModalVisible] = useState(false);

  // Rutina que se está editando. null = estamos creando una nueva
  const [rutinaAEditar, setRutinaAEditar] = useState<Rutina | null>(null);

  // Controla si se muestra el banner informativo amarillo
  const [mostrarBanner, setMostrarBanner] = useState(true);

  // Menú de opciones de tarjeta (··· tres puntos)
  const [menuOpcionesVisible, setMenuOpcionesVisible] = useState(false);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState<Rutina | null>(null);

  // ──────────────────────────────────────────
  // HANDLERS (funciones que manejan eventos)
  // ──────────────────────────────────────────

  /** Abre el modal en modo "crear" (sin rutina preseleccionada) */
  const abrirModalCrear = () => {
    setRutinaAEditar(null);   // null indica "nueva rutina"
    setModalVisible(true);
  };

  /** Abre el modal en modo "editar" con la rutina seleccionada precargada */
  const abrirModalEditar = (rutina: Rutina) => {
    setMenuOpcionesVisible(false); // Cierra el menú ··· primero
    setRutinaAEditar(rutina);      // Precarga los datos de esa rutina
    setModalVisible(true);
  };

  /**
   * Guarda la rutina recibida desde el ModalRutina.
   * Si `rutinaAEditar` existe → actualiza (map para reemplazar por id)
   * Si `rutinaAEditar` es null → añade al inicio del array ([nueva, ...existentes])
   */
  const guardarRutina = (rutinaGuardada: Rutina) => {
    if (rutinaAEditar) {
      // EDITAR: map recorre el array y reemplaza solo la que tiene el mismo id
      setRutinas(
        rutinas.map((r) => (r.id === rutinaGuardada.id ? rutinaGuardada : r))
      );
    } else {
      // CREAR: spread operator agrega la nueva rutina al inicio
      setRutinas([rutinaGuardada, ...rutinas]);
    }
    setModalVisible(false);
    setRutinaAEditar(null);
  };

  /**
   * Elimina la rutina seleccionada tras confirmación con Alert.
   * filter() devuelve un nuevo array sin la rutina con ese id.
   */
  const eliminarRutina = (rutina: Rutina) => {
    setMenuOpcionesVisible(false);
    Alert.alert(
      "Eliminar Rutina",
      `¿Estás seguro de que deseas eliminar "${rutina.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive", // Muestra el botón en rojo en iOS
          onPress: () => {
            // filter crea un nuevo array excluyendo la rutina con ese id
            setRutinas(rutinas.filter((r) => r.id !== rutina.id));
          },
        },
      ]
    );
  };

  /** Simula el inicio de un entrenamiento con un Alert informativo */
  const iniciarEntrenamiento = (nombreRutina: string) => {
    Alert.alert(
      "Entrenamiento iniciado",
      `¡Has comenzado la rutina de ${nombreRutina}! 💪`
    );
  };

  /** Abre el menú de opciones (···) para una rutina específica */
  const abrirMenuOpciones = (rutina: Rutina) => {
    setRutinaSeleccionada(rutina);
    setMenuOpcionesVisible(true);
  };

  // ──────────────────────────────────────────
  // RENDER (lo que se muestra en pantalla)
  // JSX: mezcla de HTML y JavaScript dentro de React
  // className="..." → clases de NativeWind (Tailwind para RN)
  // ──────────────────────────────────────────

  return (
    // SafeAreaView con edges: solo aplica safe area en los bordes indicados
    // Se omite "bottom" para que el tab bar no deje espacio extra
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top", "left", "right"]}>
      <ScrollView
        className="flex-1 px-4 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }} // Espacio al final del scroll
      >
        {/* 1. CABECERA SUPERIOR */}
        <View className="flex-row items-center justify-between mb-5 mt-1">
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-neutral-900 text-2xl font-black mr-1 tracking-tight">
              Entrenamiento
            </Text>
            <Ionicons name="chevron-down" size={18} color="#1F2937" />
          </TouchableOpacity>

          <View className="flex-row items-center">
            <TouchableOpacity className="mr-3 p-1">
              <Ionicons name="refresh-outline" size={22} color="#1F2937" />
            </TouchableOpacity>

          </View>
        </View>

        {/* 2. BOTÓN "EMPEZAR ENTRENAMIENTO VACÍO" */}
        <TouchableOpacity
          onPress={() => iniciarEntrenamiento("Entrenamiento Vacío")}
          className="bg-white border border-neutral-200 rounded-2xl py-3.5 px-4 mb-6 flex-row items-center justify-center shadow-xs active:bg-neutral-50"
        >
          <Ionicons name="add" size={22} color="#1F2937" />
          <Text className="text-neutral-900 font-bold text-base ml-2">
            Empezar Entrenamiento Vacío
          </Text>
        </TouchableOpacity>

        {/* 3. CABECERA DE LA SECCIÓN "RUTINAS" */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-neutral-900 text-xl font-bold">Rutinas</Text>
          <TouchableOpacity onPress={abrirModalCrear} className="p-1">
            <Ionicons name="folder-outline" size={22} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* 4. CUADROS DE ACCIÓN: "Nueva Rutina" y "Explorar" */}
        <View className="flex-row justify-between mb-4">
          {/* Cuadrado: Nueva Rutina → abre el modal de creación */}
          <TouchableOpacity
            onPress={abrirModalCrear}
            className="flex-1 bg-white border border-neutral-200 rounded-2xl p-4 mr-2 flex-row items-center shadow-xs active:bg-neutral-50"
          >
            <View className="w-10 h-10 rounded-xl bg-orange-100 items-center justify-center mr-3">
              <Ionicons name="clipboard-outline" size={20} color="#EA580C" />
            </View>
            <Text
              className="text-neutral-900 font-bold text-base flex-1"
              numberOfLines={1}
            >
              Nueva Rutina
            </Text>
          </TouchableOpacity>

          {/* Cuadrado: Explorar → placeholder con Alert */}
          <TouchableOpacity
            onPress={() => Alert.alert("Explorar", "Explorador de rutinas de la comunidad.")}
            className="flex-1 bg-white border border-neutral-200 rounded-2xl p-4 ml-2 flex-row items-center shadow-xs active:bg-neutral-50"
          >
            <View className="w-10 h-10 rounded-xl bg-neutral-100 items-center justify-center mr-3">
              <Ionicons name="search-outline" size={20} color="#4B5563" />
            </View>
            <Text
              className="text-neutral-900 font-bold text-base flex-1"
              numberOfLines={1}
            >
              Explorar
            </Text>
          </TouchableOpacity>
        </View>

        {/* 5. BANNER INFORMATIVO
            Renderizado condicional: {condición && <Componente />}
            Solo se muestra si mostrarBanner === true */}
        {mostrarBanner && (
          <View className="bg-[#FEF08A] border border-amber-200 rounded-xl px-3.5 py-2.5 mb-5 flex-row items-center justify-between shadow-xs">
            <View className="flex-row items-center flex-1 mr-2">
              <Ionicons name="finger-print-outline" size={18} color="#713F12" />
              <Text
                className="text-[#713F12] text-xs font-semibold ml-2 flex-1"
                numberOfLines={1}
              >
                Mantén presionada una rutina para reordenar
              </Text>
            </View>
            {/* Al presionar × se oculta el banner (no se puede recuperar) */}
            <TouchableOpacity onPress={() => setMostrarBanner(false)}>
              <Ionicons name="close" size={16} color="#713F12" />
            </TouchableOpacity>
          </View>
        )}

        {/* 6. CONTADOR DE RUTINAS */}
        <View className="flex-row items-center mb-3">
          <Ionicons name="caret-down" size={14} color="#6B7280" />
          {/* rutinas.length → cantidad de rutinas en el array */}
          <Text className="text-neutral-500 font-semibold text-sm ml-1.5">
            Mis rutinas ({rutinas.length})
          </Text>
        </View>

        {/* 7. LISTA DE TARJETAS DE RUTINAS
            map(): recorre el array y devuelve un componente por cada elemento
            key={rutina.id}: prop obligatoria en listas para que React identifique cada elemento */}
        {rutinas.map((rutina) => (
          <View
            key={rutina.id}
            className="bg-white border border-neutral-200 rounded-2xl p-4 mb-4 shadow-xs"
          >
            {/* Fila superior: Título y menú ··· */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-neutral-900 text-xl font-bold flex-1">
                {rutina.nombre}
              </Text>

              {/* Botón ··· → abre el menú de opciones (editar/eliminar) */}
              <TouchableOpacity
                onPress={() => abrirMenuOpciones(rutina)}
                className="p-1 -mr-1"
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {/* Ejercicios — solo muestra los primeros 3 (slice(0,3)) */}
            <View className="mb-4">
              {rutina.ejercicios.slice(0, 3).map((ej) => (
                <View key={ej.id} className="flex-row items-center mb-2">
                  {/* Renderizado condicional: imagen si existe, ícono si no */}
                  {ej.imagen ? (
                    <Image
                      source={ej.imagen}
                      style={{ width: 32, height: 32, borderRadius: 8 }}
                      contentFit="cover" // Similar a object-fit: cover en CSS
                    />
                  ) : (
                    <View className="w-8 h-8 rounded-lg bg-orange-100 items-center justify-center">
                      <Ionicons name="barbell-outline" size={16} color="#EA580C" />
                    </View>
                  )}
                  <View className="ml-2.5 flex-1">
                    <Text className="text-neutral-800 text-sm font-semibold" numberOfLines={1}>
                      {ej.nombre}
                    </Text>
                    {ej.detalle ? (
                      <Text className="text-neutral-400 text-xs" numberOfLines={1}>
                        {ej.detalle}
                      </Text>
                    ) : null}
                  </View>
                  <Text className="text-neutral-500 text-xs font-medium ml-2">
                    {ej.series.length} series
                  </Text>
                </View>
              ))}

              {/* Si hay más de 3 ejercicios, muestra el excedente */}
              {rutina.ejercicios.length > 3 && (
                <Text className="text-neutral-400 text-xs italic mt-1">
                  +{rutina.ejercicios.length - 3} ejercicios más...
                </Text>
              )}
            </View>

            {/* Botón principal de la tarjeta */}
            <TouchableOpacity
              onPress={() => iniciarEntrenamiento(rutina.nombre)}
              className="bg-orange-500 py-3 rounded-xl items-center justify-center active:bg-orange-600"
            >
              <Text className="text-white font-bold text-base">
                Empezar Rutina
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* 8. ESTADO VACÍO
            Solo se renderiza si rutinas.length === 0
            Buena práctica: siempre mostrar algo cuando la lista está vacía */}
        {rutinas.length === 0 && (
          <View className="bg-white border border-dashed border-neutral-300 rounded-2xl p-8 items-center justify-center my-3 shadow-xs">
            <View className="w-14 h-14 rounded-full bg-orange-100 items-center justify-center mb-3">
              <Ionicons name="barbell-outline" size={28} color="#EA580C" />
            </View>
            <Text className="text-neutral-800 text-lg font-bold text-center">
              Aún no tienes rutinas
            </Text>
            <Text className="text-neutral-500 text-sm text-center mt-1 mb-5">
              Crea tu primera rutina de entrenamiento con ejercicios y series personalizadas.
            </Text>
            <TouchableOpacity
              onPress={abrirModalCrear}
              className="bg-orange-500 px-5 py-3 rounded-xl active:bg-orange-600 shadow-xs"
            >
              <Text className="text-white font-bold text-sm">
                + Crear mi primera rutina
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 9. MODAL CREAR/EDITAR RUTINA
          Se monta siempre pero solo es visible cuando modalVisible=true
          Props:
            - visible: controla si se muestra
            - rutinaAEditar: null=crear, Rutina=editar
            - alGuardar: callback que recibe la rutina guardada
            - alCerrar: callback que se llama al cancelar */}
      <ModalRutina
        visible={modalVisible}
        rutinaAEditar={rutinaAEditar}
        alGuardar={guardarRutina}
        alCerrar={() => {
          setModalVisible(false);
          setRutinaAEditar(null);
        }}
      />

      {/* 10. MENÚ DE OPCIONES (···)
          Modal de tipo "bottom sheet" (slide desde abajo)
          transparent=true: el fondo negro semitransparente es parte del Modal
          Pressable exterior cierra el menú al presionar fuera */}
      <Modal
        visible={menuOpcionesVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpcionesVisible(false)} // Botón "atrás" de Android
      >
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setMenuOpcionesVisible(false)} // Cerrar al presionar afuera
        >
          <View className="bg-white border-t border-neutral-200 rounded-t-3xl p-5 pb-8 shadow-2xl">
            <Text className="text-neutral-400 text-center text-xs font-bold uppercase mb-4">
              Opciones: {rutinaSeleccionada?.nombre}
              {/* ?. (optional chaining): accede a .nombre solo si rutinaSeleccionada no es null */}
            </Text>

            {/* Opción: Editar */}
            <TouchableOpacity
              onPress={() => {
                if (rutinaSeleccionada) abrirModalEditar(rutinaSeleccionada);
              }}
              className="flex-row items-center py-3.5 px-3 border-b border-neutral-100"
            >
              <Ionicons name="create-outline" size={22} color="#1F2937" />
              <Text className="text-neutral-800 font-bold text-base ml-3">
                Editar Rutina y Ejercicios
              </Text>
            </TouchableOpacity>

            {/* Opción: Eliminar (texto en rojo) */}
            <TouchableOpacity
              onPress={() => {
                if (rutinaSeleccionada) eliminarRutina(rutinaSeleccionada);
              }}
              className="flex-row items-center py-3.5 px-3 border-b border-neutral-100"
            >
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
              <Text className="text-red-500 font-bold text-base ml-3">
                Eliminar Rutina
              </Text>
            </TouchableOpacity>

            {/* Opción: Cancelar */}
            <TouchableOpacity
              onPress={() => setMenuOpcionesVisible(false)}
              className="mt-4 bg-neutral-100 py-3 rounded-xl items-center active:bg-neutral-200"
            >
              <Text className="text-neutral-600 font-semibold text-base">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
