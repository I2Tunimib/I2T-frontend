import { parse, isValid } from "date-fns";

const dateFormats = [
  "yyyy-MM-dd", "yyyy/MM/dd", "yyyy.MM.dd", "yyyyMMdd",
  "dd-MM-yyyy", "dd/MM/yyyy", "dd.MM.yyyy", "ddMMyyyy",
  "MM-dd-yyyy", "MM/dd/yyyy", "MM.dd.yyyy", "MMddyyyy",
  "d MMMM yyyy", "dd MMMM yyyy", "MMMM d, yyyy", "MMMM dd, yyyy",
];

const timeFormats = [
  "HH:mm", "hh:mm a", "HH:mm:ss", "hh:mm:ss a",
  "HH:mm:ss.SSS", "HH:mm:ss.SSS XXX", "HH:mm:ss z"
];

export function dateFormatterUtils(values: string[]): "date" | "time" | "datetime" | "unknown" {
  let hasDate = false;
  let hasTime = false;

  for (const raw of values) {
    const str = String(raw ?? "").trim();
    if (str.includes(" ") || str.includes("T")) {
      const [datePart, timePart] = str.split(/[\sT]/);
      if (dateFormats.some((fmt) => isValid(parse(datePart, fmt, new Date())))) hasDate = true;
      if (timePart && timeFormats.some((fmt) => isValid(parse(timePart, fmt, new Date())))) hasTime = true;
    } else {
      if (dateFormats.some((fmt) => isValid(parse(str, fmt, new Date())))) hasDate = true;
      if (timeFormats.some((fmt) => isValid(parse(str, fmt, new Date())))) hasTime = true;
    }
  }

  if (hasDate && hasTime) return "datetime";
  if (hasDate) return "date";
  if (hasTime) return "time";
  return "unknown";
}

export function filterDetailLevelOptions(
    allOptions: { id: string; label: string; value: string }[],
    columnType: "date" | "time" | "datetime" | "unknown",
    formatType: "iso" | "european" | "us" | "custom"
) {
  if (!allOptions) return [];
  let filtered = allOptions;
  if (columnType === "time") {
    filtered = filtered.filter((dl) => ["hourMinutes", "hourMinutes12", "seconds", "seconds12", "milliseconds",
      "timezone", "timezoneAbbr"].includes(dl.id));
  }
  switch (formatType) {
    case "iso":
      filtered = filtered.filter((dl) => !["year", "monthYear", "monthNumber", "monthText", "day", "hourMinutes12",
        "seconds12", "timezoneAbbr"].includes(dl.id));
      break;
    case "european":
      filtered = filtered.filter((dl) => !["hourMinutes12", "seconds12", "timezone"].includes(dl.id));
      break;
    case "us":
      filtered = filtered.filter((dl) => !["hourMinutes", "seconds", "timezone"].includes(dl.id));
      break;
    case "custom":
    default:
      break;
  }
  return filtered;
}
