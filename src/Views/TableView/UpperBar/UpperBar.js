import TableName from "./TableName/TableName";
import CommandsBar from "./CommandsBar/CommandsBar";
import style from "./UpperBar.module.css";
import { Card } from "react-bootstrap";


const UpperBar = () => {
    return (
        <Card>
            <Card.Body>
                <div className={style.upperBar}>

                    <TableName />

                    <CommandsBar />


                </div>
            </Card.Body>
        </Card>

    )
}

export default UpperBar;