import {
  FC, forwardRef,
  ReactNode,
  useEffect, useRef
} from 'react';
import {
  Row,
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import clsx from 'clsx';
import {
  Pagination, Checkbox,
  Button, useMediaQuery
} from '@mui/material';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import styles from './TableListView.module.scss';

interface TableListViewProps<TData extends object> {
  columns: ColumnDef<TData>[];
  data: TData[];
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

const IndeterminateCheckbox = forwardRef<HTMLInputElement, any>(
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

  const extraColumns: ColumnDef<any>[] = [
    {
      id: 'selection',
      header: ({ table }) => (
        <IndeterminateCheckbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={() => table.toggleAllRowsSelected()}
        />
      ),
      cell: ({ row }) => (
        <IndeterminateCheckbox
          checked={row.getIsSelected()}
          indeterminate={row.getIsSomeSelected()}
          onChange={() => row.toggleSelected()}
        />
      )
    },
    ...(Icon
      ? [{
            id: 'icon',
            header: '',
            cell: () => Icon
        }]
      : []),
    ...columns,
    ...(Actions
      ? [{
            id: 'action',
            header: '',
            cell: (props) => (
              <div className={styles.Actions}>
                {Actions(props)}
              </div>
            )
          }
        ]
     : [])
  ];

  const table = useReactTable({
    data,
    columns: extraColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const paginationProps = {
    pageIndex: table.getState().pagination.pageIndex,
    pageCount: table.getPageCount(),
    gotoPage: table.setPageIndex,
    nextPage: table.nextPage,
    previousPage: table.previousPage
  };

  useEffect(() => {
    onChangeRowSelected(table.getSelectedRowModel().rows.map((row) => row.original));
  }, [table.getState().rowSelection]);

  return (
    <>
      <table className={styles.Root}>
        <thead className={styles.THead}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={clsx(
                    styles.Th,
                    {
                      [styles.Fixed]: header.id !== 'selection' && header.id !== 'icon'
                    }
                    )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <Button
                    color="inherit"
                    className={styles.HeaderButton}
                    endIcon={header.column.getIsSorted()
                        ? header.column.getIsSorted() === 'desc'
                          ? <ArrowDownwardRoundedIcon color="action" />
                          : <ArrowUpwardRoundedIcon color="action" />
                        : null}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </Button>
                </th>
                ))}
           </tr>
          ))}
        </thead>
          <tbody>
            {table.getSortedRowModel().rows.map((row) => (
              <tr key={row.id} className={styles.Tr} {...rowPropGetter(row)}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className={styles.Td}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
          ))}
          </tbody>
      </table>
      <Footer {...paginationProps} />
    </>
  );
};

export default TableListView;
