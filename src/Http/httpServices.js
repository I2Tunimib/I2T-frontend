import {BASE_URL, SAVE} from "./paths";
import axios from "axios";
import {convert} from "../LogicUtilities/formatConverter";



export async function  getDayData (type, region, date, dispatchError, setLoadingState, unsetLoadingState, dataDispatch) {
    setLoadingState();
    await axios.get(`${BASE_URL}${type}/${region}/${date.year}/${date.month}/${date.day}`)
        .then((res)=>{
            if(res.data.error) {
                dispatchError(res.data.error.toString());
                return;
            }
            dataDispatch(res.data.data);
            unsetLoadingState(); 
            })
        .catch((err)=>{unsetLoadingState(); dispatchError(err)})
}

export async function getSavedData(name, dispatchError, setLoadingState, unsetLoadingState, dataDispatch) {
    setLoadingState();
    await axios.get(`${BASE_URL}${SAVE}${name}`)
        .then((res) => {
            dataDispatch(res.data);
            unsetLoadingState();
        })
        .catch((err)=> {unsetLoadingState(); dispatchError(err)})
}

export async function getExternalData(url, format, dispatchError, setLoadingState, unsetLoadingState, dataDispatch, dispatchName) {
    setLoadingState();
    await axios.get(`${BASE_URL}${url}`)
        .then((res) => {
            const convertedData = convert(format, res.data);
            dataDispatch(convertedData);
            unsetLoadingState();
        })
        .catch((err)=> {
            unsetLoadingState(); dispatchError(err);
        })
}