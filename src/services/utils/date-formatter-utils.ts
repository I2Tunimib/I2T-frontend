import { parse, isValid } from "date-fns";

const dateFormats = [
  "yyyy-MM-dd", "yyyy/MM/dd", "yyyy.MM.dd", "yyyyMMdd",
  "dd-MM-yyyy", "dd/MM/yyyy", "dd.MM.yyyy", "ddMMyyyy",
  "MM-dd-yyyy", "MM/dd/yyyy", "MM.dd.yyyy", "MMddyyyy",
  "d MMMM yyyy", "dd MMMM yyyy", "MMMM d, yyyy", "MMMM dd, yyyy",
];

const timeFormats = [
  "HH:mm", "hh:mm a", "HH:mm:ss", "HH:mm:ss'Z'", "hh:mm:ss a",
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
  const EXCLUSIONS = {
    time: ["year", "monthYear", "monthNumber", "monthText", "day", "dateOnly"],
    iso: ["year", "monthYear", "monthNumber", "monthText", "day", "hour", "hour12", "minutes", "seconds", "milliseconds", "hourMinutes12", "hourSeconds12", "timezoneAbbr"],
    european: ["hour12", "hourMinutes12", "hourSeconds12", "hourSecondsUTC", "timezone"],
    us: ["hour", "hourMinutes", "hourSeconds", "hourSecondsUTC", "hourMilliseconds", "timezone", "timezoneAbbr"],
    datetime: ["year", "monthYear", "monthNumber", "monthText", "day", "dateOnly"],
  };
  if (columnType === "time") filtered = filtered.filter((dl) => !EXCLUSIONS.time.includes(dl.id));
  filtered = filtered.filter((dl) => !EXCLUSIONS[formatType]?.includes(dl.id));
  if (columnType === "datetime") filtered = filtered.filter((dl) => !EXCLUSIONS.datetime.includes(dl.id));

  if (columnType === "date" || columnType === "datetime") {
    const datePrefix =
      formatType === "iso"
        ? "yyyy-MM-dd" : formatType === "european"
        ? "dd/MM/yyyy" : formatType === "us"
        ? "MM/dd/yyyy" : "";

    const separator = formatType === "iso" ? "'T'" : " ";

    filtered = filtered.map((dl) => {
      switch (dl.id) {
        case "dateOnly":
          return {
            ...dl,
            label: formatType === "iso"
              ? "Date only (yyyy-MM-dd)" : formatType === "european"
              ? "Date only (dd/MM/yyyy)" : formatType === "us"
              ? "Date only (MM/dd/yyyy)" : dl.label,
          };
        case "hourMinutes":
          return { ...dl, label: `Hour and minutes (${datePrefix}${separator}HH:mm)` };
        case "hourMinutes12":
          return { ...dl, label: `Hour and minutes 12h (${datePrefix}${separator}hh:mm a)` };
        case "hourSeconds":
          return { ...dl, label: `Hour with seconds (${datePrefix}${separator}HH:mm:ss)` };
        case "hourSecondsUTC":
          return { ...dl, label: `Hour with seconds UTC (${datePrefix}${separator}HH:mm:ss'Z')` };
        case "hourSeconds12":
          return { ...dl, label: `Hour with seconds 12h (${datePrefix}${separator}hh:mm:ss a)` };
        case "hourMilliseconds":
          return { ...dl, label: `Hour with milliseconds (${datePrefix}${separator}HH:mm:ss.SSS)` };
        case "timezone":
          return { ...dl, label: `Hour with timezone and offset (${datePrefix}${separator}HH:mm:ssXXX) [e.g., +02:00]` };
        case "timezoneAbbr":
          return { ...dl, label: `Hour with timezone GMT (${datePrefix}${separator}HH:mm:ss z) [e.g., GMT+2]` };
        default:
          return dl;
      }
    });
  }
  return filtered;
}
