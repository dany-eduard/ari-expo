import { ShowAlert } from "@/components/alert";
import { useSession } from "@/components/ctx";
import InputField from "@/components/ui/inputField";
import SelectField from "@/components/ui/selectField";
import { authService } from "@/services/auth.service";
import { congregationService } from "@/services/congregation.service";
import { rolesService } from "@/services/roles.service";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Redirect, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function SignUpScreen() {
  const { user, isLoading: isSessionLoading, signOut } = useSession();
  const [congregations, setCongregations] = useState<{ label: string; value: string }[]>([]);
  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    congregation_id: "",
    roles: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);

  const isAuthorized = user?.roles?.includes("admin") || user?.roles?.includes("secretario");

  const fetchCongregations = useCallback(async () => {
    try {
      const response = await congregationService.getCongregations({ limit: 1000 });
      if (!response || response.data.length === 0) return;
      setCongregations(
        response.data.map((congregation: any) => ({ label: `${congregation.name} ${congregation?.code || ""}`, value: congregation.id })),
      );
    } catch (error) {
      console.error("Error fetching congregations:", error);
      ShowAlert("Error", "Ocurrió un error al cargar las congregaciones");
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await rolesService.getRoles();
      if (!response || response.length === 0) return;
      // Secretary can assign all roles except admin
      const filteredRoles = user?.roles?.includes("admin") ? response : response.filter((r: any) => r.name !== "admin");
      setRoles(filteredRoles.map((role: any) => ({ label: role.description, value: role.name })));
    } catch (error) {
      console.error("Error fetching roles:", error);
      ShowAlert("Error", "Ocurrió un error al cargar los roles");
    }
  }, [user?.roles]);

  useEffect(() => {
    if (isAuthorized) {
      fetchCongregations();
      fetchRoles();
    }
  }, [isAuthorized, fetchCongregations, fetchRoles]);

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

  const handleSignUp = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.congregation_id ||
      formData.roles.length === 0
    ) {
      ShowAlert("Error", "Por favor completa todos los campos obligatorios, incluyendo al menos un rol.");
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
    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        congregation_id: formData.congregation_id,
        roles: formData.roles,
      });
      ShowAlert("Éxito", "Usuario creado correctamente", [{ text: "OK", onPress: () => router.replace("/") }]);
    } catch (error: any) {
      ShowAlert("Error", error?.message || "Ocurrió un error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  // Authorization Check
  if (isSessionLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background-page">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!isAuthorized) {
    return <Redirect href="/" />;
  }

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
              <Text className="text-text-main text-3xl font-bold tracking-tight text-center">Registrar Usuario</Text>
              <Text className="text-text-secondary text-base font-normal text-center max-w-xs">
                Crea una cuenta para empezar a gestionar los registros en tu congregación
              </Text>
            </View>

            {/* Form */}
            <View className="flex flex-col gap-4">
              <InputField
                label="Nombres"
                placeholder="Juan"
                value={formData.first_name}
                onChange={(val) => setFormData({ ...formData, first_name: val })}
                icon="person"
              />

              <InputField
                label="Apellidos"
                placeholder="Pérez"
                value={formData.last_name}
                onChange={(val) => setFormData({ ...formData, last_name: val })}
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
                placeholder="Selecciona una congregación"
                value={formData.congregation_id}
                onChange={(val) => setFormData({ ...formData, congregation_id: val })}
                options={congregations}
              />

              <SelectField
                label="Roles a asignar"
                placeholder="Selecciona uno o más roles"
                value={formData.roles}
                multiple
                onChange={(val) => setFormData({ ...formData, roles: val })}
                options={roles}
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
                {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white text-base font-bold">Crear Usuario</Text>}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="flex flex-row items-center justify-center gap-1 mt-4">
              <Text className="text-text-secondary text-sm">¿Ya tienes una cuenta?</Text>
              <TouchableOpacity onPress={signOut} activeOpacity={0.7}>
                <Text className="text-primary text-sm font-bold">Inicia Sesión</Text>
              </TouchableOpacity>
            </View>
            <View className="flex flex-row items-center justify-center gap-1 mt-4">
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                <Text className="text-primary text-sm font-bold">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
