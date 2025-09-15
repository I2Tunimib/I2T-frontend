import { useState } from 'react';
import { SortFn, sortFunctions } from './sortFns';

export const useTableSort = () => {
  const [sortType, setSortType] = useState<SortFn>('sortByMetadata');

  return {
    sortType,
    setSortType
  };
};
