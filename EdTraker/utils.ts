
export const getWeekNumber = (d: Date): number => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
};

export const getWeekString = (date: Date): string => {
  const weekNo = getWeekNumber(date);
  const year = date.getFullYear();
  // Ajuste para semanas al final/inicio de año
  let displayYear = year;
  if (date.getMonth() === 11 && weekNo === 1) displayYear++;
  if (date.getMonth() === 0 && weekNo > 50) displayYear--;
  return `${displayYear}-W${weekNo.toString().padStart(2, '0')}`;
};

export const getMonthString = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}`;
};

export const formatMonthDisplay = (monthStr: string): string => {
  if (!monthStr) return "";
  const [year, month] = monthStr.split('-');
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  return `${monthNames[parseInt(month) - 1]}, ${year}`;
};

export const formatWeekDisplay = (weekStr: string): string => {
  if (!weekStr) return "";
  const [year, week] = weekStr.split('-W');
  return `Semana ${week}, ${year}`;
};

export const formatDuration = (min: number, sec: number): string => {
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

export const parseDuration = (val: string): { min: number, sec: number } => {
  if (!val || typeof val !== 'string') return { min: 0, sec: 0 };
  if (!val.includes(':')) {
    const min = parseInt(val) || 0;
    return { min, sec: 0 };
  }
  const [m, s] = val.split(':');
  return {
    min: parseInt(m) || 0,
    sec: parseInt(s) || 0
  };
};

export const getCurrentWeek = () => getWeekString(new Date());
export const getCurrentMonth = () => getMonthString(new Date());

export const generateId = () => Math.random().toString(36).substring(2, 9);

export const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (month: number, year: number) => {
  return new Date(year, month, 1).getDay();
};
