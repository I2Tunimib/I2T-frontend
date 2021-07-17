export const setFilterData = (filteredData: any[]) => {
    return {
        type: "SETFILTERED",
        filteredData,
    }
}
