/**
 * AuthContext.tsx — Sesión del usuario y perfil (Firebase Auth + Firestore)
 *
 * Expone a toda la app:
 *   - user: usuario de Firebase (null si no hay sesión)
 *   - perfil: documento users/{uid} (nombre, email, metaCalorias)
 *   - cargando: true mientras se resuelve la sesión al abrir la app
 *   - registrar, iniciarSesion, cerrarSesion, recuperarContrasena, actualizarPerfil
 */
import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export interface PerfilUsuario {
  nombre: string;
  email: string;
  metaCalorias: number;
}

const META_POR_DEFECTO = 2000;

interface ValorAuth {
  user: User | null;
  perfil: PerfilUsuario | null;
  cargando: boolean;
  registrar: (nombre: string, email: string, password: string) => Promise<void>;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
  recuperarContrasena: (email: string) => Promise<void>;
  actualizarPerfil: (cambios: Partial<Pick<PerfilUsuario, "nombre" | "metaCalorias">>) => Promise<void>;
}

const AuthContext = createContext<ValorAuth | null>(null);

export function useAuth() {
  const valor = use(AuthContext);
  if (!valor) throw new Error("useAuth debe usarse dentro de <AuthProvider />");
  return valor;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const registrando = useRef(false);

  // 1. Escucha cambios de sesión (login, logout, sesión guardada al abrir la app)
  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, (usuario) => {
      setUser(usuario);
      if (!usuario) setPerfil(null);
      setCargando(false);
    });
    return desuscribir;
  }, []);

  // 2. Escucha el documento users/{uid} en tiempo real
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const desuscribir = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setPerfil({
            nombre: data.nombre ?? user.displayName ?? "Usuario",
            email: data.email ?? user.email ?? "",
            metaCalorias: data.metaCalorias ?? META_POR_DEFECTO,
          });
        } else {
          // Usuario sin documento (p. ej. creado desde la consola): se crea uno por defecto
          const nuevo: PerfilUsuario = {
            nombre: user.displayName ?? "Usuario",
            email: user.email ?? "",
            metaCalorias: META_POR_DEFECTO,
          };
          setPerfil(nuevo);
          // Durante el registro, `registrar()` ya crea el documento con el nombre real
          if (!registrando.current) {
            setDoc(ref, { ...nuevo, createdAt: serverTimestamp() }).catch(console.warn);
          }
        }
      },
      (error) => console.warn("[perfil]", error)
    );
    return desuscribir;
  }, [user]);

  const registrar = async (nombre: string, email: string, password: string) => {
    registrando.current = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: nombre.trim() });
      await setDoc(doc(db, "users", cred.user.uid), {
        nombre: nombre.trim(),
        email: email.trim(),
        metaCalorias: META_POR_DEFECTO,
        createdAt: serverTimestamp(),
      });
    } finally {
      registrando.current = false;
    }
  };

  const iniciarSesion = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const cerrarSesion = async () => {
    await signOut(auth);
  };

  const recuperarContrasena = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const actualizarPerfil: ValorAuth["actualizarPerfil"] = async (cambios) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), cambios);
    if (cambios.nombre) await updateProfile(user, { displayName: cambios.nombre });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        perfil,
        cargando,
        registrar,
        iniciarSesion,
        cerrarSesion,
        recuperarContrasena,
        actualizarPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
