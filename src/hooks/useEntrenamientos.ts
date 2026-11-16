/**
 * useEntrenamientos.ts — Historial de entrenamientos en Firestore
 *
 * Ruta: users/{uid}/entrenamientos/{entrenamientoId}
 *
 * Cada documento es el registro de UNA sesión de entrenamiento terminada:
 * qué rutina se hizo, cuándo, cuánto duró y qué series se completaron
 * (con el peso y las repeticiones que realmente se hicieron).
 *
 *   - guardarEntrenamiento(uid, datos) → crea un registro (al finalizar)
 *   - useEntrenamientos(uid)           → lista en tiempo real, más reciente primero
 */
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { validarEjercicios } from "@/lib/utils";

/** Una serie tal como se realizó en la sesión. */
export interface SerieRealizada {
  numeroSerie: number;
  peso: number;
  repeticiones: number;
  completada: boolean;
}

/** Un ejercicio de la sesión con el estado de cada serie. */
export interface EjercicioRealizado {
  nombre: string;
  catalogoId: string | null;
  series: SerieRealizada[];
}

/** Datos de un entrenamiento terminado. */
export interface EntrenamientoRealizado {
  rutinaId: string;
  rutinaNombre: string;
  fecha: string; // YYYY-MM-DD (fecha local)
  duracionSegundos: number;
  seriesCompletadas: number;
  seriesTotales: number;
  ejercicios: EjercicioRealizado[];
}

/** Entrenamiento leído desde Firestore (incluye su id). */
export interface EntrenamientoGuardado extends EntrenamientoRealizado {
  id: string;
}

/**
 * Guarda un entrenamiento terminado.
 * Segunda capa de validación antes de escribir en Firestore.
 */
export async function guardarEntrenamiento(
  uid: string | undefined,
  entrenamiento: EntrenamientoRealizado
) {
  if (!uid) return;

  const errorSeries = validarEjercicios(entrenamiento.ejercicios);
  if (errorSeries) throw new Error(errorSeries);

  const completadas = entrenamiento.ejercicios.reduce(
    (total, ej) => total + ej.series.filter((s) => s.completada).length,
    0
  );
  if (completadas === 0) throw new Error("El entrenamiento no tiene series completadas.");

  await addDoc(collection(db, "users", uid, "entrenamientos"), {
    ...entrenamiento,
    seriesCompletadas: completadas, // Se recalcula para que siempre sea coherente
    createdAt: serverTimestamp(),
  });
}

/** Escucha en tiempo real el historial del usuario (más reciente primero). */
export function useEntrenamientos(uid: string | undefined) {
  // Mismo patrón que useRutinas: "cargando" se deriva del uid de los datos
  const [estado, setEstado] = useState<{
    uid: string | null;
    entrenamientos: EntrenamientoGuardado[];
    error: unknown;
  }>({ uid: null, entrenamientos: [], error: null });

  const vigente = !!uid && estado.uid === uid;
  const entrenamientos = vigente ? estado.entrenamientos : [];
  const error = vigente ? estado.error : null;
  const cargando = !!uid && !vigente;

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "users", uid, "entrenamientos"),
      orderBy("createdAt", "desc")
    );
    const desuscribir = onSnapshot(
      q,
      (snap) => {
        const lista = snap.docs.map((d) => {
          const data = d.data({ serverTimestamps: "estimate" });
          return {
            id: d.id,
            rutinaId: data.rutinaId ?? "",
            rutinaNombre: data.rutinaNombre ?? "",
            fecha: data.fecha ?? "",
            duracionSegundos: data.duracionSegundos ?? 0,
            seriesCompletadas: data.seriesCompletadas ?? 0,
            seriesTotales: data.seriesTotales ?? 0,
            ejercicios: data.ejercicios ?? [],
          } as EntrenamientoGuardado;
        });
        setEstado({ uid, entrenamientos: lista, error: null });
      },
      (err) => setEstado({ uid, entrenamientos: [], error: err })
    );
    return desuscribir;
  }, [uid]);

  return { entrenamientos, cargando, error };
}
