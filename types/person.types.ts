import { PERSON_CATEGORIES } from "@/constants/person";

export interface Person {
  id: number;
  congregation_id: number;
  team_id: number;
  first_name: string;
  last_name: string;
  birth_date: string | Date;
  baptism_date?: string | Date;
  sex: "FEMALE" | "MALE";
  number_phone?: string;
  is_active?: boolean;
  is_elder?: boolean;
  is_ministerial_servant?: boolean;
  is_regular_pioneer?: boolean;
  is_special_pioneer?: boolean;
  is_field_missionary?: boolean;
  is_other_sheep?: boolean;
  is_anointed?: boolean;

  already_sent_last_report?: boolean;
}

export type Categories = typeof PERSON_CATEGORIES;
