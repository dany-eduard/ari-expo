import { ShowAlert } from "@/components/alert";
import TeamForm from "@/components/teams/teamForm";
import { Loading } from "@/components/ui/loading";
import { teamService } from "@/services/team.service";
import { Team } from "@/types/team.types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

export default function EditTeamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const data = await teamService.getTeamById(id);
        setTeam(data);
      } catch (error) {
        console.error("Error fetching team:", error);
        ShowAlert("Error", "No se pudo cargar el grupo");
        router.back();
      } finally {
        setIsLoading(false);
      }
    }
    fetchTeam();
  }, [id]);

  const handleUpdate = async (data: Partial<Team>) => {
    setIsSaving(true);
    try {
      await teamService.updateTeam(id, { name: data.name } as Team);
      ShowAlert("Éxito", "Grupo actualizado correctamente");
      router.back();
    } catch (error) {
      console.error("Error updating team:", error);
      ShowAlert("Error", "No se pudo actualizar el grupo");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading />;
  if (!team) return null;

  return <TeamForm initialData={team} onSubmit={handleUpdate} isLoading={isSaving} submitLabel="Guardar" />;
}
