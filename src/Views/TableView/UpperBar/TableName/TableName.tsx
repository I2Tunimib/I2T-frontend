import {useSelector} from "react-redux";
import { RootState } from "../../../../Redux/store";

const TableName = () => {
    const LoadedName = useSelector((state: RootState) => state.Name);

    return (
        <div className='table-name'>
            <h2>
                {LoadedName}
            </h2>
        </div>
    )
}

export default TableName;