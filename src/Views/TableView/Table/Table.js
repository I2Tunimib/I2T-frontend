import style from "./Table.module.css";
import { useSelector } from "react-redux";
import MUIDataTable from "mui-datatables";
import TableHeadCell from "./TableHeadCell/TableHeadCell";
import Cell from "./Cell/Cell";
import React from "react";


const Table = () => {
    const LoadedColumns = useSelector(state => state.LoadedColumns);
    const LoadedData = useSelector(state => state.LoadedData);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [pageIndex, setPageIndex] = React.useState(0);
    const [addedCols, setAddedCols] = React.useState([]);


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
                                    <TableHeadCell col={column}/>
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