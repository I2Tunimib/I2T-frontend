import partition from '@services/utils/partition';
import { Row } from '@tanstack/react-table';

const filterMatches = (rows: Array<Row>, colIds: Array<string>) => {
  return partition(rows, (row) => colIds
    .some((colId) => row[colId]?.annotationMeta?.annotated
      && row[colId].annotationMeta.match?.value));
};

const filterPending = (rows: Array<Row>, colIds: Array<string>, scoreLowerBound: number) => {
  return partition(rows, (row) => colIds
    .some((colId) => row[colId]?.annotationMeta?.annotated
      && !row[colId].annotationMeta.match?.value
      && (row[colId].annotationMeta.highestScore ?? 0) >= scoreLowerBound));
};

const filterMiss = (rows: Array<Row>, colIds: Array<string>, scoreLowerBound: number) => {
  return partition(rows, (row) => colIds
    .some((colId) => row[colId]?.annotationMeta?.annotated
      && !row[colId].annotationMeta.match?.value
      && (row[colId].annotationMeta.highestScore ?? 0) < scoreLowerBound));
};

const filters = {
  match: filterMatches,
  pending: filterPending,
  miss: filterMiss
};

export const pipeFilters = (
  rows: Array<Row>,
  colIds: Array<string>,
  globalFilters: string[],
  scoreLowerBound = 0
) => {
  const { filterTrue } = globalFilters.reduce((acc, filter) => {
    const res = filters[filter as keyof typeof filters](acc.filterFalse, colIds, scoreLowerBound);
    acc.filterTrue = acc.filterTrue.concat(res.filterTrue);
    acc.filterFalse = res.filterFalse;
    return acc;
  }, { filterTrue: [], filterFalse: rows } as any);
  return filterTrue;
};
