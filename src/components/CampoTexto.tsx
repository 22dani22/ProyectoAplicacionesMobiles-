/**
 * CampoTexto.tsx — Input con etiqueta e ícono, usado en login y registro
 */
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props extends TextInputProps {
  etiqueta: string;
  icono: keyof typeof Ionicons.glyphMap;
  esContrasena?: boolean;
}

export function CampoTexto({ etiqueta, icono, esContrasena, ...props }: Props) {
  const [oculto, setOculto] = useState(true);

  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-xs font-bold uppercase text-neutral-600">{etiqueta}</Text>
      <View className="flex-row items-center rounded-xl border border-neutral-200 bg-white px-4">
        <Ionicons name={icono} size={18} color="#9CA3AF" />
        <TextInput
          className="ml-2 flex-1 py-3.5 text-base text-neutral-900"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={esContrasena && oculto}
          autoCapitalize={esContrasena ? "none" : props.autoCapitalize}
          {...props}
        />
        {esContrasena && (
          <TouchableOpacity onPress={() => setOculto(!oculto)} className="p-1">
            <Ionicons name={oculto ? "eye-outline" : "eye-off-outline"} size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
