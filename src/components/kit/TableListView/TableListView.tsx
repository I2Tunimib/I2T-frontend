import {
  FC, forwardRef,
  ReactNode,
  useEffect, useRef, useState
} from 'react';
import {
  Row, usePagination,
  useRowSelect, useSortBy, useTable
} from 'react-table';
import { ButtonPlay } from '@root/components/core';
import clsx from 'clsx';
import {
  Pagination, Checkbox,
  Typography, Button
} from '@mui/material';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import styles from './TableListView.module.scss';

interface TableListViewProps {
  columns: any[];
  data: any[];
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
  rowPropGetter = defaultPropGetter,
  onChangeRowSelected
}) => {
  const [hoveredRow, setHoveredRow] = useState<string>('');
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
        ...cols,
        {
          id: 'start',
          Header: '',
          Cell: ({ row, hoveredRowId }: any) => {
            return (
              <>
                <ButtonPlay
                  loading={false}
                  className={clsx(
                    styles.StartButton
                    // {
                    //   [styles.Hidden]: hoveredRowId !== row.id,
                    //   [styles.Visible]: hoveredRowId === row.id
                    // }
                  )} />
              </>
            );
          }
        }
      ]);

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
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  className={clsx(
                    styles.Th,
                    {
                      [styles.Fixed]: column.id !== 'selection' && column.id !== 'icon'
                    }
                  )}
                  {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.id === 'selection'
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
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps([rowPropGetter(row)])}>
                {row.cells.map((cell) => {
                  return (
                    <td className={styles.Td} {...cell.getCellProps()}>
                      {cell.render('Cell', { hoveredRowId: hoveredRow })}
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
