import { useCallback, useMemo, useState } from 'react';
import { SortFn, sortFunctions } from './sortFns';

export const useTableSort = () => {
  const [sortType, setSortType] = useState<SortFn>('sortByMetadata');

  const getSortType = useCallback(() => {
    return sortFunctions[sortType];
  }, [sortType]);

  const sortTypes = useMemo(() => ({ customSort: getSortType() }), [getSortType]);

  return {
    sortTypes,
    sortType,
    setSortType
  };
};
