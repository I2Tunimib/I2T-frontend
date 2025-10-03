import { BaseMetadata } from '@store/slices/table/interfaces/table';
import { Row } from '@tanstack/react-table';

const findMatchingMetadata = (metadata: BaseMetadata[]) => {
  if (!metadata || metadata.length === 0) {
    return null;
  }

  return metadata.find((metaItem) => metaItem.match);
};

export const sortByMetadata = (
  rowA: Row<any>,
  rowB: Row<any>,
  columnId: string,
) => {
  const valueA = rowA.getValue(columnId) as any;
  const valueB = rowB.getValue(columnId) as any;

  if (!valueA?.annotationMeta.match.value) return -1;
  if (!valueB?.annotationMeta.match.value) return 1;

  const matchA = findMatchingMetadata(valueA.metadata);
  const matchB = findMatchingMetadata(valueB.metadata);

  if (!matchA) return -1;
  if (!matchB) return 1;

  return matchA.score - matchB.score;
};
