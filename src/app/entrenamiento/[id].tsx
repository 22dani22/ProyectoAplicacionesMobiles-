/**
 * entrenamiento/[id].tsx — Pantalla de Entrenamiento en curso
 *
 * 📌 ¿QUÉ HACE ESTA PANTALLA?
 * Se abre al presionar "Empezar Rutina" en Entrenos.
 * El [id] del nombre del archivo es una ruta dinámica de Expo Router:
 * /entrenamiento/abc123 → id = "abc123" (el id de la rutina en Firestore).
 *
 * Permite:
 *   - Ver un cronómetro con el tiempo transcurrido
 *   - Editar el peso y las repeticiones de cada serie (solo números)
 *   - Eliminar series (✕) que no se van a hacer
 *   - Marcar / desmarcar cada serie como completada (✓)
 *   - Ver el progreso (series completadas / totales)
 *   - Finalizar → guarda la sesión en users/{uid}/entrenamientos
 *   - Salir sin terminar → pide confirmación y no guarda nada
 *
 * Lo que se edita o elimina aquí SOLO queda en el historial de esta sesión:
 * la rutina original no cambia.
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { useRutinas } from "@/hooks/useRutinas";
import { guardarEntrenamiento } from "@/hooks/useEntrenamientos";
import { obtenerImagenEjercicio } from "@/store/exercises.store";
import type { Serie } from "@/store/routines.store";
import { CampoNumero } from "@/components/CampoNumero";
import {
  fechaHoy,
  formatearCronometro,
  mensajeErrorFirebase,
  pesoValido,
  repsValidas,
  validarEjercicios,
} from "@/lib/utils";
import { avisar, confirmar } from "@/lib/dialogos";

/** Clave única de una serie dentro de la sesión: "ejercicioId:serieId" */
const claveSerie = (ejercicioId: string, serieId: string) => `${ejercicioId}:${serieId}`;

/** Cambios hechos durante la sesión a una serie (peso y/o reps) */
type CambioSerie = { peso?: number; repeticiones?: number };

export default function PantallaEntrenamiento() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { rutinas, cargando } = useRutinas(user?.uid);

  const rutina = rutinas.find((r) => r.id === id);

  // ──────────────────────────────────────────
  // ESTADO
  // ──────────────────────────────────────────

  // Momento en que empezó el entrenamiento (se fija una sola vez)
  const [inicio] = useState(() => Date.now());
  const [segundos, setSegundos] = useState(0);

  // Conjunto de series marcadas como completadas (claves "ejercicioId:serieId")
  const [completadas, setCompletadas] = useState<Set<string>>(() => new Set());

  // Peso / reps editados en esta sesión. Si una serie no está aquí,
  // se usan los valores originales de la rutina.
  const [cambios, setCambios] = useState<Record<string, CambioSerie>>({});

  // Series eliminadas en esta sesión (claves "ejercicioId:serieId")
  const [eliminadas, setEliminadas] = useState<Set<string>>(() => new Set());

  // Cronómetro: recalcula cada segundo a partir de la hora de inicio
  useEffect(() => {
    const intervalo = setInterval(() => {
      setSegundos(Math.floor((Date.now() - inicio) / 1000));
    }, 1000);
    return () => clearInterval(intervalo);
  }, [inicio]);

  /** Valores actuales de una serie: lo editado en la sesión o lo de la rutina */
  const valoresSerie = (ejercicioId: string, serie: Serie) => {
    const cambio = cambios[claveSerie(ejercicioId, serie.id)];
    return {
      peso: cambio?.peso ?? serie.peso,
      repeticiones: cambio?.repeticiones ?? serie.repeticiones,
    };
  };

  // Ejercicios tal como están en la sesión — es lo que se muestra, se valida y se guarda:
  //   1. sin las series eliminadas
  //   2. renumeradas (1, 2, 3...)
  //   3. con el peso / reps editados
  const ejercicios = (rutina?.ejercicios ?? []).map((ej) => ({
    ...ej,
    series: ej.series
      .filter((s) => !eliminadas.has(claveSerie(ej.id, s.id)))
      .map((s, indice) => ({ ...s, ...valoresSerie(ej.id, s), numeroSerie: indice + 1 })),
  }));
  const seriesTotales = ejercicios.reduce((total, ej) => total + ej.series.length, 0);
  const seriesCompletadas = completadas.size;
  const progreso = seriesTotales > 0 ? seriesCompletadas / seriesTotales : 0;

  // ──────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────

  /** Marca o desmarca una serie */
  const alternarSerie = (clave: string) => {
    setCompletadas((anterior) => {
      const nuevo = new Set(anterior);
      if (nuevo.has(clave)) nuevo.delete(clave);
      else nuevo.add(clave);
      return nuevo;
    });
  };

  /** Guarda el nuevo peso o reps de una serie (solo en esta sesión) */
  const editarSerie = (clave: string, cambio: CambioSerie) => {
    setCambios((anterior) => ({ ...anterior, [clave]: { ...anterior[clave], ...cambio } }));
  };

  /**
   * Quita una serie de esta sesión (la rutina original no cambia).
   * Si estaba completada, también deja de contar en el progreso.
   */
  const eliminarSerie = (ejercicioId: string, clave: string) => {
    const ejercicio = ejercicios.find((ej) => ej.id === ejercicioId);
    if (ejercicio && ejercicio.series.length <= 1) {
      avisar("Aviso", "El ejercicio debe tener al menos una serie.");
      return;
    }
    setEliminadas((anterior) => new Set(anterior).add(clave));
    setCompletadas((anterior) => {
      const nuevo = new Set(anterior);
      nuevo.delete(clave);
      return nuevo;
    });
  };

  /** Sale sin guardar; si ya marcó series, pide confirmación */
  const salir = () => {
    if (seriesCompletadas === 0) {
      router.back();
      return;
    }
    confirmar({
      titulo: "Abandonar entrenamiento",
      mensaje: "Tu progreso de esta sesión no se guardará. ¿Quieres salir?",
      textoConfirmar: "Salir",
      destructivo: true,
      alConfirmar: () => router.back(),
    });
  };

  // Botón "atrás" físico de Android → misma lógica que el botón de cerrar
  useEffect(() => {
    const suscripcion = BackHandler.addEventListener("hardwareBackPress", () => {
      salir();
      return true; // true = ya lo manejamos nosotros
    });
    return () => suscripcion.remove();
  });

  /** Valida, guarda la sesión en Firestore y vuelve a Entrenos */
  const finalizar = () => {
    if (!rutina) return;
    if (seriesCompletadas === 0) {
      avisar(
        "Sin series completadas",
        "Marca al menos una serie para finalizar el entrenamiento."
      );
      return;
    }

    // Revisa peso y reps de todas las series (los campos en rojo)
    const errorSeries = validarEjercicios(ejercicios);
    if (errorSeries) {
      avisar("Revisa las series", errorSeries);
      return;
    }

    const pendientes = seriesTotales - seriesCompletadas;
    confirmar({
      titulo: "Finalizar entrenamiento",
      mensaje:
        `Completaste ${seriesCompletadas} de ${seriesTotales} series en ${formatearCronometro(segundos)}.` +
        (pendientes > 0 ? `\nQuedan ${pendientes} series sin marcar.` : "\n¡Rutina completa! 💪"),
      textoConfirmar: "Finalizar",
      alConfirmar: () => {
        // Igual que en Entrenos: se guarda en segundo plano y se vuelve al instante
        guardarEntrenamiento(user?.uid, {
          rutinaId: rutina.id,
          rutinaNombre: rutina.nombre,
          fecha: fechaHoy(),
          duracionSegundos: Math.floor((Date.now() - inicio) / 1000),
          seriesCompletadas,
          seriesTotales,
          ejercicios: ejercicios.map((ej) => ({
            nombre: ej.nombre,
            catalogoId: ej.catalogoId ?? null,
            series: ej.series.map((s) => ({
              numeroSerie: s.numeroSerie,
              peso: s.peso,
              repeticiones: s.repeticiones,
              completada: completadas.has(claveSerie(ej.id, s.id)),
            })),
          })),
        }).catch((e) => avisar("Error al guardar", mensajeErrorFirebase(e)));
        router.back();
      },
    });
  };

  // ──────────────────────────────────────────
  // ESTADOS ESPECIALES: cargando / rutina no encontrada
  // ──────────────────────────────────────────

  if (cargando) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="mt-3 text-sm text-neutral-500">Cargando rutina...</Text>
      </SafeAreaView>
    );
  }

  if (!rutina) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50 px-8">
        <Ionicons name="alert-circle-outline" size={40} color="#9CA3AF" />
        <Text className="mt-3 text-center text-lg font-bold text-neutral-800">
          No se encontró la rutina
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-5 rounded-xl bg-orange-500 px-5 py-3 active:bg-orange-600"
        >
          <Text className="font-bold text-white">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ──────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top", "left", "right", "bottom"]}>
      {/* CABECERA: cerrar, nombre de la rutina y cronómetro */}
      <View className="flex-row items-center justify-between border-b border-neutral-200 bg-white px-4 py-3">
        <TouchableOpacity onPress={salir} className="p-1">
          <Ionicons name="close" size={26} color="#1F2937" />
        </TouchableOpacity>

        <View className="mx-3 flex-1 items-center">
          <Text className="text-lg font-black text-neutral-900" numberOfLines={1}>
            {rutina.nombre}
          </Text>
          <View className="mt-0.5 flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#EA580C" />
            <Text className="ml-1 text-sm font-semibold text-orange-600">
              {formatearCronometro(segundos)}
            </Text>
          </View>
        </View>

        {/* Espaciador del mismo ancho que el botón cerrar, para centrar el título */}
        <View style={{ width: 34 }} />
      </View>

      {/* BARRA DE PROGRESO */}
      <View className="bg-white px-4 pb-3 pt-2">
        <View className="mb-1.5 flex-row justify-between">
          <Text className="text-xs font-semibold text-neutral-500">Progreso</Text>
          <Text className="text-xs font-bold text-neutral-700">
            {seriesCompletadas} / {seriesTotales} series
          </Text>
        </View>
        <View className="h-2 overflow-hidden rounded-full bg-neutral-200">
          <View
            className="h-2 rounded-full bg-orange-500"
            style={{ width: `${Math.round(progreso * 100)}%` }}
          />
        </View>
      </View>

      {/* KeyboardAvoidingView: evita que el teclado tape los campos de peso/reps */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* LISTA DE EJERCICIOS Y SERIES */}
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {ejercicios.length === 0 && (
            <View className="items-center rounded-2xl border border-dashed border-neutral-300 bg-white p-8">
              <Ionicons name="barbell-outline" size={28} color="#EA580C" />
              <Text className="mt-2 text-center text-sm text-neutral-500">
                Esta rutina no tiene ejercicios. Edítala desde Entrenos para agregarlos.
              </Text>
            </View>
          )}

          {ejercicios.map((ej) => {
            const imagen = obtenerImagenEjercicio(ej.catalogoId);
            const hechasEjercicio = ej.series.filter((s) =>
              completadas.has(claveSerie(ej.id, s.id))
            ).length;

            return (
              <View
                key={ej.id}
                className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4"
              >
                {/* Encabezado del ejercicio */}
                <View className="mb-3 flex-row items-center">
                  {imagen ? (
                    <Image
                      source={imagen}
                      style={{ width: 40, height: 40, borderRadius: 10 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                      <Ionicons name="barbell-outline" size={20} color="#EA580C" />
                    </View>
                  )}
                  <View className="ml-3 flex-1">
                    <Text className="text-base font-bold text-neutral-900" numberOfLines={1}>
                      {ej.nombre}
                    </Text>
                    <Text className="text-xs text-neutral-400">
                      {hechasEjercicio} / {ej.series.length} series
                    </Text>
                  </View>
                </View>

                {/* Cabecera de la tabla de series */}
                <View className="mb-1 flex-row px-2">
                  <Text className="w-10 text-xs font-bold uppercase text-neutral-400">Serie</Text>
                  <Text className="flex-1 text-center text-xs font-bold uppercase text-neutral-400">
                    Kg
                  </Text>
                  <Text className="flex-1 text-center text-xs font-bold uppercase text-neutral-400">
                    Reps
                  </Text>
                  <Text className="w-11 text-center text-xs font-bold uppercase text-neutral-400">
                    ✓
                  </Text>
                  <View className="w-8" />{/* Espacio para el botón ✕ */}
                </View>

                {/* Filas de series: peso y reps editables + check */}
                {ej.series.map((s) => {
                  const clave = claveSerie(ej.id, s.id);
                  const hecha = completadas.has(clave);
                  return (
                    <View
                      key={s.id}
                      className={`mb-1.5 flex-row items-center rounded-xl px-2 py-1.5 ${
                        hecha ? "bg-green-100" : "bg-neutral-50"
                      }`}
                    >
                      <Text
                        className={`w-10 font-bold ${hecha ? "text-green-700" : "text-neutral-700"}`}
                      >
                        {s.numeroSerie}
                      </Text>

                      <CampoNumero
                        decimal
                        valor={s.peso}
                        invalido={!pesoValido(s.peso)}
                        alCambiar={(peso) => editarSerie(clave, { peso })}
                        className="mx-1 flex-1"
                      />

                      <CampoNumero
                        valor={s.repeticiones}
                        invalido={!repsValidas(s.repeticiones)}
                        alCambiar={(repeticiones) => editarSerie(clave, { repeticiones })}
                        className="mx-1 flex-1"
                      />

                      {/* Check: marca / desmarca la serie */}
                      <TouchableOpacity
                        onPress={() => alternarSerie(clave)}
                        hitSlop={6}
                        className="w-11 items-center"
                      >
                        <View
                          className={`h-8 w-8 items-center justify-center rounded-lg ${
                            hecha ? "bg-green-500" : "border-2 border-neutral-300 bg-white"
                          }`}
                        >
                          {hecha && <Ionicons name="checkmark" size={20} color="#FFFFFF" />}
                        </View>
                      </TouchableOpacity>

                      {/* Eliminar la serie de esta sesión */}
                      <TouchableOpacity
                        onPress={() => eliminarSerie(ej.id, clave)}
                        hitSlop={6}
                        className="w-8 items-center"
                      >
                        <Ionicons name="close" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {ej.series.length === 0 && (
                  <Text className="px-2 text-xs italic text-neutral-400">Sin series</Text>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* BOTÓN FINALIZAR (fijo abajo) */}
        <View className="border-t border-neutral-200 bg-white px-4 py-3">
          <TouchableOpacity
            onPress={finalizar}
            className="items-center rounded-xl bg-orange-500 py-3.5 active:bg-orange-600"
          >
            <Text className="text-base font-bold text-white">Finalizar entrenamiento</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
