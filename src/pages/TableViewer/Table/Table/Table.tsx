import { Column, Row, useTable } from 'react-table';
import { FC, useCallback } from 'react';
import { ID } from '@store/slices/table/interfaces/table';
import TableHead from '../TableHead';
import TableHeaderCell from '../TableHeaderCell';
import TableRoot from '../TableRoot';
import TableRowCell from '../TableRowCell';
import TableRow from '../TableRow';
import TableFooter from '../TableFooter';

interface TableProps {
  columns: any[],
  data: any[],
  dense?: boolean,
  getGlobalProps: () => any;
  getHeaderProps: (col: any) => any;
  getCellProps: (cell: any) => any;
}
// default prop getter for when it is not provided
const defaultPropGetter = () => ({});

const Table: FC<TableProps> = ({
  columns,
  data,
  dense = false,
  getGlobalProps = defaultPropGetter,
  getHeaderProps = defaultPropGetter,
  getCellProps = defaultPropGetter
}) => {
  /**
   * Custom function id.
   */
  const getRowId = useCallback((row: any, relativeIndex: number, parent?: Row<any> | undefined) => {
    return (parent ? [parent.id, relativeIndex].join('.') : row[Object.keys(row)[0]].rowId) as string;
  }, []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable({
    columns,
    data,
    getRowId
  },
  (hooks) => {
    // push a column for the index
    hooks.visibleColumns.push((cols) => [
      {
        id: 'index',
        Header: 'N.',
        // eslint-disable-next-line react/prop-types
        Cell: ({ row, flatRows, ...rest }) => {
          return (
            // eslint-disable-next-line react/prop-types
            <div>{flatRows.indexOf(row) + 1}</div>
          );
        }
      },
      ...cols
    ]);
  });

  return (
    // apply the table props
    <>
      <TableRoot {...getTableProps([getGlobalProps()])}>
        <TableHead>
          {// Loop over the header rows
            headerGroups.map((headerGroup) => (
              // Apply the header row props
              <TableRow {...headerGroup.getHeaderGroupProps([getGlobalProps()])}>
                {// Loop over the headers in each row
                  headerGroup.headers.map((column, index) => (
                    // Apply the header cell props
                    <TableHeaderCell {...column.getHeaderProps(
                      [getHeaderProps(column), getGlobalProps(), { index }]
                    )}
                    >
                      {// Render the header
                        column.render('Header')
                      }
                    </TableHeaderCell>
                  ))}
              </TableRow>
            ))}
        </TableHead>
        {/* Apply the table body props */}
        <tbody {...getTableBodyProps()}>
          {// Loop over the table rows
            rows.map((row) => {
              // Prepare the row for display
              prepareRow(row);
              return (
                // Apply the row props
                <TableRow {...row.getRowProps(getGlobalProps())}>
                  {// Loop over the rows cells
                    row.cells.map((cell) => (
                      // Apply the cell prop
                      <TableRowCell {...cell.getCellProps([
                        getCellProps(cell), getGlobalProps()
                      ]) as any}>
                        {// Render the cell contents
                          cell.render('Cell', { value: 'prova' })}
                      </TableRowCell>
                    ))}
                </TableRow>
              );
            })}
        </tbody>
      </TableRoot>
      <TableFooter rows={rows} />
    </>
  );
};

export default Table;
