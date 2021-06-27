import { useSelector, useDispatch } from "react-redux";
import React from "react";
import { RootState } from "../../../../../Redux/store";
import MainButton from "../../../../../SharedComponents/MainButton/MainButton";
import { colInterface } from "../../../../../Interfaces/col.interface";

const ExtendTable = () => {
    const Columns = useSelector((state: RootState )=> state.Columns);
    const [isExtensible, setIsExtensible] = React.useState<boolean>(false);
    const [selectedCol, setSelectedCol] = React.useState<colInterface | null>(null)

    React.useEffect(() => {
        const selectedAndReconciliated = [];    
        for (const col of Columns) {
            if (col.reconciliated && col.selected) {
                selectedAndReconciliated.push(col);
            }
        }
        if(selectedAndReconciliated.length === 1) {
            setIsExtensible(true);
            setSelectedCol(selectedAndReconciliated[0]);
        } else {
            setIsExtensible(false);
            setSelectedCol(null);
        }
    }, [Columns])


    const extend = () => {
        
    }
    
    return (
        <>
        {
            isExtensible &&
            <>
            <MainButton
            label="Estendi Colonna Selezionata"
            cta={() => {extend()}}
            />
            </>
        }
        </>
    )
}

export default ExtendTable;