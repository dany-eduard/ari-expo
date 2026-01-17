export interface ReportCongregationHome {
  total_teams: number;
  total_people: number;
  total_active_people: number;
  expected_reports: number;
  registered_reports: number;
  missing_reports: number;
  summary: {
    publishers: {
      reports: number;
      bible_courses: number;
    };
    regular_pioneers: {
      reports: number;
      bible_courses: number;
      hours: number;
    };
    auxiliary_pioneers: {
      reports: number;
      bible_courses: number;
      hours: number;
    };
  };
}
