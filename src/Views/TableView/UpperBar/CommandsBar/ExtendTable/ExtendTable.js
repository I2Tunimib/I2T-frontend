import { InputGroup, Dropdown, DropdownButton, Button } from "react-bootstrap";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { displayError } from "../../../../../Redux/action/error";
import { setLoadingState, unsetLoadingState } from "../../../../../Redux/action/loading";
import { getLineToExtend } from "../../../../../Http/httpServices";
import { updateLine } from "../../../../../Redux/action/loadDataSuccess";
import { loadColumns } from "../../../../../Redux/action/loadColumns";
import {hasExtended} from "../../../../../Redux/action/hasExtended";
import MainButton from "../../../../../SharedComponents/MainButton/MainButton";
import DropdownModal from "../../../../../SharedComponents/DropdownModal/DropdownModal";
import {addToExtendCols} from "../../../../../Redux/action/toExtendCols";


const ExtendTable = () => {
    const LoadedColumns = useSelector(state => state.LoadedColumns);
    const LoadedData = useSelector(state => state.LoadedData);
    const Loading = useSelector(state => state.Loading)
    const dispatch = useDispatch();

    const dispatchError = (error) => {
        dispatch(displayError(error));
    }
    const dispatchLoading = () => {
        dispatch(setLoadingState());
    }

    const dispatchNoLoading = () => {
        dispatch(unsetLoadingState());
    }

    const dispatchUpdateLine = (index, line) => {
        dispatch(updateLine(index, line))
    }


    const dispatchHasExtended = () => {
        dispatch(hasExtended());
    }

    const dispatchToExtendCol = (colsInfo) => {
        dispatch(addToExtendCols(colsInfo))
    }

    const dataSet = [{
        label: "Meteo.it",
        value: "meteo"
    }]

    const [modalIsOpen, setModalIsOpen] = React.useState(false);

    const [selectedColumns, setSelectedColumns] = React.useState([]);

    const [selectedDataset, setSelectedDataset] = React.useState('');

    const dataSetDropdown = dataSet.map((item) => {
        return (
            <Dropdown.Item key={item.value} onClick={(e) => { setSelectedDataset(item) }}>{item.label}</Dropdown.Item>
        )
    })

    React.useEffect(() => {
        const selectedColumns = [];
        for (const col of LoadedColumns) {
            if (col.selected) {
                selectedColumns.push(col);
            }
        }
        setSelectedColumns(selectedColumns);
    }, [LoadedColumns])

    const setNewColumns = (dataSet) => {
        let colsLabel = [];
        const cols = [];
        //finding the most complete row to extract keys
        for (let i = 0; i < dataSet.length; i++) {
            if (Object.keys(dataSet[i]).length > cols) {
                colsLabel = Object.keys(dataSet[i]);
            }
        }
        for (const label of colsLabel) {
            let labelExists = false;
            for (const previousCol of LoadedColumns) {
                // if columns already exists i take his data
                if (label === previousCol.name) {
                    labelExists = true;
                    cols.push({
                        label: previousCol.label,
                        name: previousCol.name,
                        selected: previousCol.selected
                    })
                    break;
                }
            }
            //else id create new
            if (!labelExists) {
                cols.push({
                    label: label,
                    name: label,
                    selected: false,
                })
            }
        }
        return cols;

    }

    const extendTable = () => {
        //some comments here...
        dispatchLoading();
        let responseCounter = 0;
        for (let i = 0; i < LoadedData.length; i++) {
            //creating an empty new line
            let newLine = {};
            //setting data
            const data = LoadedData[i].data;
            const splittedData = data.split('-');
            let year = splittedData[0];
            let month = splittedData[1];
            let day = splittedData[2].split('T')[0];
            //setting city
            let provincia = LoadedData[i].denominazione_provincia; 
            //pushing selected col props in the new line
            for (const col of selectedColumns) {
                //coping all selected value;
                newLine[col.name] = LoadedData[i][col.name];
            }
            // now i call httpservice
            (async () => {
                const newLineData = await getLineToExtend(selectedDataset.value, provincia, year, month, day);
                if (await newLineData.status === 200) {
                    responseCounter ++;
                    const newLineProps = newLineData.data;
                    // if it is empty i save it, maybe i wanto to extend later..
                    if (Object.keys(newLineProps).length === 0) {
                        dispatchToExtendCol({
                            rowIndex: i,
                            matchingValue: provincia,
                            matchingcol: "LOCALITA"
                        })
                    }
                    newLine = { ...newLine, ...newLineProps };
                    dispatchUpdateLine(i, newLine);
                    if (responseCounter === LoadedData.length) {
                        dispatchHasExtended();
                        dispatchNoLoading();
                    }
                } else {
                    dispatchError(`Error:${newLineData.status}, ${newLineData.statusText}`);
                    dispatchNoLoading();
                }
            })()
        }
    }


    return (
        <>
            { selectedColumns.length >= 1 &&
                <MainButton label="Extendi" cta={() => setModalIsOpen(true)}/>
            }
            {
                modalIsOpen &&
                <DropdownModal inputLabel="Seleziona" 
                titleText="Estendi Tabella" 
                text="Seleziona un dataset con cui estendere la tua tabella"
                mainButtonLabel="Conferma"
                mainButtonAction={() => {extendTable(); setModalIsOpen(false)}}
                secondaryButtonLabel="Annulla"
                secondaryButtonAction={() => setModalIsOpen(false)}
                showState={modalIsOpen}
                inputValues={dataSet}
                onClose={() => setModalIsOpen(false)}
                setInputValue={(dataSet) => setSelectedDataset(dataSet)}
                />
            }
                

        </>

    )
}

export default ExtendTable;