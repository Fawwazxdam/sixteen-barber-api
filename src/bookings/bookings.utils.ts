export function calculateEndTime(start: Date, duration: number) {
  return new Date(start.getTime() + duration * 60000);
}

export function isWithinOperatingHours(date: Date) {
  const hour = date.getHours();
  return hour >= 9 && hour < 21;
}