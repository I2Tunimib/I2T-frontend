import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {setLoadingState, unsetLoadingState} from "../../Redux/action/loading";
import {getOptionsToExtend, getLineToExtend} from "../../Http/httpServices";
import {displayError} from "../../Redux/action/error";
import InputModal from "../../SharedComponents/InputModal/InputModal";
import RadioModal from "../../SharedComponents/RadioModal/RadioModal";
import {updateLine} from "../../Redux/action/loadDataSuccess";
import {popToExtendCol} from "../../Redux/action/toExtendRows";
import {extendedRow} from "../../Redux/action/extendRow";

const ExtendCellEffect = () => {
    const ExtendRow = useSelector(state => state.ExtendRow);
    const ToExtendRows = useSelector(state => state.ToExtendRows);
    const LoadedData = useSelector(state => state.LoadedData)
    const [matchingValue, setMatchingValue] = React.useState("");
    const [matchingDate, setMatchingDate] = React.useState({})
    const [cities, setCities] = React.useState([])
    const [modalIsOpen, setModalIsOpen] = React.useState(false);
    const [targetCity, setTargetCity] = React.useState("");

    const dispatch = useDispatch();
    
    const dispatchLoadingState = () => {
        dispatch(setLoadingState());
    }

    const dispatchNoLoadingState = () => {
        dispatch(unsetLoadingState());
    }

    const dispatchError = () => {
        dispatch(displayError());
    }

    const dispatchUpdateLine = (index, line) => {
        dispatch(updateLine(index, line))
    }

    const dispatchPopToExtendCol = (index) => {
        dispatch(popToExtendCol(index));
    }
    const dispatchNoExtendRow = () => {
        dispatch(extendedRow());
    }

    const findCityValue = () => {
        setMatchingValue('');
        setMatchingDate({});
        setCities([]);
        setTargetCity('');
        for (const extRow of ToExtendRows) {
            if (ExtendRow === extRow.rowIndex) {
                setMatchingValue(extRow.matchingValue);
                setMatchingDate(extRow.matchingDate);
                return;
            }
        }
        dispatchNoExtendRow();
        dispatchError('An error occurred, impossible to find matching value on this row');
    }

    const fillRow = () => {
        if(cities.length >= 1) {
            dispatchLoadingState();
        (async () => {
            const newData = await getLineToExtend("meteo", targetCity, matchingDate.year, matchingDate.month, matchingDate.day)
            console.log(newData);
            if (await newData.status !== 200) {
                dispatchNoLoadingState();
                dispatchNoExtendRow();
                dispatchError(`Error:${newData.status}, ${newData.statusText}`)
            } else if (newData.data.error) {
                dispatchNoLoadingState();
                dispatchNoExtendRow();
                dispatchError(`Error:${newData.data.error}`)
            } else {
                const newLine = newData.data;
                dispatchUpdateLine(ExtendRow, {...LoadedData[ExtendRow], ...newLine});
                dispatchNoLoadingState();
                dispatchNoExtendRow();
                // removing toextendCol
                for(const col of ToExtendRows) {
                    if (col.rowIndex === ExtendRow) {
                        dispatchPopToExtendCol(col.rowIndex);

                    }
                }
            }
        })()
        } else {
            dispatchNoLoadingState();
            checkCitiesAndOpenModal(targetCity);
        }
        
    }

    const checkCitiesAndOpenModal = (city = matchingValue) => {
        dispatchLoadingState();
        //if(true) {
            (async () => {
            // http call
            const response = await getOptionsToExtend(city, matchingDate.year, matchingDate.month, matchingDate.day);
            if (await response.status === 200) {
                // do something
                if (response.data.error && response.data.error !== "no cities found") {
                    // dispatchError(response.data.error)
                    dispatchNoLoadingState();
                    return dispatchError(response.data.error);
                } else {
                    //OpenRadioModalHere
                    if(response.data.error === "no cities found") {
                        dispatchNoLoadingState();
                        setModalIsOpen(true);
                        return ;
                    } 
                    if (!response.data.error) {
                        console.log(response.data);
                        const cityArr = [];
                        for (const city of response.data) {
                            const cityObj = {
                                label: `${city.comune}  ${city.dist.toString().substr(0, 4)}km`,
                                value: `${city.comune}`,
                            }
                            cityArr.push(cityObj);
                        }
                        console.log(cityArr);
                        setCities(cityArr);
                        console.log(cities);
                        dispatchNoLoadingState();
                        setModalIsOpen(true);
                        return ;
                    }
                    dispatchNoLoadingState();
                    return dispatchError("An unknown error occurred, please try later");

                }

            } else {
                dispatchError(`Error:${response.status}, ${response.statusText}`)
                dispatchNoLoadingState();
            }
        })()
    }

    React.useEffect(()=>{
        console.log('openModal');
        if(matchingValue && matchingDate) {
            checkCitiesAndOpenModal();
        }
        
    },[matchingDate, matchingValue])

    React.useEffect(()=>{
        console.log(ExtendRow);
        if(ExtendRow){
            findCityValue();
        }
        if(ExtendRow === 0) {
            findCityValue();
        }
        
    }, [ExtendRow])

    return(
        <>
{
            modalIsOpen && cities.length >= 1 &&
            //OPEN radio modal here
            <RadioModal 
            inputArray={cities}
            titleText="Estendi riga"
            text="Scegli una delle seguenti città:"
            mainButtonLabel="Conferma"
            mainButtonAction={()=>{fillRow(); setModalIsOpen(false)}}
            secondaryButtonLabel="Annulla"
            secondaryButtonAction={() => {setModalIsOpen(false); dispatchNoExtendRow()}}
            showState={modalIsOpen}
            onClose={() => {setModalIsOpen(false); dispatchNoExtendRow();}}
            setInputValue= {
                (value) => {setTargetCity(value)}
            }
            />
        }{
            modalIsOpen && cities.length < 1 &&
            //open textModalHere
            <InputModal 
            inputLabel="Scegli manualmente una città:"
            titleText="Estendi riga"
            text={"Non è stato possibile trovare una località con il nome " + (targetCity || matchingValue)}
            mainButtonLabel="Conferma"
            mainButtonAction={()=>{fillRow()}}
            secondaryButtonLabel="Annulla"
            secondaryButtonAction={()=>{setModalIsOpen(false); dispatchNoExtendRow()}}
            showState={modalIsOpen}
            onClose={()=>{setModalIsOpen(false); dispatchNoExtendRow();}}
            setInputValue ={(value) => {setTargetCity(value)}}
            />

        }
        </>
    )
}

export default ExtendCellEffect;