export const now = new Date();
export const day = now.getDate();
export const currentMonth = now.getMonth() + 1;
export const currentYear = now.getFullYear();

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

export const getInitialPeriod = () => {
  if (day >= 1 && day <= 20) {
    if (currentMonth === 1) {
      return { month: 12, year: currentYear - 1 };
    }
    return { month: currentMonth - 1, year: currentYear };
  }
  return { month: currentMonth, year: currentYear };
};
