import { Person } from "./person.types";

export interface Team {
  id: number;
  name: string;
  congregation_id: number;
  people: Person[];
  congregation?: { name: string };
  total_people?: number;
  total_active_people?: number;
}
