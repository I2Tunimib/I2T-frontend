import {
  Row, useGlobalFilter,
  usePagination, useTable
} from 'react-table';
import {
  FC, useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { BaseMetadata } from '@store/slices/table/interfaces/table';
import clsx from 'clsx';
import TableHead from '../TableHead';
import TableHeaderCell from '../TableHeaderCell';
import TableRoot from '../TableRoot';
import TableRowCell from '../TableRowCell';
import TableRow from '../TableRow';
import TableFooter from '../TableFooter';
import styles from './Table.module.scss';
import SvgContainer from '../SvgContainer';

interface TableProps {
  columns: any[];
  data: any[];
  headerExpanded: boolean;
  searchFilter?: TableGlobalFilter;
  dense?: boolean;
  getGlobalProps: () => any;
  getHeaderProps: (col: any) => any;
  getCellProps: (cell: any) => any;
}

interface TableGlobalFilter {
  filter: string;
  value: string;
}

interface HighlightState {
  color: string;
  columns: string[];
}

// default prop getter for when it is not provided
const defaultPropGetter = () => ({});

const Table: FC<TableProps> = ({
  columns,
  data,
  searchFilter,
  headerExpanded,
  dense = false,
  getGlobalProps = defaultPropGetter,
  getHeaderProps = defaultPropGetter,
  getCellProps = defaultPropGetter
}) => {
  const columnRefs = useRef<Record<any, HTMLElement>>({});
  const [highlightState, setHighlightState] = useState<HighlightState | null>(null);
  const [searchHighlightState, setSearchHighlight] = useState<Record<string, boolean>>({});

  /**
   * Custom function id.
   */
  const getRowId = useCallback((row: any, relativeIndex: number, parent?: Row<any> | undefined) => {
    return (parent ? [parent.id, relativeIndex].join('.') : row[Object.keys(row)[0]].rowId) as string;
  }, []);

  /**
 * Returns row which have at least a cell with label.
 */
  const filterAll = useCallback((
    rows: Array<Row>, colIds: Array<string>, regex: RegExp
  ) => {
    const filteredRows = rows.filter((row) => colIds
      .some((colId) => regex.test(row.values[colId].label
        .toLowerCase())));

    filteredRows.forEach((row) => {
      colIds.forEach((colId) => {
        const match = regex.test(row.values[colId].label.toLowerCase());

        if (match) {
          setSearchHighlight((oldState) => ({
            ...oldState,
            [`${row.id}$${colId}`]: true
          }));
        }
      });
    });
    return filteredRows;
  }, []);

  /**
   * Returns row which have at least a cell with metadata name.
   */
  const filterMetaName = useCallback((
    rows: Array<Row>, colIds: Array<string>, regex: RegExp
  ) => {
    const filteredRows = rows.filter((row) => colIds
      .some((colId) => row.values[colId].metadata
        .some((item: BaseMetadata) => regex.test(item.name.value.toLowerCase()))));

    filteredRows.forEach((row) => {
      colIds.forEach((colId) => {
        const match = row.values[colId].metadata
          .some((item: BaseMetadata) => regex.test(item.name.value.toLowerCase()));

        if (match) {
          setSearchHighlight((oldState) => ({
            ...oldState,
            [`${row.id}$${colId}`]: true
          }));
        }
      });
    });
    return filteredRows;
  }, []);

  /**
   * Returns row which have at least a cell with metadata type.
   */
  const filterMetaType = useCallback((
    rows: Array<Row>, colIds: Array<string>, regex: RegExp
  ) => {
    const filteredRows = rows.filter((row) => colIds
      .some((colId) => row.values[colId].metadata
        .some((item: any) => item.type && item.type
          .some((type: any) => regex.test(type.name.toLowerCase())))));

    filteredRows.forEach((row) => {
      colIds.forEach((colId) => {
        const match = row.values[colId].metadata
          .some((item: any) => item.type && item.type
            .some((type: any) => regex.test(type.name.toLowerCase())));

        if (match) {
          setSearchHighlight((oldState) => ({
            ...oldState,
            [`${row.id}$${colId}`]: true
          }));
        }
      });
    });
    return filteredRows;
  }, []);

  const customGlobalFilter = useCallback((
    rows: Array<Row>, [index, ...colIds]: Array<string>, { filter, value }: TableGlobalFilter
  ) => {
    setSearchHighlight({});
    const regex = new RegExp(value.toLowerCase());
    // return all rows if value is empty
    if (value === '') {
      return rows;
    }
    switch (filter) {
      case 'label':
        return filterAll(rows, colIds, regex);
      case 'metaName':
        return filterMetaName(rows, colIds, regex);
      case 'metaType':
        return filterMetaType(rows, colIds, regex);
      default:
        return filterAll(rows, colIds, regex);
    }
  }, []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    columns: tableColumns,
    page,
    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
    prepareRow,
    setGlobalFilter
  } = useTable({
    columns,
    data,
    getRowId,
    globalFilter: customGlobalFilter,
    initialState: { pageSize: 30 },
    autoResetGlobalFilter: false
  },
  useGlobalFilter,
  usePagination,
  (hooks) => {
    // push a column for the index
    hooks.visibleColumns.push((cols) => [
      {
        id: 'index',
        Header: '0',
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

  const paginatorProps = {
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    pageIndex,
    pageSize,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize
  };

  useEffect(() => {
    if (searchFilter) {
      setGlobalFilter(searchFilter);
    }
  }, [searchFilter]);

  useEffect(() => {
    // console.log(searchHighlightState);
  }, [searchHighlightState]);

  const handlePathMouseEnter = useCallback((path: any) => {
    const { startElementLabel, endElementLabel, color } = path;
    setHighlightState({
      color,
      columns: [startElementLabel, endElementLabel]
    });
  }, []);

  const handlePathMouseLeave = useCallback(() => {
    setHighlightState(null);
  }, []);

  return (
    <>
      {headerExpanded && (
        <SvgContainer
          headerExpanded={headerExpanded}
          columnRefs={columnRefs}
          columns={columns}
          className={styles.SvgContainer}
          onPathMouseEnter={handlePathMouseEnter}
          onPathMouseLeave={handlePathMouseLeave} />
      )}
      <TableRoot
        className={clsx(
          styles.Table,
          {
            [styles.HeaderExpanded]: headerExpanded
          }
        )}
        {...getTableProps([getGlobalProps()])}>
        <TableHead>
          {// Loop over the header rows
            headerGroups.map((headerGroup, jj) => (
              // Apply the header row props
              <TableRow {...headerGroup.getHeaderGroupProps([getGlobalProps()])}>
                {// Loop over the headers in each row
                  headerGroup.headers.map((column, index) => (
                    // Apply the header cell props
                    <TableHeaderCell
                      ref={(el: any) => { columnRefs.current[column.id] = el; }}
                      {...column.getHeaderProps([
                        getHeaderProps(column), getGlobalProps(), { index, highlightState }])}>
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
            page.map((row) => {
              // Prepare the row for display
              prepareRow(row);
              return (
                // Apply the row props
                <TableRow {...row.getRowProps(getGlobalProps())}>
                  {// Loop over the rows cells
                    row.cells.map((cell) => (
                      // Apply the cell prop
                      <TableRowCell {...cell.getCellProps([
                        getCellProps(cell), getGlobalProps(),
                        { highlightState, searchHighlightState }
                      ]) as any}>
                        {// Render the cell contents
                          cell.render('Cell')}
                      </TableRowCell>
                    ))}
                </TableRow>
              );
            })}
        </tbody>
      </TableRoot>
      <TableFooter rows={rows} columns={tableColumns} paginatorProps={paginatorProps} />
    </>
  );
};

export default Table;
