export function convertTo12HourFormat(time24:string) {
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${period}`;
}