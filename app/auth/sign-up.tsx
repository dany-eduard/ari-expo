import { ShowAlert } from "@/components/alert";
import InputField from "@/components/ui/inputField";
import SelectField from "@/components/ui/selectField";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function SignUpScreen() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    congregation: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string) => {
    const requirements = [
      { regex: /.{8,}/, message: "Mínimo 8 caracteres" },
      { regex: /[A-Z]/, message: "Al menos una mayúscula" },
      { regex: /[a-z]/, message: "Al menos una minúscula" },
      { regex: /[0-9]/, message: "Al menos un número" },
      { regex: /[!@#$%^&*(),.?":{}|<>]/, message: "Al menos un carácter especial" },
    ];

    const failed = requirements.filter((req) => !req.regex.test(password));
    return {
      isValid: failed.length === 0,
      errors: failed.map((f) => f.message),
    };
  };

  const handleSignUp = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.congregation) {
      ShowAlert("Error", "Por favor completa todos los campos obligatorios");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      ShowAlert("Error", "Las contraseñas no coinciden");
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      ShowAlert("Contraseña poco segura", "Tu contraseña debe cumplir con:\n\n• " + passwordValidation.errors.join("\n• "));
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      ShowAlert("Éxito", "Cuenta creada correctamente", [{ text: "OK", onPress: () => router.replace("/auth/sign-in") }]);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background-page" keyboardShouldPersistTaps="handled">
        <View className="relative flex flex-1 w-full flex-col overflow-hidden items-center justify-center p-4">
          {/* Background Decoration */}
          <View className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

          <View className="w-full max-w-[400px] flex flex-col gap-6 z-10 py-10">
            {/* Header Section */}
            <View className="flex flex-col items-center gap-2">
              <View className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-2">
                <MaterialIcons name="person-add" size={28} color="#2563eb" />
              </View>
              <Text className="text-primary text-sm font-bold tracking-wide uppercase">Informe de Servicio</Text>
              <Text className="text-text-main text-3xl font-bold tracking-tight text-center">Crear Cuenta</Text>
              <Text className="text-text-secondary text-base font-normal text-center max-w-xs">
                Únete para empezar a organizar tu registro de informes hoy mismo
              </Text>
            </View>

            {/* Form */}
            <View className="flex flex-col gap-4">
              <InputField
                label="Nombre completo"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={(val) => setFormData({ ...formData, name: val })}
                icon="person"
              />

              <InputField
                label="Correo electrónico"
                type="email"
                placeholder="ejemplo@email.com"
                value={formData.email}
                onChange={(val) => setFormData({ ...formData, email: val })}
                icon="mail"
              />

              <SelectField
                label="Congregación"
                value={formData.congregation}
                onChange={(val) => setFormData({ ...formData, congregation: val })}
                options={[
                  { label: "Congregación Central", value: "1" },
                  { label: "Congregación Norte", value: "2" },
                  { label: "Congregación Sur", value: "3" },
                  { label: "Congregación Este", value: "4" },
                ]}
              />

              <InputField
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(val) => setFormData({ ...formData, password: val })}
                showToggle
              />

              <InputField
                label="Confirmar contraseña"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(val) => setFormData({ ...formData, confirmPassword: val })}
                showToggle
              />

              <TouchableOpacity
                disabled={isLoading}
                onPress={handleSignUp}
                activeOpacity={0.8}
                className={`flex items-center justify-center w-full h-14 mt-4 rounded-xl bg-primary ${isLoading ? "opacity-70" : ""}`}
                style={{
                  shadowColor: "#2563eb",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 8,
                }}
              >
                {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white text-base font-bold">Registrarse</Text>}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="flex flex-row items-center justify-center gap-1 mt-4">
              <Text className="text-text-secondary text-sm">¿Ya tienes una cuenta?</Text>
              <TouchableOpacity onPress={() => router.replace("/auth/sign-in")} activeOpacity={0.7}>
                <Text className="text-primary text-sm font-bold">Inicia Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
