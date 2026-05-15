export const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function formatTimestamp(timestamp: string) {
  return dateTimeFormatter.format(new Date(timestamp));
}

export function formatMetric(value: number | null | undefined, suffix: string) {
  if (value === null || value === undefined) {
    return "n/a";
  }

  return `${value}${suffix}`;
}

export function serviceNameFromTitle(title: string) {
  return title.split(" ")[0] ?? "unknown-service";
}
