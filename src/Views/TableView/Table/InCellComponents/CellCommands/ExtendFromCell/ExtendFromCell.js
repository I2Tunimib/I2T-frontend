import MainButton from "../../../../../../SharedComponents/MainButton/MainButton";
import {useSelector} from "react-redux";
import React from "react";

const ExtendFromCell = (props) => {

    const {dataIndex} = props;
    const ToExtendCols = useSelector(state => state.ToExtendCols);
    const LoadedData = useSelector(state => state.LoadedData);
    const [hasToExtend, setHasToExtend] = React.useState(false);

    React.useEffect(()=> {

        for (const col of ToExtendCols) {
            if(dataIndex === col.rowIndex) {
                //TODO call here service
                console.log(dataIndex);
            }
        }

    }, [ToExtendCols])

    return (
        <>
        {
            hasToExtend &&
            <MainButton label="Estendi"/>
        }
        </>
    )
}

export default ExtendFromCell;