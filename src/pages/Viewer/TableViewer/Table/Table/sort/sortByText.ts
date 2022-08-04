import { Row } from 'react-table';

export const sortByText = (rowA: Row, rowB: Row, columnId: string, desc: boolean | undefined) => {
  return rowA.values[columnId].label.localeCompare(rowB.values[columnId].label);
};
