import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../Redux/store";
import React from "react";
import { setFilterData } from "../../Redux/action/filterData";


const FilterDataEffect = () => {

    //FilterDataEffect listen to Columns and looks for a filtered columns
    // if a filtered column is found, it makes the contextual operations on data
    const Columns = useSelector((state: RootState) => state.Columns);
    const Data = useSelector((state: RootState) => state.Data)
    const dispatch = useDispatch();

    const dispatchFilteredData = (filteredData: any[]) => {
        dispatch(setFilterData(filteredData))
    }

    /*React.useEffect(() => {
        console.log(Data);
        dispatchFilteredData(Data);
    }, [Data])*/

    React.useEffect(() => {
        let newFilteredData = Data;
        for (const col of Columns) {
            if (col.filtered) {
                //console.log(col.filtered);
                switch (col.filtered) {
                    case "match-true":
                        newFilteredData = [];
                        for (const row of Data) {
                            let hasMatch = false;
                            for (const meta of row[col.name].metadata) {
                                if (meta.match) {
                                    hasMatch = true
                                }
                            }
                            if (hasMatch) {
                                newFilteredData.push(row);
                            }

                        }
                        break;
                    case "match-false":
                        newFilteredData = [];
                        for (const row of Data) {
                            let hasMatch = false;
                            for (const meta of row[col.name].metadata) {
                                if (meta.match) {
                                    hasMatch = true
                                }
                            }
                            if (!hasMatch) {
                                newFilteredData.push(row);
                            }

                        }
                        break;
                    case "metadata-true":
                        //console.log('ciao!!!!');
                        newFilteredData = Data.filter((row: any) => {
                            return row[col.name].metadata.length >= 1;
                        })
                        
                        break;
                    case "metadata-false":
                        newFilteredData = Data.filter((row: any) => {
                            return row[col.name].metadata.length === 0;
                        })
                        
                        break;
                    case "score-over":
                        newFilteredData = Data.filter((row: any) => {
                            let hasOverScore = false;
                            for (const meta of row[col.name].metadata) {
                                if(parseInt(meta.score) > 50) {
                                    hasOverScore = true;
                                }
                            }
                            return hasOverScore;
                        })
                        break;
                    case "score-under":
                        newFilteredData = Data.filter((row: any) => {
                            let hasOverScore = false;
                            for (const meta of row[col.name].metadata) {
                                if(parseInt(meta.score) > 50) {
                                    hasOverScore = true;
                                }
                            }
                            return !hasOverScore;
                        })
                        break;
                    default:
                        return;
                }
            }
        }
        dispatchFilteredData(newFilteredData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [Columns, Data])


    return (
        <>
        </>
    )

}

export default FilterDataEffect;