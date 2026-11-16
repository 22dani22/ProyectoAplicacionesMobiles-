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
 *   [Eliminar] → abrirMenuOpciones() → eliminarRutina() → confirmación
 *                borra el documento en Firestore
 *
 *   [Empezar Rutina] → router.push("/entrenamiento/<id>")
 *                      abre la pantalla de entrenamiento en curso
 *                      (src/app/entrenamiento/[id].tsx)
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,  // Botón que se oscurece al presionar
  Modal,             // Ventana flotante encima del contenido
  Pressable,         // Área presionable más flexible que TouchableOpacity
  ActivityIndicator, // Spinner de carga
} from "react-native";

// SafeAreaView: respeta los bordes seguros del dispositivo (notch, barra de estado)
import { SafeAreaView } from "react-native-safe-area-context";

// expo-image: reemplazo optimizado de <Image> de React Native
// Soporta caché, transiciones, formatos modernos (WebP, AVIF)
import { Image } from "expo-image";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Tipos del store de rutinas
import { Rutina } from "../../store/routines.store";
import { obtenerImagenEjercicio } from "../../store/exercises.store";

// Componente Modal para crear/editar rutinas (definido en components/)
import { ModalRutina } from "../../components/RoutineModal";

// Sesión del usuario y CRUD de rutinas en Firestore
import { useAuth } from "@/context/AuthContext";
import { useRutinas } from "@/hooks/useRutinas";
import { mensajeErrorFirebase } from "@/lib/utils";
import { avisar, confirmar } from "@/lib/dialogos";

export default function PantallaEntrenos() {
  // ──────────────────────────────────────────
  // DATOS DE FIRESTORE
  // useRutinas escucha users/{uid}/rutinas en tiempo real
  // ──────────────────────────────────────────
  const { user } = useAuth();
  const {
    rutinas,
    cargando,
    error,
    crearRutina,
    actualizarRutina,
    eliminarRutina: eliminarRutinaFirestore,
  } = useRutinas(user?.uid);

  const mostrarError = (e: unknown) =>
    avisar("Error al guardar", mensajeErrorFirebase(e));

  // ──────────────────────────────────────────
  // ESTADO LOCAL (solo de la interfaz)
  // ──────────────────────────────────────────

  // Controla si el modal de crear/editar está visible
  const [modalVisible, setModalVisible] = useState(false);

  // Rutina que se está editando. null = estamos creando una nueva
  const [rutinaAEditar, setRutinaAEditar] = useState<Rutina | null>(null);

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
   * Guarda la rutina recibida desde el ModalRutina en Firestore.
   * Si `rutinaAEditar` existe → actualiza el documento
   * Si `rutinaAEditar` es null → crea un documento nuevo
   * El modal se cierra al instante: Firestore actualiza la lista localmente
   * y sincroniza con el servidor en segundo plano.
   */
  const guardarRutina = (rutinaGuardada: Rutina) => {
    const operacion = rutinaAEditar
      ? actualizarRutina(rutinaGuardada)
      : crearRutina(rutinaGuardada);
    operacion.catch(mostrarError);
    setModalVisible(false);
    setRutinaAEditar(null);
  };

  /**
   * Elimina la rutina seleccionada tras confirmación.
   * Borra el documento en Firestore; la lista se actualiza sola.
   */
  const eliminarRutina = (rutina: Rutina) => {
    setMenuOpcionesVisible(false);
    confirmar({
      titulo: "Eliminar Rutina",
      mensaje: `¿Estás seguro de que deseas eliminar "${rutina.nombre}"?`,
      textoConfirmar: "Eliminar",
      destructivo: true, // Muestra el botón en rojo en iOS
      alConfirmar: () => {
        eliminarRutinaFirestore(rutina.id).catch(mostrarError);
      },
    });
  };

  /** Abre la pantalla de entrenamiento en curso para esa rutina */
  const empezarRutina = (rutina: Rutina) => {
    router.push({ pathname: "/entrenamiento/[id]", params: { id: rutina.id } });
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
        <View className="mb-5 mt-1">
          <Text className="text-neutral-900 text-2xl font-black tracking-tight">
            Entrenamiento
          </Text>
        </View>

        {/* 2. CABECERA DE LA SECCIÓN "RUTINAS" */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-neutral-900 text-xl font-bold">Rutinas</Text>
          <TouchableOpacity onPress={abrirModalCrear} className="p-1">
            <Ionicons name="folder-outline" size={22} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* 3. BOTÓN "NUEVA RUTINA" → abre el modal de creación */}
        <View className="mb-5">
          <TouchableOpacity
            onPress={abrirModalCrear}
            className="bg-white border border-neutral-200 rounded-2xl p-4 flex-row items-center active:bg-neutral-50"
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
        </View>

        {/* 4. CONTADOR DE RUTINAS */}
        <View className="flex-row items-center mb-3">
          <Ionicons name="caret-down" size={14} color="#6B7280" />
          {/* rutinas.length → cantidad de rutinas en el array */}
          <Text className="text-neutral-500 font-semibold text-sm ml-1.5">
            Mis rutinas ({rutinas.length})
          </Text>
        </View>

        {/* 5. LISTA DE TARJETAS DE RUTINAS
            map(): recorre el array y devuelve un componente por cada elemento
            key={rutina.id}: prop obligatoria en listas para que React identifique cada elemento */}
        {rutinas.map((rutina) => (
          <View
            key={rutina.id}
            className="bg-white border border-neutral-200 rounded-2xl p-4 mb-4"
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
                  {obtenerImagenEjercicio(ej.catalogoId) ? (
                    <Image
                      source={obtenerImagenEjercicio(ej.catalogoId)}
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

            {/* Botón principal → abre la pantalla de entrenamiento */}
            <TouchableOpacity
              onPress={() => empezarRutina(rutina)}
              className="bg-orange-500 py-3 rounded-xl items-center justify-center active:bg-orange-600"
            >
              <Text className="text-white font-bold text-base">
                Empezar Rutina
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* 6. ESTADO VACÍO
            Solo se renderiza si rutinas.length === 0
            Buena práctica: siempre mostrar algo cuando la lista está vacía */}
        {/* Cargando desde Firestore */}
        {cargando && (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="mt-3 text-sm text-neutral-500">Cargando tus rutinas...</Text>
          </View>
        )}

        {/* Error de conexión o de permisos */}
        {!cargando && error ? (
          <View className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
            <Text className="font-bold text-red-700">No se pudieron cargar las rutinas</Text>
            <Text className="mt-1 text-sm text-red-600">{mensajeErrorFirebase(error)}</Text>
          </View>
        ) : null}

        {!cargando && !error && rutinas.length === 0 && (
          <View className="bg-white border border-dashed border-neutral-300 rounded-2xl p-8 items-center justify-center my-3">
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
              className="bg-orange-500 px-5 py-3 rounded-xl active:bg-orange-600"
            >
              <Text className="text-white font-bold text-sm">
                + Crear mi primera rutina
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 7. MODAL CREAR/EDITAR RUTINA
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

      {/* 8. MENÚ DE OPCIONES (···)
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
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onPress={() => setMenuOpcionesVisible(false)} // Cerrar al presionar afuera
        >
          <View
            className="bg-white border-t border-neutral-200 rounded-t-3xl p-5 pb-8"
            style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
          >
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
