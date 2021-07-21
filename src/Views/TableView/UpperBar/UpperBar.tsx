import TableName from "./TableName/TableName";
import CommandsBar from "./CommandsBar/CommandsBar";


const UpperBar = () => {
    return (
        <>
                <div className='upper-bar'>

                    <TableName />

                    <CommandsBar />
                </div>
        </>

    )
}

export default UpperBar;