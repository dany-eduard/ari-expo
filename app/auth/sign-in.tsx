import { ShowAlert } from "@/components/alert";
import { useSession } from "@/components/ctx";
import InputField from "@/components/ui/inputField";
import SelectField from "@/components/ui/selectField";
import { congregationService } from "@/services/congregation.service";
import { LoginFormData, LoginFormProps } from "@/types/auth.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, ScrollView, Text, TouchableOpacity, View } from "react-native";

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    congregation: "",
    email: "admin@test.com",
    password: "Qwerty123*",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [congregations, setCongregations] = useState<{ label: string; value: string }[]>([]);

  const fetchCongregations = useCallback(async () => {
    try {
      const response = await congregationService.getCongregations();
      if (!response || response.length === 0) return;
      setCongregations(
        response.map((congregation: any) => ({ label: `${congregation.name} ${congregation?.code || ""}`, value: congregation.id }))
      );
    } catch (error) {
      console.error("Error fetching congregations:", error);
      ShowAlert("Error", "Ocurrió un error al cargar las congregaciones");
    }
  }, []);

  const handleSubmit = async () => {
    if (!formData.email || !formData.password || !formData.congregation) {
      ShowAlert("Error", "Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCongregations();
  }, []);

  return (
    <View className="flex flex-col gap-5 mt-4">
      {/* Congregation Selector */}
      <SelectField
        label="Congregación"
        value={formData.congregation}
        onChange={(val) => setFormData({ ...formData, congregation: val })}
        options={congregations}
      />

      {/* Email Input */}
      <InputField
        label="Correo electrónico"
        type="email"
        placeholder="ejemplo@email.com"
        value={formData.email}
        onChange={(val) => setFormData({ ...formData, email: val })}
        icon="mail"
      />

      {/* Password Input */}
      <View className="flex flex-col gap-2">
        <InputField
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(val) => setFormData({ ...formData, password: val })}
          showToggle
        />
        <View className="flex flex-row justify-end">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => ShowAlert("Contacta con el administrador", "Si olvidaste tu contraseña, contacta con el administrador")}
          >
            <Text className="text-sm font-medium text-text-secondary">¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        disabled={isLoading}
        onPress={handleSubmit}
        activeOpacity={0.8}
        className={`flex items-center justify-center w-full h-14 mt-2 rounded-xl bg-primary ${isLoading ? "opacity-70" : ""}`}
        style={{
          shadowColor: "#2563eb",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white text-base font-bold">Iniciar Sesión</Text>}
      </TouchableOpacity>
    </View>
  );
};

const SignInScreen: React.FC = () => {
  const { signIn } = useSession();

  const handleLogin = async (data: LoginFormData) => {
    try {
      await signIn(data);
      router.replace("/");
    } catch (error: any) {
      const messageError = typeof error === "string" ? error : error?.message || "Ocurrió un error inesperado";
      ShowAlert("Error de inicio de sesión", messageError);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-background-page" keyboardShouldPersistTaps="handled">
        <View className="relative flex flex-1 w-full flex-col overflow-hidden items-center justify-center p-4">
          {/* Background Decoration */}
          <View className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

          <View className="w-full max-w-[400px] flex flex-col gap-6 z-10">
            {/* Header Section */}
            <View className="flex flex-col items-center gap-2">
              <View className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-2">
                <MaterialIcons name="token" size={28} color="#2563eb" />
              </View>
              <Text className="text-primary text-sm font-bold tracking-wide uppercase">Informe de Servicio</Text>
              <Text className="text-text-main text-3xl font-bold tracking-tight text-center">Bienvenido</Text>
              <Text className="text-text-secondary text-base font-normal text-center max-w-xs">
                Inicia sesión para registrar la actividad mensual
              </Text>
            </View>

            {/* Form Container */}
            <LoginForm onLogin={handleLogin} />

            {/* Footer Sign Up */}
            {/* <View className="flex flex-row items-center justify-center gap-2 mt-6">
              <TouchableOpacity
                onPress={() => router.replace("/auth/sign-up")}
                activeOpacity={0.7}
                className="flex flex-row items-center justify-center gap-1"
              >
                <Text className="text-text-secondary text-sm">¿No tienes una cuenta?</Text>
                <Text className="text-primary text-sm decoration-2 underline-offset-4">Regístrate aquí</Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;
