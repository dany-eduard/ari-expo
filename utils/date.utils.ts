export const now = new Date();
export const day = now.getDate();
export const currentMonth = now.getMonth() + 1;
export const currentYear = now.getFullYear();

export const getInitialPeriod = () => {
  if (day >= 1 && day <= 20) {
    if (currentMonth === 1) {
      return { month: 12, year: currentYear - 1 };
    }
    return { month: currentMonth - 1, year: currentYear };
  }
  return { month: currentMonth, year: currentYear };
};
