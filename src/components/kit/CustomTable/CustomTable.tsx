import useScroll from '@hooks/scroll/useScroll';
import {
  Box,
  CircularProgress,
  IconButton,
  Pagination, Paper,
  Radio,
  Stack, Typography
} from '@mui/material';
import {
  forwardRef, Fragment, PropsWithChildren,
  useEffect, useRef, useState
} from 'react';
import {
  Cell,
  IdType,
  Row, TableOptions,
  useExpanded,
  usePagination, useRowSelect, useSortBy, useTable
} from 'react-table';
import Empty from '@components/kit/Empty';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import {
  Table, TableHead, TableHeaderCell,
  TableLoadingOverlay,
  TableRow, TableRowCell, TableSubRow
} from './CustomTableStyles';

export interface TableProperties<T extends Record<string, unknown>> extends TableOptions<T> {
  onSelectedRowChange: (row: T | null) => void;
  loading?: boolean;
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

const defaultHooks = [
  useSortBy,
  useExpanded,
  usePagination
  // useRowSelect
];

const defaultPropGetter = () => ({ prova: 'ok' });

export default function CustomTable<T extends Record<string, unknown>>(
  props: PropsWithChildren<TableProperties<T>>
) {
  const {
    columns,
    data,
    onSelectedRowChange,
    loading = false,
    showRadio = true
  } = props;
  const tableInstance = useTable<T>(
    {
      columns,
      data,
      initialState: {
        pageSize: 20
      },
      autoResetExpanded: false
    },
    ...defaultHooks
  );

  const [subRows, setSubRows] = useState<Record<string, any>>({});

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
    visibleColumns,
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

  const handleRowClick = (row: Row<T>) => {
    onSelectedRowChange(row.original);
  };

  return (
    // apply the table props
    <Box sx={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1
    }}>
      {loading && (
        <TableLoadingOverlay>
          <CircularProgress />
        </TableLoadingOverlay>
      )}
      <Box
        sx={{
          flexGrow: 1,
          marginTop: '12px',
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
                  const rowProps = row.getRowProps();
                  return (
                    // Apply the row props
                    <Fragment key={rowProps.key}>
                      <TableRow
                        onClick={() => handleRowClick(row)}
                        {...rowProps}>
                        {// Loop over the rows cells
                          row.cells.map((cell) => {
                            // Apply the cell props
                            return (
                              <TableRowCell title={`${cell.value}`} {...cell.getCellProps()}>
                                {// Render the cell contents
                                  cell.render('Cell', { setSubRows })}
                              </TableRowCell>
                            );
                          })}
                      </TableRow>
                      {row.isExpanded ? (
                        <TableSubRow {...rowProps} key={`${rowProps.key}-expanded`}>
                          <TableRowCell colSpan={visibleColumns.length}>
                            {subRows[row.id]}
                          </TableRowCell>
                        </TableSubRow>
                      ) : null}
                    </Fragment>
                    // <TableRow
                    //   onClick={() => handleRowClick(row)}
                    //   {...row.getRowProps()}>
                    //   {// Loop over the rows cells
                    //     row.cells.map((cell) => {
                    //       // Apply the cell props
                    //       return (
                    //         <TableRowCell {...cell.getCellProps()}>
                    //           {// Render the cell contents
                    //             cell.render('Cell')}
                    //         </TableRowCell>
                    //       );
                    //     })}
                    // </TableRow>
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
