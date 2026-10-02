/**
 * RoutineModal.tsx — Modal para Crear y Editar Rutinas
 *
 * 📌 ¿QUÉ HACE ESTE COMPONENTE?
 * Es un formulario modal (ventana flotante) para gestionar rutinas.
 * Permite:
 *   - Nombrar la rutina
 *   - Agregar ejercicios desde el catálogo (ExercisePickerModal)
 *   - Agregar, editar y eliminar series (peso y repeticiones) por ejercicio
 *   - Guardar o cancelar los cambios
 *
 * 📌 ¿QUÉ SON LAS PROPS (PropiedadesModalRutina)?
 * Las props son los parámetros que el componente padre (entrenos.tsx)
 * le pasa a este componente al usarlo:
 *
 *   <ModalRutina
 *     visible={...}       → boolean: mostrar u ocultar
 *     rutinaAEditar={...} → Rutina | null: datos a precargar (null = nueva)
 *     alGuardar={...}     → función callback al guardar
 *     alCerrar={...}      → función callback al cancelar
 *   />
 *
 * 📌 ¿QUÉ ES UN CALLBACK?
 * Un callback es una función que el padre le da al hijo para que el hijo
 * la llame cuando ocurre algo. Así el hijo puede "comunicarse" con el padre.
 * Ejemplo: cuando el usuario presiona "Guardar", este componente llama
 * a `alGuardar(rutinaGuardada)` para que entrenos.tsx actualice su estado.
 *
 * 📌 ¿POR QUÉ useEffect?
 * useEffect se ejecuta cuando cambian las dependencias del array final [].
 * Aquí se usa para precargar los datos cuando la rutina a editar cambia,
 * o resetear el formulario cuando se abre en modo "crear".
 */

import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,          // Campo de texto editable
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView, // Sube el contenido cuando aparece el teclado
  Platform,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

// Tipos de datos del store de rutinas
import { Rutina, Ejercicio, Serie } from "../store/routines.store";

// Tipo e instancia del catálogo de ejercicios
import { EjercicioCatalogo, catalogoEjercicios } from "../store/exercises.store";

// Modal selector de ejercicios (catálogo con imágenes)
import { ModalSelectorEjercicio } from "./ExercisePickerModal";

// ──────────────────────────────────────────
// INTERFAZ DE PROPS
// Define qué valores acepta este componente desde el exterior
// ──────────────────────────────────────────
interface PropiedadesModalRutina {
  visible: boolean;               // Controla si el Modal se muestra
  rutinaAEditar: Rutina | null;   // null = crear nueva, Rutina = editar existente
  alGuardar: (rutina: Rutina) => void; // Callback al confirmar
  alCerrar: () => void;               // Callback al cancelar
}

export function ModalRutina({
  visible,
  rutinaAEditar,
  alGuardar,
  alCerrar,
}: PropiedadesModalRutina) {

  // ──────────────────────────────────────────
  // ESTADO INTERNO DEL FORMULARIO
  // ──────────────────────────────────────────

  // Texto del nombre de la rutina
  const [nombre, setNombre] = useState("");

  // Lista de ejercicios en el formulario (copia editable)
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);

  // Controla si se muestra el modal selector de ejercicios del catálogo
  const [selectorVisible, setSelectorVisible] = useState(false);

  // ──────────────────────────────────────────
  // HANDLERS DE EJERCICIOS
  // ──────────────────────────────────────────

  const prepararFormulario = (siguienteRutina: Rutina | null) => {
    if (siguienteRutina) {
      setNombre(siguienteRutina.nombre);
      setEjercicios(JSON.parse(JSON.stringify(siguienteRutina.ejercicios)));
      return;
    }

    setNombre("");

    if (catalogoEjercicios.length > 0) {
      const primerEjercicio = catalogoEjercicios[0];
      setEjercicios([
        {
          id: Date.now().toString(),
          nombre: primerEjercicio.nombre,
          detalle: primerEjercicio.detalle,
          imagen: primerEjercicio.imagen,
          series: [
            { id: "s-1", numeroSerie: 1, peso: 20, repeticiones: 10 },
            { id: "s-2", numeroSerie: 2, peso: 20, repeticiones: 10 },
            { id: "s-3", numeroSerie: 3, peso: 20, repeticiones: 10 },
          ],
        },
      ]);
      return;
    }

    setEjercicios([]);
  };

  /**
   * Se llama cuando el usuario selecciona un ejercicio en el catálogo.
   * Crea un nuevo objeto Ejercicio con 3 series iniciales y lo agrega a la lista.
   * Date.now() + Math.random() asegura un id único incluso si se agrega rápido.
   */
  const alSeleccionarEjercicio = (item: EjercicioCatalogo) => {
    const nuevoEjercicio: Ejercicio = {
      id: Date.now().toString() + Math.random(),
      nombre: item.nombre,
      detalle: item.detalle,
      imagen: item.imagen,
      series: [
        { id: "s-1", numeroSerie: 1, peso: 20, repeticiones: 10 },
        { id: "s-2", numeroSerie: 2, peso: 20, repeticiones: 10 },
        { id: "s-3", numeroSerie: 3, peso: 20, repeticiones: 10 },
      ],
    };
    // Spread operator: crea un nuevo array con todos los ejercicios anteriores + el nuevo
    setEjercicios((previos) => [...previos, nuevoEjercicio]);
  };

  /**
   * Elimina un ejercicio de la lista por su id.
   * Regla: la rutina debe tener al menos 1 ejercicio.
   */
  const eliminarEjercicio = (idEjercicio: string) => {
    if (ejercicios.length === 1) {
      Alert.alert("Aviso", "La rutina debe tener al menos un ejercicio.");
      return;
    }
    setEjercicios(ejercicios.filter((ej) => ej.id !== idEjercicio));
  };

  // ──────────────────────────────────────────
  // HANDLERS DE SERIES
  // Patrón común: map() sobre ejercicios, modificar solo el que coincide por id
  // ──────────────────────────────────────────

  /**
   * Agrega una nueva serie al ejercicio indicado.
   * Copia el peso y reps de la última serie para facilitar el ingreso.
   */
  const agregarSerie = (idEjercicio: string) => {
    setEjercicios(
      ejercicios.map((ej) => {
        if (ej.id === idEjercicio) {
          const siguienteNumero = ej.series.length + 1;
          // Toma el peso/reps de la última serie como valor inicial
          const ultimaSerie = ej.series[ej.series.length - 1];
          const nuevaSerie: Serie = {
            id: Date.now().toString() + Math.random(),
            numeroSerie: siguienteNumero,
            peso: ultimaSerie ? ultimaSerie.peso : 20,
            repeticiones: ultimaSerie ? ultimaSerie.repeticiones : 10,
          };
          // Retorna el ejercicio con la nueva serie al final
          return { ...ej, series: [...ej.series, nuevaSerie] };
        }
        return ej; // Ejercicios que no coinciden no se modifican
      })
    );
  };

  /**
   * Elimina una serie de un ejercicio por id.
   * Renumera automáticamente las series restantes (1, 2, 3...).
   */
  const eliminarSerie = (idEjercicio: string, idSerie: string) => {
    setEjercicios(
      ejercicios.map((ej) => {
        if (ej.id === idEjercicio) {
          if (ej.series.length === 1) {
            Alert.alert("Aviso", "El ejercicio debe tener al menos una serie.");
            return ej; // Devuelve el ejercicio sin cambios
          }
          const seriesFiltradas = ej.series.filter((s) => s.id !== idSerie);
          // map con índice para renumerar: índice 0 → serie 1, índice 1 → serie 2...
          const seriesRenumeradas = seriesFiltradas.map((s, indice) => ({
            ...s,
            numeroSerie: indice + 1,
          }));
          return { ...ej, series: seriesRenumeradas };
        }
        return ej;
      })
    );
  };

  /**
   * Actualiza el peso de una serie específica.
   * parseFloat(): convierte el texto del TextInput a número decimal.
   * || 0: si no es un número válido, usa 0 como valor seguro.
   */
  const actualizarPesoSerie = (
    idEjercicio: string,
    idSerie: string,
    textoPeso: string
  ) => {
    const valorPeso = parseFloat(textoPeso) || 0;
    setEjercicios(
      ejercicios.map((ej) => {
        if (ej.id === idEjercicio) {
          return {
            ...ej,
            // Spread operator: actualiza solo la serie con ese id
            series: ej.series.map((s) =>
              s.id === idSerie ? { ...s, peso: valorPeso } : s
            ),
          };
        }
        return ej;
      })
    );
  };

  /**
   * Actualiza las repeticiones de una serie específica.
   * parseInt(texto, 10): convierte texto a entero en base 10.
   */
  const actualizarRepeticionesSerie = (
    idEjercicio: string,
    idSerie: string,
    textoReps: string
  ) => {
    const valorReps = parseInt(textoReps, 10) || 0;
    setEjercicios(
      ejercicios.map((ej) => {
        if (ej.id === idEjercicio) {
          return {
            ...ej,
            series: ej.series.map((s) =>
              s.id === idSerie ? { ...s, repeticiones: valorReps } : s
            ),
          };
        }
        return ej;
      })
    );
  };

  /**
   * Valida el formulario y llama al callback alGuardar del padre.
   * Si rutinaAEditar existe → conserva su id (editar)
   * Si no → genera un id nuevo con Date.now() (crear)
   */
  const guardarRutina = () => {
    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "Por favor ingresa un nombre para la rutina.");
      return;
    }

    if (ejercicios.length === 0) {
      Alert.alert("Campo requerido", "Agrega al menos un ejercicio a la rutina.");
      return;
    }

    const rutinaGuardada: Rutina = {
      id: rutinaAEditar ? rutinaAEditar.id : Date.now().toString(),
      nombre: nombre.trim(), // trim() elimina espacios en blanco al inicio y final
      ejercicios,
    };

    alGuardar(rutinaGuardada); // Llama al callback del padre con la rutina lista
  };

  // ──────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────

  return (
    // Fragment: necesario porque devolvemos 2 Modals distintos
    <>
      {/* MODAL PRINCIPAL: Crear/Editar Rutina
          animationType="slide" → entra desde abajo
          transparent → el fondo negro es parte del JSX, no del Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onShow={() => prepararFormulario(rutinaAEditar)}
      >
        {/*
         * KeyboardAvoidingView: empuja el contenido hacia arriba
         * cuando el teclado del celular aparece.
         * behavior diferente por plataforma:
         *   iOS → "padding" (añade padding)
         *   Android → "height" (reduce la altura)
         */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-end"
        >
          {/* Contenedor principal del modal (hoja inferior) */}
          <View className="bg-white rounded-t-3xl max-h-[90%] border-t border-neutral-200 shadow-xl">

            {/* CABECERA: Cancelar | Título | Guardar */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-neutral-200">
              <TouchableOpacity onPress={alCerrar} className="p-1">
                <Text className="text-neutral-500 font-semibold text-base">
                  Cancelar
                </Text>
              </TouchableOpacity>

              {/* Título dinámico según el modo */}
              <Text className="text-neutral-900 text-lg font-bold">
                {rutinaAEditar ? "Editar Rutina" : "Nueva Rutina"}
              </Text>

              <TouchableOpacity
                onPress={guardarRutina}
                className="bg-orange-500 px-4 py-1.5 rounded-full active:bg-orange-600"
              >
                <Text className="text-white font-bold text-sm">Guardar</Text>
              </TouchableOpacity>
            </View>

            {/* CUERPO CON SCROLL
                keyboardShouldPersistTaps="handled":
                permite que los botones funcionen sin cerrar el teclado antes */}
            <ScrollView
              className="p-5"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* INPUT: Nombre de la rutina */}
              <View className="mb-5">
                <Text className="text-neutral-600 text-xs font-bold uppercase tracking-wider mb-2">
                  Nombre de la rutina
                </Text>
                {/* TextInput: campo de texto controlado
                    value={nombre} → valor actual del estado
                    onChangeText={setNombre} → actualiza el estado en cada tecla */}
                <TextInput
                  className="bg-neutral-50 text-neutral-900 text-lg font-semibold px-4 py-3 rounded-xl border border-neutral-200"
                  placeholder="Ej: Pierna Intensa, Espalda y Bíceps..."
                  placeholderTextColor="#9CA3AF"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>

              {/* CABECERA DE EJERCICIOS + Botón "Agregar" */}
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-neutral-900 text-base font-bold">
                  Ejercicios ({ejercicios.length})
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectorVisible(true)}
                  className="flex-row items-center bg-orange-50 px-3 py-1.5 rounded-lg active:bg-orange-100"
                >
                  <Ionicons name="add" size={16} color="#EA580C" />
                  <Text className="text-orange-600 text-xs font-bold ml-1">
                    Agregar Ejercicio
                  </Text>
                </TouchableOpacity>
              </View>

              {/* LISTA DE EJERCICIOS con sus series */}
              {ejercicios.map((ejercicio, indice) => (
                <View
                  key={ejercicio.id}
                  className="mb-5 bg-neutral-50 p-4 rounded-2xl border border-neutral-200"
                >
                  {/* CABECERA DEL EJERCICIO: Imagen + Nombre + Botón Eliminar */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1 mr-2">
                      {ejercicio.imagen ? (
                        <Image
                          source={ejercicio.imagen}
                          style={{ width: 48, height: 48, borderRadius: 10 }}
                          contentFit="cover"
                        />
                      ) : (
                        <View className="w-12 h-12 rounded-xl bg-orange-100 items-center justify-center">
                          <Ionicons name="barbell-outline" size={24} color="#EA580C" />
                        </View>
                      )}

                      <View className="ml-3 flex-1">
                        <Text className="text-neutral-900 font-bold text-base">
                          {ejercicio.nombre}
                        </Text>
                        {ejercicio.detalle ? (
                          <Text
                            className="text-neutral-500 text-xs mt-0.5"
                            numberOfLines={1}
                          >
                            {ejercicio.detalle}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => eliminarEjercicio(ejercicio.id)}
                      className="p-1.5 rounded-lg bg-red-50"
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>

                  {/* TABLA DE SERIES: cabecera */}
                  <View className="flex-row items-center justify-between px-2 py-1.5 mb-1 bg-neutral-200/60 rounded-lg">
                    <Text className="text-neutral-600 text-xs font-bold w-12 text-center">
                      SERIE
                    </Text>
                    <Text className="text-neutral-600 text-xs font-bold flex-1 text-center">
                      KG (PESO)
                    </Text>
                    <Text className="text-neutral-600 text-xs font-bold flex-1 text-center">
                      REPS
                    </Text>
                    <View className="w-8" />{/* Espacio para el botón × */}
                  </View>

                  {/* FILAS DE SERIES
                      Cada fila tiene: número, input peso, input reps, botón × */}
                  {ejercicio.series.map((serie) => (
                    <View
                      key={serie.id}
                      className="flex-row items-center justify-between py-1.5 px-2 border-b border-neutral-200"
                    >
                      {/* Número de serie */}
                      <Text className="text-neutral-700 font-semibold text-sm w-12 text-center">
                        {serie.numeroSerie}
                      </Text>

                      {/* Input Peso:
                          keyboardType="numeric" → abre teclado numérico
                          value.toString() → convierte el número a string para el TextInput */}
                      <TextInput
                        className="bg-white text-neutral-900 text-center font-bold text-sm py-1.5 px-3 rounded-lg mx-1 flex-1 border border-neutral-200"
                        keyboardType="numeric"
                        value={serie.peso ? serie.peso.toString() : ""}
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        onChangeText={(val) =>
                          actualizarPesoSerie(ejercicio.id, serie.id, val)
                        }
                      />

                      {/* Input Repeticiones */}
                      <TextInput
                        className="bg-white text-neutral-900 text-center font-bold text-sm py-1.5 px-3 rounded-lg mx-1 flex-1 border border-neutral-200"
                        keyboardType="numeric"
                        value={serie.repeticiones ? serie.repeticiones.toString() : ""}
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        onChangeText={(val) =>
                          actualizarRepeticionesSerie(ejercicio.id, serie.id, val)
                        }
                      />

                      {/* Botón eliminar serie */}
                      <TouchableOpacity
                        onPress={() => eliminarSerie(ejercicio.id, serie.id)}
                        className="w-8 items-center justify-center py-1"
                      >
                        <Ionicons name="close" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Botón para agregar una nueva serie al ejercicio */}
                  <TouchableOpacity
                    onPress={() => agregarSerie(ejercicio.id)}
                    className="mt-3 flex-row items-center justify-center py-2 bg-white rounded-xl border border-neutral-200"
                  >
                    <Ionicons name="add" size={16} color="#EA580C" />
                    <Text className="text-orange-600 text-xs font-bold ml-1">
                      Agregar Serie
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Botón grande "Agregar Ejercicio desde el Catálogo" al pie */}
              <TouchableOpacity
                onPress={() => setSelectorVisible(true)}
                className="flex-row items-center justify-center py-3.5 bg-neutral-100 rounded-2xl border border-dashed border-neutral-300 mb-8 active:opacity-75"
              >
                <Ionicons name="add-circle-outline" size={20} color="#EA580C" />
                <Text className="text-neutral-900 font-bold text-sm ml-2">
                  + Agregar Ejercicio desde el Catálogo
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL SECUNDARIO: Selector de Ejercicios del Catálogo
          Se abre desde el botón "Agregar Ejercicio" dentro del modal principal.
          Al seleccionar un ejercicio, llama a `alSeleccionarEjercicio` */}
      <ModalSelectorEjercicio
        visible={selectorVisible}
        alCerrar={() => setSelectorVisible(false)}
        alSeleccionar={alSeleccionarEjercicio}
      />
    </>
  );
}
