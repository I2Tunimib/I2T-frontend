import {useSelector} from "react-redux";
import { RootState } from "../../../../Redux/store";
import {ReactComponent as BackIcon} from "../../../../Assets/icon-set/back/back.svg";
import { Link } from "react-router-dom";

const TableName = () => {
    const LoadedName = useSelector((state: RootState) => state.Name);

    return (
        <div className='table-name'>
            <Link to='/'>
                <BackIcon/>
            </Link>
            <h2>
                {LoadedName}
            </h2>
        </div>
    )
}

export default TableName;