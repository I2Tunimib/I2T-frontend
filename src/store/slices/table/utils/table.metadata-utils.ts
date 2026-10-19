import { BaseMetadata, RowState } from "../interfaces/table";
import { stripPrefix } from "./table.utils";

/** Forms send "true"/"false" as text, other callers send booleans. */
export const isMatching = (match: unknown) => match === true || match === "true";

// MATCHING IDS
//
// A candidate can be addressed by its full id ("wd:Q220"), by the id without
// prefix ("Q220"), in any case, or as an object / list of such ids.

const tokens = (value: unknown): string[] => {
  if (value == null) return [];
  const id = String(value).trim().toLowerCase();
  if (!id) return [];
  const afterPrefix = id.includes(":")
    ? id.split(":").slice(1).join(":").trim()
    : "";
  return afterPrefix ? [id, afterPrefix] : [id];
};

/** Every form an id (or object, or list of ids) can be addressed by. */
export const metadataIdCandidates = (id: unknown): string[] => {
  if (Array.isArray(id)) return id.flatMap(metadataIdCandidates);
  if (typeof id === "object" && id !== null) {
    const { label, id: innerId, value } = id as Record<string, unknown>;
    const fromFields = [label, innerId, value].flatMap((field) =>
      field ? tokens(field) : [],
    );
    return Array.from(
      new Set(fromFields.length > 0 ? fromFields : tokens(JSON.stringify(id))),
    );
  }
  return tokens(id);
};

/** Whether a candidate is one of the addressed ids. */
export const hasMetadataId = (item: BaseMetadata, targetIds: string[]) =>
  metadataIdCandidates(item.id).some((candidate) =>
    targetIds.includes(candidate),
  );

// PICKING A MATCH

/**
 * The index of the best candidate scoring at least the threshold (the first
 * one on a tie), or -1.
 */
export const pickBestCandidate = (items: BaseMetadata[], threshold: number) =>
  items.reduce(
    (best, { score = 0 }, i) =>
      score >= threshold && (best === -1 || score > (items[best].score ?? 0))
        ? i
        : best,
    -1,
  );

export const matchedIds = (items: BaseMetadata[]) =>
  items.filter(({ match }) => match).map(({ id }) => id);

export const sameIds = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id) => b.includes(id));

// TYPES OF A COLUMN

export type ColumnTypeStats = {
  id: string;
  label: any;
  uri: any;
  count: number;
  match: boolean;
  decider?: string;
};

/**
 * The types of the matched candidates of a column's cells, by id without
 * prefix, with how many cells have each.
 */
export const getColumnTypeStats = (rows: RowState, colId: string) => {
  const stats: Record<string, ColumnTypeStats> = {};
  rows.allIds.forEach((rowId) => {
    rows.byId[rowId]?.cells[colId]?.metadata?.forEach((item) => {
      if (!item.type || !item.match) return;
      item.type.forEach(({ id, name, uri }: any) => {
        const cleanId = stripPrefix(id);
        if (stats[cleanId]) {
          stats[cleanId].count += 1;
        } else {
          stats[cleanId] = {
            id: cleanId,
            label: name,
            uri,
            count: 1,
            match: item.match,
            decider: item.decider,
          };
        }
      });
    });
  });
  return stats;
};
