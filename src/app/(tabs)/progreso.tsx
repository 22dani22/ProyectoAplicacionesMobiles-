import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Alimento, TipoComida, alimentosIniciales } from "../../store/calories.store";

const TIPOS_DE_COMIDA: TipoComida[] = ["Desayuno", "Almuerzo", "Cena", "Snack"];

export default function PantallaCalorias() {
  const [alimentos, setAlimentos] = useState<Alimento[]>(alimentosIniciales);
  const [metaDiaria, setMetaDiaria] = useState<number>(2000);
  const [filtroSeleccionado, setFiltroSeleccionado] = useState<string>("Todas");

  // Modales
  const [modalAgregarVisible, setModalAgregarVisible] = useState(false);
  const [modalMetaVisible, setModalMetaVisible] = useState(false);

  // Formulario nuevo alimento
  const [nombreAlimento, setNombreAlimento] = useState("");
  const [caloriasAlimento, setCaloriasAlimento] = useState("");
  const [tipoComidaSeleccionada, setTipoComidaSeleccionada] = useState<TipoComida>("Almuerzo");

  // Formulario meta
  const [textoNuevaMeta, setTextoNuevaMeta] = useState(metaDiaria.toString());

  // Cálculos de calorías
  const totalConsumido = alimentos.reduce((acumulador, item) => acumulador + item.calorias, 0);
  const caloriasRestantes = Math.max(0, metaDiaria - totalConsumido);
  const porcentajeProgreso = Math.min(100, Math.round((totalConsumido / metaDiaria) * 100));

  // Filtrado de lista
  const alimentosFiltrados =
    filtroSeleccionado === "Todas"
      ? alimentos
      : alimentos.filter((a) => a.tipoComida === filtroSeleccionado);

  // Guardar nuevo alimento
  const agregarAlimento = () => {
    if (!nombreAlimento.trim()) {
      Alert.alert("Campo requerido", "Por favor ingresa el nombre del alimento.");
      return;
    }

    const caloriasNumero = parseInt(caloriasAlimento, 10);
    if (isNaN(caloriasNumero) || caloriasNumero <= 0) {
      Alert.alert("Calorías inválidas", "Ingresa una cantidad de calorías válida (mayor a 0).");
      return;
    }

    const fechaActual = new Date();
    const horaTexto = `${fechaActual.getHours().toString().padStart(2, "0")}:${fechaActual
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const nuevoAlimento: Alimento = {
      id: Date.now().toString(),
      nombre: nombreAlimento.trim(),
      calorias: caloriasNumero,
      tipoComida: tipoComidaSeleccionada,
      hora: horaTexto,
    };

    setAlimentos([nuevoAlimento, ...alimentos]);
    setNombreAlimento("");
    setCaloriasAlimento("");
    setModalAgregarVisible(false);
  };

  // Eliminar alimento
  const eliminarAlimento = (idAlimento: string, nombre: string) => {
    Alert.alert("Eliminar alimento", `¿Eliminar "${nombre}" del registro de hoy?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => setAlimentos(alimentos.filter((a) => a.id !== idAlimento)),
      },
    ]);
  };

  // Actualizar meta diaria
  const guardarMeta = () => {
    const metaNumero = parseInt(textoNuevaMeta, 10);
    if (!isNaN(metaNumero) && metaNumero >= 500) {
      setMetaDiaria(metaNumero);
      setModalMetaVisible(false);
    } else {
      Alert.alert("Meta inválida", "Por favor ingresa un objetivo de al menos 500 kcal.");
    }
  };

  // Icono según tipo de comida
  const obtenerIconoComida = (tipo: TipoComida) => {
    switch (tipo) {
      case "Desayuno":
        return "sunny-outline";
      case "Almuerzo":
        return "restaurant-outline";
      case "Cena":
        return "moon-outline";
      case "Snack":
        return "nutrition-outline";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={["top", "left", "right"]}>
      <ScrollView
        className="flex-1 px-4 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 1. Cabecera Superior */}
        <View className="flex-row items-center justify-between mb-4 mt-1">
          <View>
            <Text className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Nutrición Diaria
            </Text>
            <Text className="text-2xl font-black text-neutral-900 tracking-tight">
              Contador de Calorías
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setTextoNuevaMeta(metaDiaria.toString());
              setModalMetaVisible(true);
            }}
            className="flex-row items-center bg-white border border-neutral-200 px-3 py-1.5 rounded-full shadow-xs active:bg-neutral-50"
          >
            <Ionicons name="flag-outline" size={14} color="#EA580C" />
            <Text className="text-xs font-bold text-neutral-800 ml-1">
              Meta: {metaDiaria}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. Tarjeta Resumen Principal (Contador de Calorías) */}
        <View className="bg-white border border-neutral-200 rounded-3xl p-5 mb-5 shadow-xs">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-neutral-500 font-semibold text-sm">
              Consumo de hoy
            </Text>
            <View className="bg-orange-50 px-2.5 py-0.5 rounded-full">
              <Text className="text-orange-600 text-xs font-bold">
                {porcentajeProgreso}% completado
              </Text>
            </View>
          </View>

          {/* Gran número central */}
          <View className="flex-row items-baseline mb-3">
            <Text className="text-4xl font-black text-neutral-900 tracking-tight">
              {totalConsumido}
            </Text>
            <Text className="text-lg font-bold text-neutral-400 ml-2">
              / {metaDiaria} kcal
            </Text>
          </View>

          {/* Barra de Progreso */}
          <View className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden mb-4">
            <View
              className={`h-full rounded-full ${
                totalConsumido > metaDiaria ? "bg-red-500" : "bg-orange-500"
              }`}
              style={{ width: `${porcentajeProgreso}%` }}
            />
          </View>

          {/* Estadísticas en 3 Columnas */}
          <View className="flex-row items-center justify-between pt-3 border-t border-neutral-100">
            <View className="items-center flex-1">
              <Text className="text-xs font-medium text-neutral-400">Consumidas</Text>
              <Text className="text-base font-bold text-neutral-900 mt-0.5">
                {totalConsumido}
              </Text>
            </View>

            <View className="h-8 w-px bg-neutral-200" />

            <View className="items-center flex-1">
              <Text className="text-xs font-medium text-neutral-400">Restantes</Text>
              <Text
                className={`text-base font-bold mt-0.5 ${
                  totalConsumido > metaDiaria ? "text-red-500" : "text-emerald-600"
                }`}
              >
                {caloriasRestantes}
              </Text>
            </View>

            <View className="h-8 w-px bg-neutral-200" />

            <View className="items-center flex-1">
              <Text className="text-xs font-medium text-neutral-400">Objetivo</Text>
              <Text className="text-base font-bold text-neutral-900 mt-0.5">
                {metaDiaria}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Botón Principal: Registrar Alimento */}
        <TouchableOpacity
          onPress={() => setModalAgregarVisible(true)}
          className="bg-orange-500 rounded-2xl py-3.5 px-4 mb-5 flex-row items-center justify-center shadow-xs active:bg-orange-600"
        >
          <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
          <Text className="text-white font-bold text-base ml-2">
            Registrar Alimento
          </Text>
        </TouchableOpacity>

        {/* 4. Filtro de Categorías */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row mb-4 -mx-1"
        >
          {["Todas", ...TIPOS_DE_COMIDA].map((categoria) => {
            const estaSeleccionado = filtroSeleccionado === categoria;
            return (
              <TouchableOpacity
                key={categoria}
                onPress={() => setFiltroSeleccionado(categoria)}
                className={`px-4 py-2 rounded-xl mx-1 border ${
                  estaSeleccionado
                    ? "bg-neutral-900 border-neutral-900"
                    : "bg-white border-neutral-200"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    estaSeleccionado ? "text-white" : "text-neutral-600"
                  }`}
                >
                  {categoria}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 5. Lista de Alimentos Consumidos */}
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-neutral-900 text-lg font-bold">
            Alimentos consumidos ({alimentosFiltrados.length})
          </Text>
          {alimentos.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                Alert.alert("Reiniciar día", "¿Deseas borrar todos los alimentos de hoy?", [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Reiniciar", style: "destructive", onPress: () => setAlimentos([]) },
                ]);
              }}
            >
              <Text className="text-xs font-semibold text-neutral-400">Limpiar día</Text>
            </TouchableOpacity>
          )}
        </View>

        {alimentosFiltrados.map((item) => (
          <View
            key={item.id}
            className="bg-white border border-neutral-200 rounded-2xl p-4 mb-3 shadow-xs flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1 mr-3">
              <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center mr-3">
                <Ionicons name={obtenerIconoComida(item.tipoComida)} size={20} color="#EA580C" />
              </View>

              <View className="flex-1">
                <Text className="text-neutral-900 font-bold text-base" numberOfLines={1}>
                  {item.nombre}
                </Text>
                <Text className="text-neutral-400 text-xs mt-0.5">
                  {item.tipoComida} • {item.hora}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="items-end mr-3">
                <Text className="text-neutral-900 font-extrabold text-base">
                  {item.calorias}
                </Text>
                <Text className="text-neutral-400 text-[10px] font-semibold uppercase">
                  kcal
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => eliminarAlimento(item.id, item.nombre)}
                className="p-1.5 rounded-lg bg-red-50 active:bg-red-100"
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {alimentosFiltrados.length === 0 && (
          <View className="bg-white border border-dashed border-neutral-300 rounded-2xl p-8 items-center justify-center my-3 shadow-xs">
            <View className="w-14 h-14 rounded-full bg-orange-50 items-center justify-center mb-3">
              <Ionicons name="restaurant-outline" size={28} color="#EA580C" />
            </View>
            <Text className="text-neutral-800 text-lg font-bold text-center">
              Sin alimentos registrados
            </Text>
            <Text className="text-neutral-500 text-sm text-center mt-1 mb-4">
              {filtroSeleccionado === "Todas"
                ? "Agrega tu primera comida para comenzar a contar las calorías de hoy."
                : `No tienes alimentos registrados en ${filtroSeleccionado}.`}
            </Text>
            <TouchableOpacity
              onPress={() => setModalAgregarVisible(true)}
              className="bg-orange-500 px-5 py-2.5 rounded-xl active:bg-orange-600 shadow-xs"
            >
              <Text className="text-white font-bold text-sm">
                + Agregar alimento
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal: Registrar Alimento */}
      <Modal visible={modalAgregarVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-3xl border-t border-neutral-200 p-5 pb-8 shadow-2xl">
            {/* Cabecera Modal */}
            <View className="flex-row items-center justify-between pb-3 mb-4 border-b border-neutral-100">
              <TouchableOpacity onPress={() => setModalAgregarVisible(false)}>
                <Text className="text-neutral-500 font-semibold text-base">Cancelar</Text>
              </TouchableOpacity>
              <Text className="text-neutral-900 font-bold text-lg">Registrar Alimento</Text>
              <TouchableOpacity
                onPress={agregarAlimento}
                className="bg-orange-500 px-4 py-1.5 rounded-full active:bg-orange-600"
              >
                <Text className="text-white font-bold text-sm">Guardar</Text>
              </TouchableOpacity>
            </View>

            {/* Input Nombre del alimento */}
            <View className="mb-4">
              <Text className="text-neutral-600 text-xs font-bold uppercase mb-1.5">
                Nombre del alimento
              </Text>
              <TextInput
                className="bg-neutral-50 text-neutral-900 text-base font-semibold px-4 py-3 rounded-xl border border-neutral-200"
                placeholder="Ej: Avena con frutas, Ensalada de atún..."
                placeholderTextColor="#9CA3AF"
                value={nombreAlimento}
                onChangeText={setNombreAlimento}
              />
            </View>

            {/* Input Calorías aproximadas */}
            <View className="mb-4">
              <Text className="text-neutral-600 text-xs font-bold uppercase mb-1.5">
                Calorías aproximadas (kcal)
              </Text>
              <TextInput
                className="bg-neutral-50 text-neutral-900 text-base font-semibold px-4 py-3 rounded-xl border border-neutral-200"
                placeholder="Ej: 350"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={caloriasAlimento}
                onChangeText={setCaloriasAlimento}
              />
            </View>

            {/* Selector de Comida */}
            <View className="mb-4">
              <Text className="text-neutral-600 text-xs font-bold uppercase mb-2">
                Momento del día
              </Text>
              <View className="flex-row justify-between">
                {TIPOS_DE_COMIDA.map((tipo) => {
                  const estaSeleccionado = tipoComidaSeleccionada === tipo;
                  return (
                    <TouchableOpacity
                      key={tipo}
                      onPress={() => setTipoComidaSeleccionada(tipo)}
                      className={`flex-1 mx-1 py-2.5 rounded-xl items-center border ${
                        estaSeleccionado
                          ? "bg-orange-500 border-orange-500"
                          : "bg-neutral-50 border-neutral-200"
                      }`}
                    >
                      <Ionicons
                        name={obtenerIconoComida(tipo)}
                        size={16}
                        color={estaSeleccionado ? "#FFFFFF" : "#6B7280"}
                      />
                      <Text
                        className={`text-xs font-bold mt-1 ${
                          estaSeleccionado ? "text-white" : "text-neutral-600"
                        }`}
                      >
                        {tipo}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal: Cambiar Meta Diaria */}
      <Modal visible={modalMetaVisible} animationType="fade" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-center px-6"
        >
          <View className="bg-white rounded-3xl p-6 shadow-2xl border border-neutral-200">
            <Text className="text-neutral-900 font-bold text-xl mb-1 text-center">
              Objetivo Diario
            </Text>
            <Text className="text-neutral-500 text-xs text-center mb-4">
              Define cuántas calorías deseas consumir por día.
            </Text>

            <TextInput
              className="bg-neutral-50 text-neutral-900 text-center text-3xl font-extrabold py-3 rounded-2xl border border-neutral-200 mb-5"
              keyboardType="numeric"
              value={textoNuevaMeta}
              onChangeText={setTextoNuevaMeta}
              placeholder="2000"
              placeholderTextColor="#9CA3AF"
            />

            <View className="flex-row justify-between space-x-3">
              <TouchableOpacity
                onPress={() => setModalMetaVisible(false)}
                className="flex-1 bg-neutral-100 py-3 rounded-xl items-center mr-2"
              >
                <Text className="text-neutral-700 font-bold text-base">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={guardarMeta}
                className="flex-1 bg-orange-500 py-3 rounded-xl items-center ml-2"
              >
                <Text className="text-white font-bold text-base">Actualizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
