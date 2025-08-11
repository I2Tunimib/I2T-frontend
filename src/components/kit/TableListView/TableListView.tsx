import {
  FC, forwardRef,
  ReactNode,
  useEffect, useRef
} from 'react';
import {
  Row, usePagination,
  useRowSelect, useSortBy, useTable
} from 'react-table';
import clsx from 'clsx';
import {
  Pagination, Checkbox,
  Button, useMediaQuery
} from '@mui/material';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import styles from './TableListView.module.scss';

interface TableListViewProps {
  columns: any[];
  data: any[];
  Actions?: (props: any) => ReactNode;
  Icon?: ReactNode;
  onChangeRowSelected: (selectedRows: any[]) => void;
  rowPropGetter?: (row: Row) => any;
}

interface FooterProps {
  pageIndex: number;
  pageCount: number;
  gotoPage: (index: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

const transformCamelCase = (value: any) => {
  if (typeof value === 'string') {
    const a = value.split(/([A-Z][a-z]+)/)
      .map((splitted) => (splitted ? splitted.toLowerCase() : ''))
      .filter((splitted) => splitted)
      .join(' ');

    return value.split(/([A-Z][a-z]+)/)
      .map((splitted) => (splitted ? splitted.toLowerCase() : ''))
      .filter((splitted) => splitted)
      .join(' ');
  }
  return value;
};

const Footer: FC<FooterProps> = ({
  pageIndex,
  pageCount,
  gotoPage,
  nextPage,
  previousPage
}) => {
  const handleChange = (event: any, page: number) => {
    gotoPage(page - 1);
  };

  return (
    <div className={styles.FooterContainer}>
      <Pagination
        onChange={handleChange}
        count={pageCount}
        page={pageIndex + 1}
        showFirstButton
        showLastButton />
    </div>
  );
};

const IndeterminateCheckbox = forwardRef(
  ({ indeterminate, ...rest }: any, ref) => {
    const defaultRef = useRef(null);

    useEffect(() => {
      if (defaultRef && defaultRef.current) {
        defaultRef.current = indeterminate;
      }
    }, [defaultRef, indeterminate]);

    return (
      <>
        <Checkbox
          size="small"
          color="primary"
          indeterminate={indeterminate}
          {...rest}
        />
      </>
    );
  }
);

const defaultPropGetter = () => ({});

const TableListView: FC<TableListViewProps> = ({
  columns,
  data,
  Icon,
  Actions,
  rowPropGetter = defaultPropGetter,
  onChangeRowSelected
}) => {
  const match = useMediaQuery('(max-width:1230px)');

  const tableInstance = useTable(
    { columns, data, initialState: { pageSize: 50 } },
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      // push a column for the index
      hooks.visibleColumns.push((cols) => [
        {
          id: 'selection',
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          )
        },
        ...cols
      ]);

      if (Actions) {
        hooks.visibleColumns.push((cols) => {
          return [
            ...cols,
            {
              id: 'action',
              Header: '',
              Cell: (props) => (
                <div className={styles.Actions}>
                  {Actions(props)}
                </div>
              )
            }
          ];
        });
      }

      if (Icon) {
        hooks.visibleColumns.push(([first, ...rest]) => {
          return [
            first,
            {
              id: 'icon',
              Header: '',
              Cell: () => Icon
            },
            ...rest
          ];
        });
      }
    }
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    selectedFlatRows,
    state: { pageIndex },
    prepareRow
  } = tableInstance;

  const paginationProps = {
    pageIndex,
    pageCount,
    gotoPage,
    nextPage,
    previousPage
  };

  useEffect(() => {
    onChangeRowSelected(selectedFlatRows.map((flatRow) => flatRow.original));
  }, [selectedFlatRows]);

  return (
    <>
      <table className={styles.Root} {...getTableProps()}>
        <thead className={styles.THead}>
          {headerGroups.map((headerGroup) => {
            const { key: keyTr, ...restTr } = headerGroup.getHeaderGroupProps();
            return (
            <tr key={keyTr} {...restTr}>
              {headerGroup.headers.map((column) => {
                const { key: keyTh, ...restTh } = column.getHeaderProps(column.getSortByToggleProps());
                return (
                <th key={keyTh}
                  className={clsx(
                    styles.Th,
                    {
                      [styles.Fixed]: column.id !== 'selection' && column.id !== 'icon'
                    }
                  )}
                  {...restTh}
              >
                  {column.id === 'selection' || column.id === 'action'
                    ? column.render('Header')
                    : (
                      <Button
                        color="inherit"
                        className={styles.HeaderButton}
                        endIcon={column.isSorted
                          ? column.isSortedDesc
                            ? <ArrowDownwardRoundedIcon color="action" />
                            : <ArrowUpwardRoundedIcon color="action" />
                          : null}>
                        {column.render('Header')}
                      </Button>
                    )}
                </th>
                );
              })}
            </tr>
          );
        })}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            const { key: keyRow, ...restRow } = row.getRowProps([rowPropGetter(row)]);
            return (
              <tr key={keyRow} className={styles.Tr} {...restRow}>
                {row.cells.map((cell) => {
                  const { key: cellKey, ...cellRest } = cell.getCellProps();
                  return (
                    <td key={cellKey} className={styles.Td} {...cellRest}>
                      {cell.render('Cell', { mediaMatch: match })}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <Footer {...paginationProps} />
    </>
  );
};

export default TableListView;
