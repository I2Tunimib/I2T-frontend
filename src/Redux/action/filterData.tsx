export const setFilterData = (filteredData: any[]) => {
    console.log(filteredData);
    return {
        type: "SETFILTERED",
        filteredData,
    }
}
