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
  const columnTypes: ("date" | "time" | "datetime" | "unknown")[] = [];
  let hasDate = false;
  let hasTime = false;

  for (const raw of values) {
    const str = String(raw ?? "").trim();
    if (str.includes(" ") || str.includes("T")) {
      const [datePart, timePart] = str.split(/[\sT]/);
      if (dateFormats.some((fmt) => isValid(parse(datePart, fmt, new Date())))) hasDate = true;
      if (timePart && timeFormats.some((fmt) => isValid(parse(timePart, fmt, new Date())))) hasTime = true;
      if (hasDate && hasTime) columnTypes.push("datetime");
      else if (hasDate) columnTypes.push("date");
      else if (hasTime) columnTypes.push("time");
      else columnTypes.push("unknown");
    } else {
      if (dateFormats.some((fmt) => isValid(parse(str, fmt, new Date())))) columnTypes.push("date");
      else if (timeFormats.some((fmt) => isValid(parse(str, fmt, new Date())))) columnTypes.push("time");
      else columnTypes.push("unknown");
    }
  }
  const dateCount = columnTypes.filter((type) => type === "date").length;
  const timeCount = columnTypes.filter((type) => type === "time").length;
  const datetimeCount = columnTypes.filter((type) => type === "datetime").length;
  const unknownCount = columnTypes.filter((type) => type === "unknown").length;
  if (unknownCount > 0 || (datetimeCount > 0 && (dateCount > 0 || timeCount > 0))
    || (dateCount !== timeCount && dateCount > 0 && timeCount > 0)) return "unknown";
  if ((dateCount === 1 && timeCount === 1 && columnTypes.length === 2) ||
      (dateCount === 0 && timeCount === 0 && datetimeCount === 1)) {
    return "datetime";
  }
  if (dateCount === columnTypes.length) return "date";
  if (timeCount === columnTypes.length) return "time";
  return "unknwon";
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
