import { useSelector } from "react-redux";
import MUIDataTable from "mui-datatables";
import TableHeadCell from "./TableHeadCell/TableHeadCell";
import Cell from "./Cell/Cell";
import React from "react";
import { createTheme, MuiThemeProvider } from '@material-ui/core/styles';
import UpperBar from "../UpperBar/UpperBar";
import { RootState } from "../../../Redux/store";
import { colInterface } from "../../../Interfaces/col.interface";


const Table = () => {
    const Columns = useSelector((state: RootState) => state.Columns);
    //const Data = useSelector((state: RootState) => state.Data);
    const FilteredData = useSelector((state: RootState) => state.FilteredData)
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [pageIndex, setPageIndex] = React.useState(0);
    // const [lastDeletedCol, setLastDeletedCol] = React.useState(null);
    // const [lastSortedCol, setLastSortedCol] = React.useState(null);

    /*const dispatchDeleteLine= (data) => {
        dispatch(deleteLine(data));
    }*/

    const options = {
        draggableColumns: {
            enabled: true,
        },
        customToolbar: () => {
            return (
                <UpperBar />
            )
        },
        // tableBodyHeight: /*(window.innerHeight - 150).toString() + "px"*/ "75vh",
        // fixedHeader: true,
        rowsPerPageOptions: [10, 20, 50],
        onChangeRowsPerPage: (numberOfRows: number) => {
            setRowsPerPage(numberOfRows);
        },
        onChangePage: (pageIndex: number) => {
            setPageIndex(pageIndex);
        },
        /*onColumnSortChange: (changedCol) => {
            setLastSortedCol(changedCol);
        },*/
        selectableRows: "none",
        fixedSelectColumn: true,
        sort: false,
    }

    const getMuiTheme = () => createTheme({
        overrides: {
            MUIDataTableBodyCell: {
                root: {
                    // backgroundColor: "#FF0000",
                    // change height to remove scrollbar on cell
                    // maxHeight: "8rem",
                    // width: "100%",
                    margin: "0",
                    paddingTop: '0.5rem',
                   // display: "table-flex",
                    textAlign: "center",
                    maxWidth: "50rem",
                    height: "100%",
                    // width: '100%',
                    //overflowY: 'scroll',
                }
            },
            MUIDataTableHeadCell: {
                root: {
                    padding: " 1rem 1rem",
                    //width: "100%",
                    minWidth: "7rem",
                    maxWidth: "30rem",
                    textAlign: "center",
                    // cursor: "grab",
                },
                contentWrapper: {
                    padding: "0 0rem",
                },
                toolButton: {
                    width: "100%",
                }
            },
        }
    })



    return (
        <div className="main-table"> <MuiThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
                columns={Columns.map((col) => {
                    const newCol = {
                        label: col.label,
                        name: col.name,
                        options: {
                            customHeadLabelRender: (column: colInterface) => {
                                return (
                                    <TableHeadCell col={column} />
                                )
                            },
                            type: col.type,
                            new: col.new,
                            selected: col.selected,
                            reconciliated: col.reconciliated,
                            reconciliator: col.reconciliator,
                            extendedMeta: col.extendedMeta,
                            filtered: col.filtered,
                            metadata: col.metadata,
                            customBodyRenderLite: (dataIndex: number, rowIndex: number) => {

                                return (
                                    <>
                                        <Cell
                                            dataIndex={dataIndex}
                                            rowIndex={rowIndex}
                                            keyName={col.name}
                                            col={col}
                                            rowsPerPage={rowsPerPage}
                                            pageIndex={pageIndex}
                                        // lastDeletedCol={lastDeletedCol}
                                        // lastSortedCol={lastSortedCol}
                                        />
                                    </>
                                )
                            }
                        }
                    };

                    return newCol;
                }) as any}
                data={FilteredData}
                title={""}
                options={options as any}
            />
        </MuiThemeProvider>
        </div>
    )
}

export default Table;