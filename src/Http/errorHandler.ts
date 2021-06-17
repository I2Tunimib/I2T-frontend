export const errorHandler = (response: any) => {
    if (response.status !== 200) {
    
        return response.statusText;
    }
    if (response.data.error){
        return JSON.stringify(response.data.error);
    }
    return false;

}