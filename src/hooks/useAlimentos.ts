/**
 * useAlimentos.ts — Alimentos de un día en Firestore (users/{uid}/alimentos)
 *
 * Consulta solo los alimentos cuya `fecha` coincide con el día indicado.
 * El orden se hace en el cliente para no necesitar índices compuestos.
 */
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Alimento } from "@/store/calories.store";

export type NuevoAlimento = Omit<Alimento, "id" | "creadoEn" | "fecha">;

export function useAlimentos(uid: string | undefined, fecha: string) {
  // Clave de la consulta actual: si cambia (otro usuario u otro día),
  // los datos anteriores dejan de ser válidos y "cargando" pasa a true.
  const clave = uid ? `${uid}|${fecha}` : null;
  const [estado, setEstado] = useState<{
    clave: string | null;
    alimentos: Alimento[];
    error: unknown;
  }>({ clave: null, alimentos: [], error: null });

  const vigente = clave !== null && estado.clave === clave;
  const alimentos = vigente ? estado.alimentos : [];
  const error = vigente ? estado.error : null;
  const cargando = clave !== null && !vigente;

  useEffect(() => {
    if (!uid) return;
    const claveConsulta = `${uid}|${fecha}`;
    const q = query(collection(db, "users", uid, "alimentos"), where("fecha", "==", fecha));
    const desuscribir = onSnapshot(
      q,
      (snap) => {
        const lista = snap.docs.map((d) => ({ ...(d.data() as Omit<Alimento, "id">), id: d.id }));
        lista.sort((a, b) => (b.creadoEn ?? 0) - (a.creadoEn ?? 0));
        setEstado({ clave: claveConsulta, alimentos: lista, error: null });
      },
      (err) => setEstado({ clave: claveConsulta, alimentos: [], error: err })
    );
    return desuscribir;
  }, [uid, fecha]);

  const totalCalorias = alimentos.reduce((acc, a) => acc + (a.calorias || 0), 0);

  const agregarAlimento = async (nuevo: NuevoAlimento) => {
    if (!uid) return;
    await addDoc(collection(db, "users", uid, "alimentos"), {
      ...nuevo,
      fecha,
      creadoEn: Date.now(),
    });
  };

  const eliminarAlimento = async (id: string) => {
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "alimentos", id));
  };

  /** Borra todos los alimentos del día consultado. */
  const limpiarDia = async () => {
    if (!uid || alimentos.length === 0) return;
    const batch = writeBatch(db);
    alimentos.forEach((a) => batch.delete(doc(db, "users", uid, "alimentos", a.id)));
    await batch.commit();
  };

  return {
    alimentos,
    cargando,
    error,
    totalCalorias,
    agregarAlimento,
    eliminarAlimento,
    limpiarDia,
  };
}
