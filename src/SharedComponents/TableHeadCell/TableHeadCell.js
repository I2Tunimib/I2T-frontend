import style from "./TableHeadCell.module.css";
import React from "react";

const TableHeadCell = (props) => {
    const {col} = props;


    return (
        <div className={style.headerCell}>
        <div className={style.statusCell}>
        </div>
        <div className={style.accessorCell}>
            <p>
            {col}
            </p>
        </div>
        </div>
    )

}

export default TableHeadCell;