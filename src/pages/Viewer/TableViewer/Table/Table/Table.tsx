/* eslint-disable indent */
import {
  Row,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  FilterFn,
  SortingState,
} from '@tanstack/react-table';
import {
  FC, useCallback,
  useEffect,
  useRef,
  useState,
  useMemo
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
import { pipeFilters } from './globalFilters';
import { useTableSort } from './sort/useTableSort';

interface TableProps {
  columns: any[];
  data: any[];
  headerExpanded: boolean;
  tableSettings: any;
  searchFilter?: TableGlobalFilter;
  dense?: boolean;
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: (v: Record<string, boolean>) => void;
  columnSizing: Record<string, number>;
  setColumnSizing: (v: Record<string, number>) => void;
  columnPinning: { left: string[] };
  setColumnPinning: (v: { left: string[] }) => void;
  getGlobalProps: () => any;
  getHeaderProps: (col: any) => any;
  getCellProps: (cell: any) => any;
}

interface TableGlobalFilter {
  globalFilter: string[];
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
  tableSettings,
  dense,
  columnVisibility,
  setColumnVisibility,
  columnSizing,
  setColumnSizing,
  columnPinning,
  setColumnPinning,
  getGlobalProps = defaultPropGetter,
  getHeaderProps = defaultPropGetter,
  getCellProps = defaultPropGetter
}) => {
  const columnRefs = useRef<Record<any, HTMLElement>>({});
  // const [sortFn, setSortFn] = useState<string>('metadata');
  const [sorting, setSorting] = useState<SortingState>([]);
  const { sortType, setSortType } = useTableSort();
  const [highlightState, setHighlightState] = useState<HighlightState | null>(null);
  const [searchHighlightState, setSearchHighlight] = useState<Record<string, boolean>>({});

  const {
    lowerBound: {
      isScoreLowerBoundEnabled,
      scoreLowerBound = 0
    }
  } = tableSettings;

  /**
   * Custom function id.
   */
  const getRowId = useCallback((row: any, relativeIndex: number, parent?: Row<any> | undefined) => {
    return (parent ? [parent.id, relativeIndex].join('.') : row[Object.keys(row)[0]].rowId) as string;
  }, []);

  /**
 * Returns row which have at least a cell with label.
 */
  const filterAll = useCallback((rows: Array<Row>, colIds: Array<string>, regex: RegExp) => {
    const normalize = (str: string) => str.replace(/^[\uFEFF\s]+/, '').toLowerCase();

    const filteredRows = rows.filter((row) =>
      colIds.some((colId) => regex.test(normalize(row.getValue(colId)?.label || ''))));

    filteredRows.forEach((row) => {
      colIds.forEach((colId) => {
        const match = regex.test(normalize(row.getValue(colId)?.label || ''));

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
  const filterMetaName = useCallback((rows: Row<any>[], colIds: string[], regex: RegExp) => {
    const normalize = (str: string) => str.replace(/^[\uFEFF\s]+/, '').toLowerCase();

    const filteredRows = rows.filter((row) =>
      colIds.some((colId) => row.getValue(colId)?.metadata?.some((item: BaseMetadata) =>
        regex.test(normalize(item.name.value)))));

    filteredRows.forEach((row) => {
      colIds.forEach((colId) => {
        row.getValue(colId)?.metadata?.forEach((item: BaseMetadata) => {
          if (regex.test(normalize(item.name.value))) {
            setSearchHighlight((oldState) => ({
              ...oldState,
              [`${row.id}$${colId}`]: true
            }));
          }
        });
      });
    });
    return filteredRows;
  }, []);

  /**
   * Returns row which have at least a cell with metadata type.
   */
  const filterMetaType = useCallback((rows: Row<any>[], colIds: string[], regex: RegExp) => {
    const normalize = (str: string) => str.replace(/^[\uFEFF\s]+/, '').toLowerCase();

    const filteredRows = rows.filter((row) =>
      colIds.some((colId) =>
        row.getValue(colId)?.metadata?.some((item: any) =>
          item.type?.some((type: any) => regex.test(normalize(type.name))))));

    filteredRows.forEach((row) => {
      colIds.forEach((colId) => {
        row.getValue(colId)?.metadata?.forEach((item: any) => {
          item.type?.forEach((type: any) => {
            if (regex.test(normalize(type.name))) {
              setSearchHighlight((oldState) => ({
                ...oldState,
                [`${row.id}$${colId}`]: true
              }));
            }
          });
        });
      });
    });
    return filteredRows;
  }, []);

  const initialFilter = useCallback((
    rows: Array<Row>, colIds: Array<string>, globalFilter: string[]
  ) => {
    if (globalFilter.length === 3) {
      return rows;
    }
    if (globalFilter.length === 0) {
      return [] as Array<Row>;
    }
    return pipeFilters(rows, colIds, globalFilter, scoreLowerBound);
  }, [scoreLowerBound]);

  const customGlobalFilter: FilterFn<any> = useCallback((
    row,
    columnIds,
    filterValue
  ) => {
    const { value, filter } = filterValue as TableGlobalFilter;
    if (!value) return true;

    const regex = new RegExp(`^${value}`, 'i');
    const colIds = row.getAllCells().map((cell) => cell.column.id);

    switch (filter) {
      case 'label':
        return filterAll([row], colIds, regex).length > 0;
      case 'metaName':
        return filterMetaName([row], colIds, regex).length > 0;
      case 'metaType':
        return filterMetaType([row], colIds, regex).length > 0;
      default:
        return filterAll([row], colIds, regex).length > 0;
    }
  }, [filterAll, filterMetaName, filterMetaType]);

  const allColumns = useMemo(() => {
    const hasVisibleColumns = Object.values(columnVisibility).some((v) => v);
    const indexColumn = hasVisibleColumns
      ? [{
          id: 'index',
          header: '',
          accessorFn: (_row, index) => index,
          enableSorting: true,
          enableResizing: false,
          enableColumnPinning: false,
          size: 24,
          minSize: 24,
          maxSize: 24,
          cell: ({ row }) => <div>{row.index + 1}</div>,
          getIsPinned: () => 'left',
      }]
      : [];
    return [...indexColumn, ...columns];
  }, [columns, columnVisibility]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 17,
  });

  const filteredData = useMemo(() => {
    if (!searchFilter?.globalFilter || searchFilter.globalFilter.length === 3) {
      return data;
    }
    const colIds = allColumns.map((col) => col.id);
    return initialFilter(data, colIds, searchFilter.globalFilter);
  }, [data, allColumns, searchFilter?.globalFilter, initialFilter]);

  const table = useReactTable({
    data: filteredData,
    columns: allColumns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: customGlobalFilter,
    state: {
      globalFilter: searchFilter,
      pagination,
      sorting,
      columnVisibility,
      columnSizing,
      columnPinning,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnVisibsailityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    columnResizeMode: 'onChange',
    enableResizing: true,
    onColumnPinningChange: setColumnPinning,
    enableColumnPinning: true,
  });

  useEffect(() => {
    setSearchHighlight({});

    if (!searchFilter?.value) return;

    const regex = new RegExp(`^${searchFilter.value}`, 'i');
    const colIds = allColumns.map((col) => col.id);

    let filteredRows: Row<any>[] = table.getRowModel().rows;

    switch (searchFilter.filter) {
      case 'label':
        filteredRows = filterAll(filteredRows, colIds, regex);
        break;
      case 'metaName':
        filteredRows = filterMetaName(filteredRows, colIds, regex);
        break;
      case 'metaType':
        filteredRows = filterMetaType(filteredRows, colIds, regex);
        break;
      default:
        filteredRows = filterAll(filteredRows, colIds, regex);
    }
  }, [searchFilter?.value, searchFilter?.filter, table.getRowModel().rows]);

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
      >
        <TableHead>
          {// Loop over the header rows
            table.getHeaderGroups().map((headerGroup) => (
              // Apply the header row props
              <TableRow key={headerGroup.id}>
                {
                  // Loop over the headers in each row
                  headerGroup.headers.map((header) => (
                    // Apply the header cell props
                    <TableHeaderCell
                      key={header.id}
                      ref={(el: any) => {
                        columnRefs.current[header.id] = el;
                      }}
                      header={header}
                      data={header.column.columnDef}
                      highlightState={highlightState}
                      sortType={sortType}
                      setSortType={setSortType}
                      setSorting={setSorting}
                      style={{ width: header.getSize() }}
                      columnPinning={columnPinning}
                      setColumnPinning={setColumnPinning}
                      {...getHeaderProps(header)}
                    >
                      {// Render the header
                        flexRender(header.column.columnDef.header, header.getContext())
                      }
                    </TableHeaderCell>
                   ))}
              </TableRow>
            ))}
        </TableHead>
        {/* Apply the table body props */}
        <tbody>
          {// Loop over the table rows
            table.getPaginationRowModel().rows.map((row) => (
              // Prepare the row for display
              <TableRow key={row.id}>
                {// Loop over the rows cells
                  row.getVisibleCells().map((cell) => (
                    <TableRowCell
                      key={cell.id}
                      cell={cell}
                      dense={dense}
                      style={{ width: cell.column.getSize() }}
                      highlightState={highlightState}
                      searchHighlightState={searchHighlightState}
                      {...getCellProps(cell)}
                    >
                      {// Render the cell contents
                        flexRender(cell.column.columnDef.cell, cell.getContext())
                      }
                    </TableRowCell>
                  ))}
              </TableRow>
            ))}
        </tbody>
      </TableRoot>
      <TableFooter
        rows={table.getFilteredRowModel().rows}
        columns={columns}
        table={table}
        pageIndex={table.getState().pagination.pageIndex}
      />
    </>
  );
};

export default Table;
