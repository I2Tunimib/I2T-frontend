const filterDataReducer = (state: any[] = [], action: {type: string, filteredData: any[], colName: string }) => {
    switch(action.type) {
        case "SETFILTERED":
            return state = [...action.filteredData];
        default: 
            return state;
    }
}

export default filterDataReducer;