import style from "./Table.module.css";
import { useSelector } from "react-redux";
import MainButton from "../../../SharedComponents/MainButton/MainButton";
import SecondaryButton from "../../../SharedComponents/SecondaryButton/SecondaryButton"; 
import MUIDataTable from "mui-datatables";
import TableHeadCell from "../../../SharedComponents/TableHeadCell/TableHeadCell";



const Table = () => {
    const LoadedColumns = useSelector(state => state.LoadedColumns);
    const LoadedData = useSelector(state => state.LoadedData);
    
    

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
                }
            };
            
            return newCol;
        })}
        data={LoadedData}
        title={""}
        />
        </>
    )
}

export default Table;