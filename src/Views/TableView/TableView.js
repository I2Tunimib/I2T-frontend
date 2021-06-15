import Table from "./Table/Table";
import UpperBar from "./UpperBar/UpperBar";
import { useSelector } from "react-redux";
import React from "react";

const TableView = () => {

    const LoadedColumns = useSelector(state => state.LoadedColumns);
    const LoadedData = useSelector(state => state.LoadedData);

    return (
        <>
            {
                LoadedColumns && LoadedData &&
                <>
                {
                    Array.isArray(LoadedColumns) && Array.isArray(LoadedData) && 
                        <Table />
                }
                </>
            }

        </>
    )
}

export default TableView;