import useScroll from '@hooks/scroll/useScroll';
import {
  Box,
  IconButton,
  Pagination, Paper,
  Radio,
  Stack, Typography
} from '@mui/material';
import {
  forwardRef, PropsWithChildren,
  useEffect, useRef
} from 'react';
import {
  Cell,
  IdType,
  Row, TableOptions,
  usePagination, useRowSelect, useSortBy, useTable
} from 'react-table';
import Empty from '@components/kit/Empty';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import {
  Table, TableHead, TableHeaderCell,
  TableRow, TableRowCell
} from './CustomTableStyles';

export interface TableProperties<T extends Record<string, unknown>> extends TableOptions<T> {
  onSelectedRowChange: (row: T | null) => void;
}

interface FooterProps<T extends Record<string, unknown>> {
  rows: Row<T>[];
  pageIndex: number;
  pageCount: number;
  gotoPage: (index: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

export function Footer<T extends Record<string, unknown>>(
  props: PropsWithChildren<FooterProps<T>>
) {
  const {
    rows,
    pageIndex,
    pageCount,
    gotoPage,
    nextPage,
    previousPage
  } = props;

  const handleChange = (event: any, page: number) => {
    gotoPage(page - 1);
  };

  return (
    <Stack
      position="sticky"
      bottom={0}
      direction="row"
      alignItems="center"
      sx={{
        backgroundColor: '#FFF',
        borderTop: '1px solid rgb(224, 224, 224)',
        marginTop: 'auto',
        padding: '6px 16px'
      }}>
      <Typography color="textSecondary" variant="body2">
        {`Total candidates: ${rows.length}`}
      </Typography>
      <Pagination
        sx={{
          marginLeft: 'auto'
        }}
        size="small"
        onChange={handleChange}
        count={pageCount}
        page={pageIndex + 1}
        showFirstButton
        showLastButton />
    </Stack>
  );
}

const RadioCell = forwardRef(
  ({
    indeterminate,
    checked,
    onChange,
    ...rest
  }: any, ref) => {
    const defaultRef = useRef();
    const resolvedRef = ref || defaultRef;

    const handle = (e: any) => {
      e.stopPropagation();
      if (checked) {
        e.target.checked = !checked;
        onChange(e);
      }
    };

    return (
      <>
        <Radio
          size="small"
          onChange={onChange}
          onClick={handle}
          checked={checked}
          inputRef={resolvedRef}
          inputProps={{
            ...rest
          }}
        />
      </>
    );
  }
);

function useRadioSelect<T extends Record<string, unknown>>() {
  return {
    id: 'selection',
    Cell: ({ row }: Cell<T>) => (
      <div>
        <RadioCell {...row.getToggleRowSelectedProps()} />
      </div>
    )
  };
}

const defaultHooks = [
  useSortBy,
  usePagination
  // useRowSelect
];

export default function CustomTable<T extends Record<string, unknown>>(
  props: PropsWithChildren<TableProperties<T>>
) {
  const {
    columns,
    data,
    onSelectedRowChange,
    showRadio = true
  } = props;
  const tableInstance = useTable<T>(
    {
      columns,
      data,
      initialState: {
        pageSize: 20
      }
      // manualRowSelectedKey: 'none',
      // stateReducer: (newState, action) => {
      //   if (action.type === 'toggleRowSelected') {
      //     if (action.value) {
      //       (newState.selectedRowIds as unknown as any) = {
      //         [action.id]: true
      //       };
      //     } else {
      //       (newState.selectedRowIds as unknown as any) = {};
      //     }
      //   }
      //   return newState;
      // }
    },
    ...defaultHooks,
    (hooks) => {
      // if (showRadio) {
      //   hooks.visibleColumns.push((cols) => [
      //     useRadioSelect(),
      //     ...cols
      //   ]);
      // } else {
      //   hooks.visibleColumns.push((cols) => [
      //     ...cols
      //   ]);
      // }
    }
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    rows,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    // toggleRowSelected,
    // selectedFlatRows,
    state: { pageIndex, selectedRowIds }
  } = tableInstance;

  const paginationProps = {
    rows,
    pageIndex,
    pageCount,
    gotoPage,
    nextPage,
    previousPage
  };

  // useEffect(() => {
  //   // treting selection as radio selection,
  //   // only one row at a time
  //   if (selectedFlatRows[0]) {
  //     onSelectedRowChange(selectedFlatRows[0].original);
  //   } else {
  //     onSelectedRowChange(null);
  //   }
  // }, [selectedFlatRows]);

  // useEffect(() => {
  //   rows.forEach(({ id, original }) => {
  //     if ((original as any).isSelected) {
  //       toggleRowSelected(id, true);
  //     }
  //   });
  // }, [rows, toggleRowSelected]);

  const handleRowClick = (row: Row<T>) => {
    onSelectedRowChange(row.original);
    // toggleRowSelected(id, false);
  };

  return (
    // apply the table props
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1
    }}>
      <Box
        sx={{
          flexGrow: 1,
          marginTop: '12px',
          padding: '10px',
          ...(data.length === 0 && {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          })
        }}>
        {data.length > 0 ? (
          <Table {...getTableProps()}>
            <TableHead>
              {// Loop over the header rows
                headerGroups.map((headerGroup) => (
                  // Apply the header row props
                  <TableRow {...headerGroup.getHeaderGroupProps()}>
                    {// Loop over the headers in each row
                      headerGroup.headers.map((column) => (
                        // Apply the header cell props
                        <TableHeaderCell
                          sorted={column.isSorted}
                          {...column.getHeaderProps(column.getSortByToggleProps())}>
                          {column.id !== 'selection' ? (
                            <Stack
                              direction="row"
                              overflow="hidden"
                              whiteSpace="nowrap"
                              textOverflow="ellipsis"
                              gap="10px"
                              alignItems="center">
                              {// Render the header
                                column.render('Header')}
                              <IconButton
                                sx={{
                                  width: '25px',
                                  height: '25px'
                                }}
                                size="small">
                                {column.isSorted
                                  ? column.isSortedDesc
                                    ? <ArrowDownwardRoundedIcon fontSize="small" />
                                    : <ArrowUpwardRoundedIcon fontSize="small" />
                                  : <ArrowUpwardRoundedIcon sx={{ color: '#d4d4d4' }} fontSize="small" />}
                              </IconButton>
                            </Stack>
                          ) : column.render('Header')}
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
                    <TableRow
                      onClick={() => handleRowClick(row)}
                      {...row.getRowProps()}>
                      {// Loop over the rows cells
                        row.cells.map((cell) => {
                          // Apply the cell props
                          return (
                            <TableRowCell {...cell.getCellProps()}>
                              {// Render the cell contents
                                cell.render('Cell')}
                            </TableRowCell>
                          );
                        })}
                    </TableRow>
                  );
                })}
            </tbody>
          </Table>
        ) : (
          <Empty />
        )}
      </Box>
      <Footer {...paginationProps} />
    </Box>
  );
}
