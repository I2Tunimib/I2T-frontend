import { useTable } from 'react-table';
import TableHead from '../table-head/table-head';
import TableHeaderCell from '../table-header-cell/table-header-cell';
import TableRoot from '../table-root/table-root';
import TableRowCell from '../table-row-cell/table-row-cell';
import TableRow from '../table-row/table-row';
import EditableCell from '../editable-cell/editable-cell';
import TableFooter from '../table-footer/table-footer';

interface ITableProps {
  columns: any,
  data: any,
  getHeaderProps: (col: any) => any;
  getCellProps: (cell: any) => any;
  updateTableData: (rowIndex: number, columnId: string, value: string) => any;
}
// default prop getter for when it is not provided
const defaultPropGetter = () => ({});
// default column is editable
const defaultColumn = {
  Cell: EditableCell
};

const Table = ({
  columns,
  data,
  getHeaderProps = defaultPropGetter,
  getCellProps = defaultPropGetter,
  updateTableData
}: ITableProps) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    visibleColumns
  } = useTable({
    columns,
    data
    // defaultColumn,
    // updateTableData
  },
  (hooks) => {
    // push a column for the index
    hooks.visibleColumns.push((cols) => [
      {
        id: 'index',
        Header: 'N.',
        // eslint-disable-next-line react/prop-types
        Cell: ({ row, flatRows }) => (
          // eslint-disable-next-line react/prop-types
          <div>{flatRows.indexOf(row) + 1}</div>
        )
      },
      ...cols
    ]);
  });

  return (
    // apply the table props
    <>
      <TableRoot {...getTableProps()}>
        <TableHead>
          {// Loop over the header rows
            headerGroups.map((headerGroup) => (
              // Apply the header row props
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {// Loop over the headers in each row
                  headerGroup.headers.map((column, index) => (
                    // Apply the header cell props
                    <TableHeaderCell {...column.getHeaderProps(
                      [getHeaderProps(column), { index }]
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
                <TableRow {...row.getRowProps()}>
                  {// Loop over the rows cells
                    row.cells.map((cell) => (
                      // Apply the cell prop
                      <TableRowCell {...cell.getCellProps([getCellProps(cell)])}>
                        {// Render the cell contents
                          cell.render('Cell')}
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
