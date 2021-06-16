import {useSelector} from "react-redux";
import { RootState } from "../../../../Redux/store";

const TableName = () => {
    const LoadedName = useSelector((state: RootState) => state.Name);

    return (
        <div>
            <h2>
                {LoadedName}
            </h2>
        </div>
    )
}

export default TableName;