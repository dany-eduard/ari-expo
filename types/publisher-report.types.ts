export interface PublisherReport {
  id?: number;
  person_id: number;
  service_year?: number;
  year?: number;
  month: number;
  participated: boolean;
  bible_courses: number;
  is_auxiliary_pioneer: boolean;
  hours?: number;
  notes?: string;
  isVirtual?: boolean;

  createdAt?: string;
  updatedAt?: string;
}
