import { BaseMetadata } from '@store/slices/table/interfaces/table';
import { Row } from 'react-table';

const findMatchingMetadata = (metadata: BaseMetadata[]) => {
  if (!metadata || metadata.length === 0) {
    return null;
  }

  return metadata.find((metaItem) => metaItem.match);
};

export const sortByMetadata = (
  rowA: Row,
  rowB: Row,
  columnId: string,
  desc: boolean | undefined
) => {
  if (!rowA.values[columnId].annotationMeta
    || !rowA.values[columnId].annotationMeta.match.value) {
    return -1;
  }

  if (!rowB.values[columnId].annotationMeta
    || !rowB.values[columnId].annotationMeta.match.value) {
    return 1;
  }

  const matchingA = findMatchingMetadata(rowA.values[columnId].metadata);
  if (!matchingA) {
    return -1;
  }

  const matchingB = findMatchingMetadata(rowB.values[columnId].metadata);
  if (!matchingB) {
    return 1;
  }

  return matchingA.score - matchingB.score;
};
