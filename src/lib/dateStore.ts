import { useState, useEffect } from 'react';

let currentSelectedMonth = new Date();
const listeners = new Set<(date: Date) => void>();

export function setSelectedMonth(date: Date) {
  currentSelectedMonth = date;
  listeners.forEach(l => l(date));
}

export function getSelectedMonth() {
  return currentSelectedMonth;
}

export function useSelectedMonth() {
  const [month, setMonth] = useState(currentSelectedMonth);
  
  useEffect(() => {
    listeners.add(setMonth);
    return () => { listeners.delete(setMonth); };
  }, []);
  
  return month;
}
