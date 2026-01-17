import { ShowAlert } from "@/components/alert";
import { useSession } from "@/components/ctx";
import TeamForm from "@/components/teams/teamForm";
import { teamService } from "@/services/team.service";
import { Team } from "@/types/team.types";
import { useRouter } from "expo-router";
import React, { useState } from "react";

export default function NewTeamScreen() {
  const {
    user: { congregation_id },
  } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (data: Partial<Team>) => {
    if (!congregation_id) return;
    setIsLoading(true);
    try {
      await teamService.createTeam({ ...data, congregation_id } as Team);
      ShowAlert("Éxito", "Grupo creado correctamente");
      router.back();
    } catch (error) {
      console.error("Error creating team:", error);
      ShowAlert("Error", "No se pudo crear el grupo");
    } finally {
      setIsLoading(false);
    }
  };

  return <TeamForm onSubmit={handleCreate} isLoading={isLoading} submitLabel="Guardar grupo" />;
}
