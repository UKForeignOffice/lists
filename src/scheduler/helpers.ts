const defaultTodayDateString = new Date().toLocaleString('default',{year: 'numeric', month: 'long', day: 'numeric'});

export function getTodayDate(dateString = defaultTodayDateString) {
  const today = new Date(Date.parse(dateString));
  return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
}
