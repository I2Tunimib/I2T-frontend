import { useSelector, useDispatch } from "react-redux";
import MUIDataTable from "mui-datatables";
import TableHeadCell from "./TableHeadCell/TableHeadCell";
import Cell from "./Cell/Cell";
import React from "react";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import {deleteLine} from "../../../Redux/action/loadDataSuccess";


const Table = () => {
    const LoadedColumns = useSelector(state => state.LoadedColumns);
    const LoadedData = useSelector(state => state.LoadedData);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [pageIndex, setPageIndex] = React.useState(0);
    const [lastDeletedCol, setLastDeletedCol] = React.useState(null);

    const dispatch = useDispatch();

    const dispatchDeleteLine= (data) => {
        dispatch(deleteLine(data));
    }

    const options = {
        draggableColumns: {
            enabled: true,
        },
        tableBodyHeight: '70vh',
        fixedHeader: true,
        rowsPerPageOptions: [10, 20, 50],
        onChangeRowsPerPage: (numberOfRows) => {
            setRowsPerPage(numberOfRows);
        },
        onChangePage: (pageIndex) => {
            setPageIndex(pageIndex);
        },
        onRowsDelete: (rowsDeleted, newTableData ) => {
            // TODO probably delete this function and implement it manually
            //console.log('ciao');
            //  dispatchLoadData(newTableData);
            const rowsToDelete = [];
            for (const row of rowsDeleted.data) {
                rowsToDelete.push(row.dataIndex);
            }

            rowsToDelete.sort((a,b) => a - b);

            for (const item of rowsToDelete) {
                dispatchDeleteLine(item);
            }
            setLastDeletedCol(lastDeletedCol + 1);
        }

    }

    const getMuiTheme = () => createMuiTheme({
        overrides: {
            MUIDataTableBodyCell: {
                root: {
                    // backgroundColor: "#FF0000",
                    height: "2rem",
                    // width: "100%",
                    margin: "0",
                    textAlign: "center",
                }
            },
            MUIDataTableHeadCell: {
                root: {
                    padding: " 1rem 0",
                    width: "100%",
                    minWidth: "7rem",
                    maxWidth: "15rem",
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
        <> <MuiThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
                columns={LoadedColumns.map((col) => {
                    const newCol = {
                        label: col.label,
                        name: col.name,
                        options: {
                            customHeadLabelRender: (column) => {
                                return (
                                    <TableHeadCell col={column} />
                                )
                            },
                            new: col.new,
                            selected: col.selected,
                            customBodyRenderLite: (dataIndex, rowIndex) => {
                                return (
                                    <>
                                        <Cell
                                            dataIndex={dataIndex}
                                            rowIndex={rowIndex}
                                            keyName={col.name}
                                            rowsPerPage={rowsPerPage}
                                            pageIndex={pageIndex} 
                                            lastDeletedCol={lastDeletedCol}
                                            />
                                    </>
                                )
                            }
                        }
                    };

                    return newCol;
                })}
                data={LoadedData}
                title={""}
                options={options}
            />
        </MuiThemeProvider>
        </>
    )
}

export default Table;