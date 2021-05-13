import React from "react";
import {useSelector} from "react-redux";
import MainButton from "../../../../../SharedComponents/MainButton/MainButton";
import ExtendFromCell from "../CellCommands/ExtendFromCell/ExtendFromCell";
import CellCommands from "../CellCommands/CellCommands";

const Cell = (props) => {
    const {dataIndex, keyName} = props;

    const LoadedData = useSelector(state => state.LoadedData);

    const cellValue = LoadedData[dataIndex][keyName];

    return (
        <div>
            {cellValue}
            <CellCommands cellIndex={dataIndex} cellKey={keyName} cellValue={cellValue}/>
        </div>
    )
}

export default Cell;