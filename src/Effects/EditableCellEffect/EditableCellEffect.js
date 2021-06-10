import React from "react";
import {useSelector, useDispatch} from "react-redux";
import InputModal from "../../SharedComponents/InputModal/InputModal";
import {removeEditableCell} from "../../Redux/action/editableCell";
import {updateLine} from "../../Redux/action/loadDataSuccess";


const EditableCellEffect = () => {
    const EditableCell = useSelector(state => state.EditableCell);
    const LoadedData = useSelector(state => state.LoadedData)

    const [editModalIsOpen, setEditModalIsOpen] = React.useState(false);
    const [newValue, setNewValue] = React.useState(null);

    const dispatch = useDispatch();

    const dispatchRemoveEditableCell = () => {
        dispatch(removeEditableCell());
    }
    const dispatchUpdateLine = (index, line) => {
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
        const newLine = JSON.parse(JSON.stringify(LoadedData[EditableCell.rowIndex]))
        newLine[EditableCell.keyName].label = newValue;
        console.log(newLine);
        dispatchUpdateLine(EditableCell.rowIndex, newLine);
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
            setInputValue={(value)=>{setNewValue(value)}}
            value={newValue}
            showState={editModalIsOpen}
            onClose={()=>{dispatchRemoveEditableCell()}}
        />
        }
        </>
    )
}

export default EditableCellEffect;