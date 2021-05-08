import {BASE_URL} from "./paths";
import axios from "axios";



export async function  getDayData (type, region, date, dispatchError) {
    await axios.get(`${BASE_URL}${type}/${region}/${date.year}/${date.month}/${date.day}`)
        .then((res)=>{return res;})
        .catch((err)=>{dispatchError(err)})
}