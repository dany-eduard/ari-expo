export const now = new Date();
export const day = now.getDate();
export const currentMonth = now.getMonth() + 1;
export const currentYear = now.getFullYear();

// A service year runs from September (9) to August (8) of the following calendar year.
export const SERVICE_YEAR_START_MONTH = 9;

// Service year months in order: September -> August.
export const SERVICE_YEAR_MONTHS_ORDER: number[] = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];

export interface ServiceYearMonth {
  month: number;
  // Calendar year the month belongs to.
  year: number;
  // Service year the month belongs to.
  serviceYear: number;
}

// Service year a given calendar month/year belongs to (e.g. Sep 2026 -> 2027).
export const getServiceYear = (month: number, year: number): number =>
  month >= SERVICE_YEAR_START_MONTH ? year + 1 : year;

// Current service year based on today's date (or a given one).
export const getCurrentServiceYear = (date: Date = new Date()): number => getServiceYear(date.getMonth() + 1, date.getFullYear());

// Ordered months (Sep -> Aug) of a service year, each with its calendar year.
export const getServiceYearMonths = (serviceYear: number): ServiceYearMonth[] =>
  SERVICE_YEAR_MONTHS_ORDER.map((month) => ({
    month,
    year: month >= SERVICE_YEAR_START_MONTH ? serviceYear - 1 : serviceYear,
    serviceYear,
  }));

// Helper to work with UTC dates without timezone shifting
export const getUTCDateObject = (dateString: string | Date) => {
  const date = new Date(dateString);
  return {
    day: date.getUTCDate(),
    month: date.getUTCMonth(),
    year: date.getUTCFullYear(),
  };
};

// Formats a date string (YYYY-MM-DD) to "DD of Month, YYYY" in UTC
export const formatUTCToLocaleString = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getUTCDate();
  const month = date.toLocaleString("es-ES", { month: "long", timeZone: "UTC" });
  const year = date.getUTCFullYear();

  return `${day} de ${month.charAt(0).toUpperCase() + month.slice(1)}, ${year}`;
};

// Returns YYYY-MM-DD from a Date object using its UTC components
export const dateToISOString = (year: number, month: number, day: number) => {
  const formattedMonth = (month + 1).toString().padStart(2, "0");
  const formattedDay = day.toString().padStart(2, "0");
  return `${year}-${formattedMonth}-${formattedDay}`;
};

export const getInitialPeriod = (maxDay: number = 31) => {
  if (day >= 1 && day <= maxDay) {
    if (currentMonth === 1) {
      return { month: 12, year: currentYear - 1 };
    }
    return { month: currentMonth - 1, year: currentYear };
  }
  return { month: currentMonth, year: currentYear };
};
