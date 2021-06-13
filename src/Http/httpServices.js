import {BASE_URL, ALL_RECON, SAVED, TABLES} from "./paths";
import axios from "axios";
import { errorHandler } from "./errorHandler";


export async function getAllTables() {
    const response = await axios.get(TABLES + "/");
    const error = errorHandler(await response);
    if (await !error){
        return response.data;
    } else {
        return {error: error}
    }
    
}

export async function getAllSaved() {
    const response = await axios.get(SAVED + "/");
    const error = errorHandler(await response);
    if (await !error){
        return response.data;
    } else {
        return {error: error}
    }
}

export async function getTable(name) {
    const response = await axios.get(`${TABLES}/${name}/`);
    const error = errorHandler(await response);
    if (await !error){
        console.log(response);
        return response.data;
    } else {
        return {error: error}
    }
}

export async function getSaved(name) {
    const response = await axios.get(`${SAVED}/${name}/`);
    const error = errorHandler(await response);
    if (await !error){
        return response.data;
    } else {
        return {error: error}
    }
}

export async function saveTable(data, name) {
    const response = await axios.put(`${SAVED}/${name}/`, data);
    const error = errorHandler(await response);
    if (await !error){
        return response.data;
    } else {
        return {error: error}
    }
}

export async function getAllReconciliator() {
    const response = await axios.get(ALL_RECON);
    const error = errorHandler(await response);
    if (await !error){
        return response.data;
    } else {
        return {error: error}
    }
}

export async function reconciliateService(internalUrl, payload) {
    const response = await axios.post(`${BASE_URL}${internalUrl}/`, payload);
    const error = errorHandler(await response);
    if (await !error){
        return response;
    } else {
        return {error: error}
    }
}