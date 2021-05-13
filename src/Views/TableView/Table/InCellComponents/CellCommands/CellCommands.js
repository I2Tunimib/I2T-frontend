import ExtendFromCell from "./ExtendFromCell/ExtendFromCell";

const CellCommands = (props) => {
    const { cellIndex, cellKey, cellValue } = props;


    return (
        <>
            <ExtendFromCell cellIndex={cellIndex} />
        </>
    )
}

export default CellCommands