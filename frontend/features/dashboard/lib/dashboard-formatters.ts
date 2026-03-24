export function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercentage(value: number) {
  return `${value}%`;
}

export function formatLatency(value: number) {
  return `${formatCount(value)} ms`;
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
