import React, { SetStateAction } from "react";
import {useSelector, useDispatch} from "react-redux";
import InputModal from "../../SharedComponents/InputModal/InputModal";
import {removeEditableCell} from "../../Redux/action/editableCell";
import {updateLine} from "../../Redux/action/data";
import { RootState } from "../../Redux/store";


const EditableCellEffect = () => {
    const EditableCell = useSelector((state: RootState) => state.EditableCell);
    const LoadedData = useSelector((state: RootState) => state.Data)

    const [editModalIsOpen, setEditModalIsOpen] = React.useState(false);
    const [newValue, setNewValue] = React.useState('');

    const dispatch = useDispatch();

    const dispatchRemoveEditableCell = () => {
        dispatch(removeEditableCell());
    }
    const dispatchUpdateLine = (index: number, line: any) => {
        dispatch(updateLine(index, line))
    }

    React.useEffect(()=>{
        if(EditableCell) {
            setEditModalIsOpen(true);
            setNewValue(LoadedData[EditableCell.rowIndex][EditableCell.keyName].label);
        } else {
            setEditModalIsOpen(false);
        }
        
    },[EditableCell])

    const edit = () => {
        console.log(newValue);
        const newLine = JSON.parse(JSON.stringify(LoadedData[EditableCell!.rowIndex]))
        newLine[EditableCell!.keyName].label = newValue;
        console.log(newLine);
        dispatchUpdateLine(EditableCell!.rowIndex, newLine);
        dispatchRemoveEditableCell()
    }

    return (
        <>
        { editModalIsOpen &&
        <InputModal 
            inputLabel="Inserisci il valore con cui vuoi editare la cella:"
            titleText="Edita cella"
            mainButtonLabel="Conferma"
            secondaryButtonLabel="Annulla"
            secondaryButtonAction={()=>{dispatchRemoveEditableCell()}}
            mainButtonAction={()=>{edit()}}
            setInputValue={(value: SetStateAction<string>)=>{setNewValue(value)}}
            value={newValue}
            showState={editModalIsOpen}
            onClose={()=>{dispatchRemoveEditableCell()}}
        />
        }
        </>
    )
}

export default EditableCellEffect;