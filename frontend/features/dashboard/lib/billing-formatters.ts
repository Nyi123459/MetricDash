const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const compactNumberFormatter = new Intl.NumberFormat("en-US");

export function formatCurrencyFromCents(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export function formatBillableRequests(value: number) {
  return compactNumberFormatter.format(value);
}

export function formatBillingDateRange(periodStart: string, periodEnd: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(new Date(periodStart))} - ${formatter.format(new Date(periodEnd))}`;
}
