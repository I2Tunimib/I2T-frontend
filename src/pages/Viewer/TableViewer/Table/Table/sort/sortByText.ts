import { Row } from '@tanstack/react-table';

export const sortByText = <TData>(rowA: Row<TData>, rowB: Row<TData>, columnId: string) => {
  const a = (rowA.getValue(columnId) as { label: string })?.label ?? '';
  const b = (rowB.getValue(columnId) as { label: string })?.label ?? '';
  return a.localeCompare(b);
};
