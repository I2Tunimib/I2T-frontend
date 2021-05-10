import {useSelector} from "react-redux";

const TableName = () => {
    const LoadedName = useSelector(state => state.LoadedName);

    return (
        <div>
            <h2>
                {LoadedName}
            </h2>
        </div>
    )
}

export default TableName;