import useScroll from "@hooks/scroll/useScroll";
import {
  Box,
  CircularProgress,
  IconButton,
  Pagination,
  Paper,
  Checkbox,
  Radio,
  Stack,
  TableCell,
  Typography,
} from "@mui/material";
import {
  forwardRef,
  Fragment,
  PropsWithChildren,
  useRef,
  useState,
} from "react";
import {
  Row,
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
} from "@tanstack/react-table";
import Empty from "@components/kit/Empty";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import {
  Table,
  TableHead,
  TableHeaderCell,
  TableLoadingOverlay,
  TableRow,
  TableRowCell,
  TableSubRow,
} from "./CustomTableStyles";
import ColumnHide from "./ColumnHide";
import { CheckBox } from "@mui/icons-material";

export interface TableProperties<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  data: any[];
  onSelectedRowChange: (row: T | null) => void;
  onSelectedRowDeleteRequest: (row: T | null) => void;
  showCheckbox?: boolean;
  onRowCheck: (rowId: string) => void;
  stickyHeaderTop?: string;
  loading?: boolean;
}

export function Footer<T>({table}: { table: ReturnType<typeof useReactTable<T>>}
) {
  const rowCount = table.getRowModel().rows.length;
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;

  const handleChange = (_: any, page: number) => {
    table.setPageIndex(page - 1);
  };

  return (
    <Stack
      position="sticky"
      bottom={0}
      direction="row"
      alignItems="center"
      sx={{
        backgroundColor: "#FFF",
        borderTop: "1px solid rgb(224, 224, 224)",
        marginTop: "auto",
        padding: "6px 16px",
      }}
    >
      <Typography color="textSecondary" variant="body2">
        {`Total candidates: ${rowCount}`}
      </Typography>
      <Pagination
        sx={{
          marginLeft: "auto",
        }}
        size="small"
        onChange={handleChange}
        count={pageCount}
        page={pageIndex + 1}
        showFirstButton
        showLastButton
      />
    </Stack>
  );
}

const RadioCell = forwardRef(
  ({ indeterminate, checked, onChange, ...rest }: any, ref) => {
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
            ...rest,
          }}
        />
      </>
    );
  }
);

const defaultPropGetter = () => ({ prova: "ok" });

export default function CustomTable<T extends Record<string, unknown>>(
  props: PropsWithChildren<TableProperties<T>>
) {
  const {
    columns,
    data,
    onSelectedRowChange,
    onSelectedRowDeleteRequest,
    onRowCheck,
    stickyHeaderTop = "0px",
    disableDelete = false,
    loading = false,
    showRadio = true,
    showCheckbox = false,
    checkedRows = [],
  } = props;
  const [expanded, setExpanded] = useState({});
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  const deleteColumn = {
    id: "delete",
    header: "",
    enableHiding: true,
    cell: ({ row }) => (
      <IconButton
        disabled={disableDelete}
        color="error"
        onClick={(event) => {
          event.stopPropagation();
          handleDeleteRow(row);
        }}
      >
        <DeleteIcon />
      </IconButton>
    ),
  };
  const table = useReactTable(
    {
      columns: [deleteColumn, ...columns],
      data,
      state: {
        columnVisibility,
        expanded,
        sorting,
      },
      onColumnVisibilityChange: setColumnVisibility,
      onExpandedChange: setExpanded,
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
  });

  const [subRows, setSubRows] = useState<Record<string, any>>({});

  const allColumnsWithToggleProps = table.getAllLeafColumns()
    .filter(col => col.id !== "delete")
    .map(col => ({
      ...col, getToggleHiddenProps: () => ({
        checked: col.getIsVisible(),
        onChange: () => col.toggleVisibility(),
      }),
    Header: col.columnDef.header,
  }));

  const toggleAllProps = {
    checked: table.getAllLeafColumns().every(col => col.getIsVisible()),
    indeterminate:
      table.getAllLeafColumns().some(col => col.getIsVisible()) &&
      !table.getAllLeafColumns().every(col => col.getIsVisible()),
    onChange: () => {
      const allVisible = table.getAllLeafColumns().every(col => col.getIsVisible());
      table.getAllLeafColumns().forEach(col => col.toggleVisibility(!allVisible));
    },
  };

  const handleRowClick = (row: Row<T>) => {
    console.log("Row clicked:", row);
    onSelectedRowChange(row.original);
  };

  const handleDeleteRow = (row: Row<T>) => {
    onSelectedRowDeleteRequest(row.original);
  };

  return (
    <Stack position="relative" flexGrow={1}>
      {loading && (
        <TableLoadingOverlay>
          <CircularProgress />
        </TableLoadingOverlay>
      )}
      <Box padding="5px 16px" marginTop="12px" borderTop="1px solid #f0f0f0">
        <ColumnHide
          indeterminate={toggleAllProps} allColumns={allColumnsWithToggleProps}
        />
      </Box>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            ...(data.length === 0 && {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }),
          }}
        >
          {data.length > 0 ? (
            <Table>
              <TableHead stickyHeaderTop={stickyHeaderTop}>
                {
                  // Loop over the header rows
                  table.getHeaderGroups().map((headerGroup) => (
                    // Apply the header row props
                    <TableRow key={headerGroup.id}>
                      {
                        // Loop over the headers in each row
                        headerGroup.headers.map((header) => (
                        <TableHeaderCell key={header.id}>
                          {header.id !== "selection" ? (
                            <Stack
                              direction="row"
                              overflow="hidden"
                              whiteSpace="nowrap"
                              textOverflow="ellipsis"
                              gap="10px"
                              alignItems="center"
                            >
                            {
                              // Render the header
                              flexRender(header.column.columnDef.header, header.getContext())
                            }
                            <IconButton
                              sx={{
                                width: "25px",
                                height: "25px",
                              }}
                              size="small"
                            >
                              {header.column.getCanSort() ? (
                                header.column.getIsSorted() === "desc" ? (
                                  <ArrowDownwardRoundedIcon fontSize="small" />
                                ) : (
                                  <ArrowUpwardRoundedIcon fontSize="small" />
                                )
                              ) : (
                                <ArrowUpwardRoundedIcon
                                  sx={{ color: "#d4d4d4" }}
                                  fontSize="small"
                                />
                              )}
                            </IconButton>
                          </Stack>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHeaderCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              {/* Apply the table body props */}
              <tbody>
                {
                  // Loop over the table rows
                  table.getRowModel().rows.map((row) => (
                      // Apply the row props
                      <Fragment key={row.id}>
                        <TableRow
                          onClick={() => handleRowClick(row)}
                        >
                          {/* Cella per checkBox */}
                          {/* <TableCell
                            padding="checkbox"
                            sx={{
                              width: "50px",
                              minWidth: "50px",
                              maxWidth: "50px",
                            }} // Set fixed width
                          > */}
                          {/* Material UI checkbox */}
                          {/* <Checkbox
                              disabled={showCheckbox}
                              checked={checkedRows.includes(row.id)}
                              onChange={(event) => {
                                onRowCheck(row.id);
                              }}
                            />
                          </TableCell> */}
                          {
                            // Loop over the rows cells
                            row.getVisibleCells().map((cell) => (
                              // Apply the cell props
                                <TableRowCell
                                  key={cell.id}
                                  title={`${cell.getValue()}`}
                                >
                                  {
                                    // Render the cell contents
                                    flexRender(cell.column.columnDef.cell, {
                                      ...cell.getContext(),
                                      setSubRows,
                                    })
                                  }
                                </TableRowCell>
                              ))}
                        </TableRow>
                        {row.getIsExpanded() ? (
                          <TableSubRow key={`${row.id}-expanded`}>
                            <TableRowCell
                              style={{
                                width: "100%",
                                maxWidth: "100%",
                                padding: "12px",
                              }}
                              colSpan={
                                row.getVisibleCells().length + 1
                              } /* +1 for the delete button column */
                            >
                              <div className="expanded-content">
                                {subRows[row.id]}
                              </div>
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
                    ))}
              </tbody>
            </Table>
          ) : (
            <Empty/>
          )}
        </Box>
        <Footer table={table} />
      </Box>
    </Stack>
  );
}
