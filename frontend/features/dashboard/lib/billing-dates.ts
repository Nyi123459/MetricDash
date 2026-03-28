function padBillingDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function getBillingCalendarDate(value = new Date()) {
  const [year, month, day] = value
    .toISOString()
    .slice(0, 10)
    .split("-")
    .map(Number);

  return new Date(year, month - 1, day);
}

export function formatBillingQueryDate(value: Date) {
  return [
    value.getFullYear(),
    padBillingDatePart(value.getMonth() + 1),
    padBillingDatePart(value.getDate()),
  ].join("-");
}
