// Values stay as local wall-clock keys; time zone and scheduling belong to a product.
export const hourOptions = Array.from({ length: 24 }, (_, hour) => ({ id: String(hour).padStart(2, "0"), label: `${hour}시`, textValue: `${hour}시` }));
export const minuteOptions = Array.from({ length: 60 }, (_, minute) => ({ id: String(minute).padStart(2, "0"), label: `${minute}분`, textValue: `${minute}분` }));
export function selectedTime(hour: string | null, minute: string | null): string | null {
  return hour !== null && minute !== null ? `${hour}:${minute}` : null;
}
