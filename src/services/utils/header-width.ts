// Header label font, as set by TableHeaderCell.module.scss
const HEADER_FONT_SIZE = 16;

// Fixed room around the label in a column header: cell padding (2 x 10),
// the label's right margin (10), the two sort buttons (2 x 30) and the
// status badge (25). Each kind / role badge adds BADGE.
const CHROME = 20 + 10 + 60 + 25;
const BADGE = 24;

let ctx: CanvasRenderingContext2D | null | undefined;
const cache = new Map<string, number>();

const getContext = () => {
  if (ctx !== undefined) return ctx;
  try {
    ctx = document.createElement("canvas").getContext("2d");
    if (ctx) {
      const family =
        getComputedStyle(document.body).fontFamily || "sans-serif";
      ctx.font = `normal ${HEADER_FONT_SIZE}px ${family}`;
    }
  } catch {
    ctx = null;
  }
  return ctx;
};

/** Width in px of the text, or an estimate where no canvas is available. */
export const measureLabel = (label: string): number => {
  const cached = cache.get(label);
  if (cached !== undefined) return cached;
  const c = getContext();
  const width = c
    ? c.measureText(label).width
    : label.length * HEADER_FONT_SIZE * 0.6;
  cache.set(label, width);
  return width;
};

/** Column width that shows the whole header label next to its controls. */
export const headerWidth = (
  label: string | undefined,
  { kind, role }: { kind?: string; role?: string } = {},
): number =>
  Math.ceil(
    measureLabel(label ?? "") + CHROME + (kind ? BADGE : 0) + (role ? BADGE : 0),
  );
