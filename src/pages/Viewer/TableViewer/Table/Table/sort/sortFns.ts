import { sortByMetadata } from './sortByMetdata';
import { sortByText } from './sortByText';

export const sortFunctions = {
  sortByMetadata,
  sortByText
};

export type SortFn = keyof typeof sortFunctions;
