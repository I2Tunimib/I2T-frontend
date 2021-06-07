import {BASE_URL, GET_OPTIONS, SAVE, SINGLE_LINE, ALL_RECON, BASE_RECON_URL} from "./paths";
import axios from "axios";
import {convert} from "../LogicUtilities/formatConverter";



export async function  getDayData (type, region, date, dispatchError, setLoadingState, unsetLoadingState, dataDispatch) {
    setLoadingState();
    await axios.get(`${BASE_URL}${type}/${region}/${date.year}/${date.month}/${date.day}`)
        .then((res)=>{
            unsetLoadingState();
            if(res.data.error) {
                dispatchError(res.data.error.toString());
                return;
            }
            if(res.data.data.length === 0) {
                dispatchError("No data available");
                return;
            }
            dataDispatch(res.data.data); 
            })
        .catch((err)=>{unsetLoadingState(); dispatchError(err)})
}

export async function getSavedData(name, dispatchError, setLoadingState, unsetLoadingState, dataDispatch) {
    setLoadingState();
    await axios.get(`${BASE_URL}${SAVE}${name}`)
        .then((res) => {
            dataDispatch(res.data.data);
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

export async function getLineToExtend (dataset, provincia, year, month, day ) {
    return axios.get(`${BASE_URL}${dataset}/${SINGLE_LINE}${provincia}/${year}/${month}/${day}`);
        /*.then((res)=> {
            console.log(res.data);
            return res.data;
        })
        .catch((err)=> {
            dispatchError(err);
        })*/
}

export async function getOptionsToExtend (provincia, anno, mese, giorno) {
    return axios.get(`${BASE_URL}${GET_OPTIONS}meteo/${provincia}/${anno}/${mese}/${giorno}`);
}

export async function saveTable(data, name) {
    return axios.put(`${BASE_URL}save/${name}`, {data: data})
}

export async function saveAsTable(data, name) {
    return axios.post(`${BASE_URL}save/${name}`, {data: data})
}

export async function getAllReconciliator() {
    return axios.get(ALL_RECON);
}

export async function reconciliate(internalUrl, payload) {
    console.log(`${BASE_RECON_URL}${internalUrl}`);
    return axios.post(`${BASE_RECON_URL}${internalUrl}`, payload)
}