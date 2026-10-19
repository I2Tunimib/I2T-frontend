import { KG_INFO } from "@services/utils/kg-info";
import {
  BaseMetadata,
  Cell,
  ColumnMetadata,
  ExtendedColumnCell,
} from "../interfaces/table";
import { summarizeMatches } from "./table.reconciliation-utils";

/**
 * The annotation of something that has candidates, as { annotationMeta }, or
 * nothing when it has none.
 */
export const getAnnotationMeta = (
  metadata: BaseMetadata[] | undefined | null,
) =>
  metadata && metadata.length > 0
    ? { annotationMeta: { annotated: true, ...summarizeMatches(metadata) } }
    : ({} as Partial<Pick<Cell, "annotationMeta">>);

export const getColumnAnnotationMeta = (
  metadata: ColumnMetadata[] | undefined | null,
) => (metadata && metadata.length > 0 ? getAnnotationMeta(metadata[0].entity) : {});

/**
 * Candidates as the store holds them: with their name and link. Candidates
 * whose id has no prefix, or is already a link, cannot be resolved and are
 * dropped.
 */
export const getMetadata = (metadata: BaseMetadata[]): any[] =>
  metadata.flatMap(({ id, name, ...rest }) => {
    const [prefix, resourceId] = id.split(":");
    if (
      resourceId === undefined ||
      id.startsWith("https://") ||
      id.startsWith("http://")
    ) {
      return [];
    }
    return [
      {
        id,
        name: {
          value: name,
          uri: `${KG_INFO[prefix]?.uri ?? "empty/"}${resourceId}`,
        },
        ...rest,
      },
    ];
  });

export const getColumnMetadata = (metadata: ColumnMetadata[]): any[] =>
  metadata.map((columnMetaItem) =>
    columnMetaItem.entity === undefined
      ? columnMetaItem
      : { ...columnMetaItem, entity: getMetadata(columnMetaItem.entity) },
  );

/** A label may arrive as text or as an object describing it. */
const normalizeLabel = (label: any): string => {
  if (typeof label === "string") return label;
  if (label && typeof label === "object") {
    if (typeof label.value === "string") return label.value;
    if (typeof label.label === "string") return label.label;
    if (typeof label.uri === "string") return label.uri;
    return JSON.stringify(label);
  }
  return String(label ?? "");
};

export const createCell = (
  rowId: string,
  colId: string,
  newCell: ExtendedColumnCell | null,
) => {
  if (newCell) {
    return {
      id: `${rowId}$${colId}`,
      label: normalizeLabel(newCell.label),
      metadata: getMetadata(newCell.metadata),
      ...getAnnotationMeta(newCell.metadata),
      ...(newCell.annotations && { annotations: newCell.annotations }),
    };
  }

  return {
    id: `${rowId}$${colId}`,
    label: "null",
    metadata: [],
  } as any;
};
