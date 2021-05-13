import style from "./Table.module.css";
import { useSelector } from "react-redux";
import MainButton from "../../../SharedComponents/MainButton/MainButton";
import SecondaryButton from "../../../SharedComponents/SecondaryButton/SecondaryButton"; 
import MUIDataTable from "mui-datatables";
import TableHeadCell from "../../../SharedComponents/TableHeadCell/TableHeadCell";
import Cell from "./InCellComponents/Cell/Cell";


const Table = () => {
    const LoadedColumns = useSelector(state => state.LoadedColumns);
    const LoadedData = useSelector(state => state.LoadedData);

    const options = {
        onCellClick: function (colData, cellMeta) {
            console.log(colData, cellMeta)
        },
        draggableColumns: {
            enabled: true,
        },
        tableBodyHeight: '70vh',
        fixedHeader: true,
        
    }
    
    

    return (
        <>
        <MUIDataTable
        columns={LoadedColumns.map((col)=>{
            const newCol = {
                label: col.label,
                name: col.name,
                options: {
                    customHeadLabelRender: (column) => {
                        return (
                            <TableHeadCell col={column}/>
                        )
                    },
                    selected: col.selected,
                    customBodyRenderLite: (dataIndex,rowIndex) => {
                        return <Cell dataIndex={dataIndex} keyName={col.name}/>
                    }
                }
            };
            
            return newCol;
        })}
        data={LoadedData}
        title={""}
        options = {options}
        />
        </>
    )
}

export default Table;