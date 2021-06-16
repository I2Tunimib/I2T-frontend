import {BASE_URL, ALL_RECON, SAVED, TABLES} from "./paths";
import axios from "axios";
import { errorHandler } from "./errorHandler";
import { httpResponseInterface } from "../Interfaces/http-response.interface";


export async function getAllTables(): Promise <httpResponseInterface> {
    const response = await axios.get(TABLES + "/");
    const error = errorHandler(await response);
    if (await !error){
        return {
            data: response.data,
            error: false,
            errorText: "",
        };
    } else {
        return {
            errorText: error,
            error: true,
            data: null,
        }
    }
    
}

export async function getAllSaved(): Promise <httpResponseInterface> {
    const response = await axios.get(SAVED + "/");
    const error = errorHandler(await response);
    if (await !error){
        return {
            data: response.data,
            error: false,
            errorText: "",
        };
    } else {
        return {
            errorText: error,
            error: true,
            data: null,
        }
    }
}

export async function getTable(name: string): Promise <httpResponseInterface> {
    const response = await axios.get(`${TABLES}/${name}/`);
    const error = errorHandler(await response);
    if (await !error){
        return {
            data: response.data,
            error: false,
            errorText: "",
        };
    } else {
        return {
            errorText: error,
            error: true,
            data: null,
        }
    }
}

export async function getSaved(name: string): Promise<httpResponseInterface> {
    const response = await axios.get(`${SAVED}/${name}/`);
    const error = errorHandler(await response);
    if (await !error){
        return {
            data: response.data,
            error: false,
            errorText: "",
        };
    } else {
        return {
            errorText: error,
            error: true,
            data: null,
        }
    }
}

export async function saveTable(data: any, name: string):Promise <httpResponseInterface> {
    const response = await axios.put(`${SAVED}/${name}/`, data);
    const error = errorHandler(await response);
    if (await !error){
        return {
            data: response.data,
            error: false,
            errorText: "",
        };
    } else {
        return {
            errorText: error,
            error: true,
            data: null,
        }
    }
}

export async function getAllReconciliator(): Promise <httpResponseInterface> {
    const response = await axios.get(ALL_RECON);
    const error = errorHandler(await response);
    if (await !error){
        return {
            data: response.data,
            error: false,
            errorText: "",
        };
    } else {
        return {
            errorText: error,
            error: true,
            data: null,
        }
    }
}

export async function reconciliateService(internalUrl: string, payload: any): Promise <httpResponseInterface> {
    const response = await axios.post(`${BASE_URL}${internalUrl}/`, payload);
    const error = errorHandler(await response);
    if (await !error){
        return {
            data: response.data,
            error: false,
            errorText: "",
        };
    } else {
        return {
            errorText: error,
            error: true,
            data: null,
        }
    }
}