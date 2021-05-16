import style from "./Table.module.css";
import { useSelector } from "react-redux";
import MainButton from "../../../SharedComponents/MainButton/MainButton";
import SecondaryButton from "../../../SharedComponents/SecondaryButton/SecondaryButton";
import MUIDataTable from "mui-datatables";
import TableHeadCell from "../../../SharedComponents/TableHeadCell/TableHeadCell";
import Cell from "./InCellComponents/Cell/Cell";
import React from "react";


const Table = () => {
    const LoadedColumns = useSelector(state => state.LoadedColumns);
    const LoadedData = useSelector(state => state.LoadedData);
    const HasExtended = useSelector(state => state.HasExtended);
    const ToExtendCols = useSelector(state => state.ToExtendCols);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [pageIndex, setPageIndex] = React.useState(0);

    const options = {
        draggableColumns: {
            enabled: true,
        },
        tableBodyHeight: '70vh',
        fixedHeader: true,
        rowsPerPageOptions: [10, 20, 50],
        onChangeRowsPerPage: (numberOfRows) => {
            console.log("cange");
            setRowsPerPage(numberOfRows);
        },
        onChangePage: (pageIndex) => {
             console.log("change");
            setPageIndex(pageIndex);
        },

    }



    return (
        <>
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
                            selected: col.selected,
                            customBodyRenderLite: (dataIndex, rowIndex) => {
                                return (
                                    <>
                                        <Cell 
                                        dataIndex={dataIndex} 
                                        rowIndex={rowIndex} 
                                        keyName={col.name} 
                                        rowsPerPage={rowsPerPage} 
                                        pageIndex={pageIndex} />
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
        </>
    )
}

export default Table;