import TableName from "./TableName/TableName";
import CommandsBar from "./CommandsBar/CommandsBar";
import style from "./UpperBar.module.css";
import { Card } from "react-bootstrap";


const UpperBar = () => {
    return (
        <>
                <div className={style.upperBar}>

                    <TableName />

                    <CommandsBar />
                </div>
        </>

    )
}

export default UpperBar;