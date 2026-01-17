import { ShowAlert } from "@/components/alert";
import { useSession } from "@/components/ctx";
import PersonForm from "@/components/people/personForm";
import { personService } from "@/services/person.service";
import { Person } from "@/types/person.types";
import { useRouter } from "expo-router";
import React, { useState } from "react";

export default function NewPersonScreen() {
  const router = useRouter();
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (data: Partial<Person>) => {
    console.log(data);
    if (!user?.congregation_id) return;

    if (!data.first_name || !data.last_name || !data.sex || !data.birth_date || !data.team_id) {
      ShowAlert("Error", "Llena todos los campos obligatorios (*)");
      return;
    }

    if (!data.is_other_sheep && !data.is_anointed) {
      ShowAlert("Error", "Marca si es de las otras ovejas o si es ungido");
      return;
    }

    setIsSubmitting(true);
    try {
      await personService.createPerson({ ...data, congregation_id: user.congregation_id } as Person);
      ShowAlert("Éxito", "Persona creada correctamente");
      router.back();
    } catch (error) {
      console.error("Error creating person:", error);
      ShowAlert("Error", "No se pudo crear la persona");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <PersonForm onSubmit={handleCreate} isLoading={isSubmitting} submitLabel="Guardar" />;
}
