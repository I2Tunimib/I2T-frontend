import { parse, parseISO, format, isValid } from "date-fns";

type DateFormatResult = {
  value: string | null;
  error?: string;
  errorType?: "column" | "pattern";
};

/**
 * Convert a string into a formatted date.
 * Supports ISO strings, compact "yyyyMMdd" strings, and custom output patterns.
 *
 * @param value - The date string to convert
 * @param pattern - Optional output pattern (default 'yyyy-MM-dd')
 * @returns object with value (formatted string or null) and optional error message
 */
export function toFormattedDate(value: string, pattern?: string): DateFormatResult {
  if (!value) return { value: null };

  const inputFormats = [
    "yyyyMMdd", // compact
    "yyyy-MM-dd", // ISO
    "yyyy/MM/dd",
    "yyyy.MM.dd",
    "ddMMyyyy", // compact EU style
    "dd-MM-yyyy",
    "dd/MM/yyyy",
    "dd.MM.yyyy",
    "MMddyyyy",
    "MM-dd-yyyy",
    "MM/dd/yyyy",
    "MM.dd.yyyy",
  ];

  let date: Date;

  try {
    date = parseISO(value);
    if (!isValid(date)) {
      for (const fmt of inputFormats) {
        const dateFormatted = parse(value, fmt, new Date());
        if (isValid(dateFormatted)) {
          date = dateFormatted;
          break;
        }
      }
    }
    if (!isValid(date)) {
      return { value: null, error: "Column(s) contains invalid date values", errorType: "column" };
    }
    const outputPattern = pattern || "yyyy-MM-dd";
    // Custom pattern must contain dd, MM and yyyy
    if (!outputPattern.includes("dd") || !outputPattern.includes("MM") || !outputPattern.includes("yyyy")) {
      return { value: null, error: "Invalid custom format pattern, it must include dd, MM, and yyyy", errorType: "pattern" };
    }
    try {
      const formatted = format(date, outputPattern);
      return { value: formatted };
    } catch (err) {
      return { value: null, error: "Invalid custom format pattern", errorType: "pattern" };
    }
  } catch (err) {
    return { value: null, error: "Unknown error parsing date" };
  }
}
