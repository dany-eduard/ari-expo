import { ShowAlert } from "@/components/alert";
import PersonForm from "@/components/people/personForm";
import { Loading } from "@/components/ui/loading";
import { personService } from "@/services/person.service";
import { Person } from "@/types/person.types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

export default function EditPersonScreen() {
  const { id, view } = useLocalSearchParams<{ id: string; view?: string }>();
  const router = useRouter();
  const [person, setPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const isViewing = view === "true";

  const fetchPerson = async () => {
    try {
      const data = await personService.getPersonById(id);
      setPerson(data);
    } catch (error) {
      console.error("Error fetching person:", error);
      ShowAlert("Error", "No se pudo cargar la información de la persona");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerson();
  }, [id]);

  const handleUpdate = async (data: Partial<Person>) => {
    if (!data.first_name || !data.last_name || !data.sex || !data.birth_date || !data.team_id) {
      ShowAlert("Error", "Llena todos los campos obligatorios (*)");
      return;
    }

    if (!data.is_other_sheep && !data.is_anointed) {
      ShowAlert("Error", "Marca si es de las otras ovejas o si es ungido");
      return;
    }

    setIsSaving(true);
    try {
      await personService.updatePerson(id, { ...person, ...data } as Person);
      ShowAlert("Éxito", "Persona actualizada correctamente");
      router.back();
    } catch (error) {
      console.error("Error updating person:", error);
      ShowAlert("Error", "No se pudo actualizar la persona");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading />;
  if (!person) return null;

  return <PersonForm isViewing={isViewing} initialData={person} onSubmit={handleUpdate} isLoading={isSaving} submitLabel="Guardar" />;
}
