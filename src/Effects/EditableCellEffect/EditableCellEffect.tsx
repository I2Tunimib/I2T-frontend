import React, { SetStateAction } from "react";
import {useSelector, useDispatch} from "react-redux";
import InputModal from "../../SharedComponents/InputModal/InputModal";
import {removeEditableCell} from "../../Redux/action/editableCell";
import {updateLine} from "../../Redux/action/data";
import { RootState } from "../../Redux/store";
import { useTranslation } from 'react-i18next';


const EditableCellEffect = () => {
    const { t } = useTranslation();
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
        const newLine = JSON.parse(JSON.stringify(LoadedData[EditableCell!.rowIndex]))
        newLine[EditableCell!.keyName].label = newValue;
        dispatchUpdateLine(EditableCell!.rowIndex, newLine);
        dispatchRemoveEditableCell()
    }

    return (
        <>
        { editModalIsOpen &&
        <InputModal 
            inputLabel={t('table.cells.editable-cell-modal.input-label')}
            titleText={t('table.cells.editable-cell-modal.title-text')}
            mainButtonLabel={t('buttons.confirm')}
            secondaryButtonLabel={t('buttons.cancel')}
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