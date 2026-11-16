/**
 * useRutinas.ts — CRUD de rutinas en Firestore (users/{uid}/rutinas)
 *
 * Usa onSnapshot: la lista se actualiza sola en tiempo real cuando se
 * crea, edita o elimina una rutina (también desde otro dispositivo).
 */
import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { MAX_NOMBRE_RUTINA, validarEjercicios, validarNombre } from "@/lib/utils";
import type { Rutina } from "@/store/routines.store";

/**
 * Valida y limpia la rutina antes de guardarla (sin id ni campos no serializables).
 * Segunda capa de validación: aunque la pantalla ya valida, aquí se vuelve
 * a revisar para que NUNCA llegue a Firestore un dato inválido.
 * Si algo falla lanza un Error; la pantalla lo muestra como aviso.
 */
function aDocumento(rutina: Rutina) {
  const errorNombre = validarNombre(rutina.nombre, "el nombre de la rutina", MAX_NOMBRE_RUTINA).error;
  if (errorNombre) throw new Error(errorNombre);
  if (rutina.ejercicios.length === 0) throw new Error("La rutina debe tener al menos un ejercicio.");
  const errorSeries = validarEjercicios(rutina.ejercicios);
  if (errorSeries) throw new Error(errorSeries);

  return {
    nombre: rutina.nombre,
    ejercicios: rutina.ejercicios.map((ej) => ({
      id: ej.id,
      nombre: ej.nombre,
      detalle: ej.detalle ?? "",
      catalogoId: ej.catalogoId ?? null,
      series: ej.series.map((s) => ({
        id: s.id,
        numeroSerie: s.numeroSerie,
        peso: s.peso,
        repeticiones: s.repeticiones,
      })),
    })),
  };
}

export function useRutinas(uid: string | undefined) {
  // Guardamos para qué usuario son los datos; así "cargando" se deriva
  // sin tener que reiniciar el estado dentro del efecto.
  const [estado, setEstado] = useState<{
    uid: string | null;
    rutinas: Rutina[];
    error: unknown;
  }>({ uid: null, rutinas: [], error: null });

  const vigente = !!uid && estado.uid === uid;
  const rutinas = vigente ? estado.rutinas : [];
  const error = vigente ? estado.error : null;
  const cargando = !!uid && !vigente;

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, "users", uid, "rutinas"), orderBy("createdAt", "desc"));
    const desuscribir = onSnapshot(
      q,
      // serverTimestamps "estimate": las rutinas recién creadas se ordenan bien
      // antes de que el servidor confirme la fecha
      (snap) => {
        const lista = snap.docs.map((d) => {
          const data = d.data({ serverTimestamps: "estimate" });
          return {
            id: d.id,
            nombre: data.nombre ?? "",
            ejercicios: data.ejercicios ?? [],
          } as Rutina;
        });
        setEstado({ uid, rutinas: lista, error: null });
      },
      (err) => setEstado({ uid, rutinas: [], error: err })
    );
    return desuscribir;
  }, [uid]);

  const crearRutina = async (rutina: Rutina) => {
    if (!uid) return;
    const ref = doc(collection(db, "users", uid, "rutinas"));
    await setDoc(ref, {
      ...aDocumento(rutina),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const actualizarRutina = async (rutina: Rutina) => {
    if (!uid) return;
    await updateDoc(doc(db, "users", uid, "rutinas", rutina.id), {
      ...aDocumento(rutina),
      updatedAt: serverTimestamp(),
    });
  };

  const eliminarRutina = async (id: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "rutinas", id));
  };

  return { rutinas, cargando, error, crearRutina, actualizarRutina, eliminarRutina };
}
