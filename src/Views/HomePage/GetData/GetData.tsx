import { Card, Form } from "react-bootstrap";
import React, { SetStateAction } from "react";
import MainButton from "../../../SharedComponents/MainButton/MainButton";
import { getAllTables, getAllSaved, getTable, getSaved } from "../../../Http/httpServices";
import { useDispatch, useSelector } from "react-redux";
import { displayError } from "../../../Redux/action/error";
import { setLoadingState, unsetLoadingState } from "../../../Redux/action/loading";
import { deleteData, loadDataSuccess, loadSavedDataSuccess } from "../../../Redux/action/data";
import { loadName } from "../../../Redux/action/name";
import { useTranslation } from 'react-i18next';
import { colInterface } from "../../../Interfaces/col.interface";
import { cellTypeEnum } from "../../../Enums/cell-type.enum";
import { RootState } from "../../../Redux/store";
import InputModal from "../../../SharedComponents/InputModal/InputModal";
import { Redirect } from "react-router-dom";
import { deleteAllColumns, loadColumns } from "../../../Redux/action/columns";
import { convert } from "../../../utils/format-converter/formatConverter";
import { convertFromAppData, convertFromJSON } from "@utils/format-converter/converters";


const GetData: React.FC = () => {
    const { t } = useTranslation();
    const LoadedData = useSelector((state: RootState) => state.Data);
    const LoadedName = useSelector((state: RootState) => state.Name);
    const LoadedColumns = useSelector((state: RootState) => state.Columns);
    const dispatch = useDispatch();

    const dispatchError = (error: string) => {
        dispatch(displayError(error));
    }
    const dispatchSetLoading = () => {
        dispatch(setLoadingState());
    }
    const dispatchUnsetLoading = () => {
        dispatch(unsetLoadingState());
    }
    const dispatchLoadedSuccess = (data: any) => {
        dispatch(loadDataSuccess(data));
    }
    const dispatchLoadSavedSuccess = (data: any) => {
        dispatch(loadSavedDataSuccess(data));
    }
    const dispatchName = (name: string) => {
        dispatch(loadName(name));
    }

    const dispatchColumns = (columns: colInterface[]) => {
        dispatch(loadColumns(columns));
    }

    const dispatchDeleteAllCols = () => {
        dispatch(deleteAllColumns());
    }

    const dispatchDeleteData = () => {
        dispatch(deleteData());
    }



    const [dataSource, setDataSource] = React.useState("Table Server");
    const [savedName, setSavedName] = React.useState("");
    // const [externalUrl, setExternalUrl] = React.useState("");
    const [tableName, setTableName] = React.useState('');
    // const [format, setFormat] = React.useState("csv");
    const [allSaved, setAllSaved] = React.useState([]);
    const [allTables, setAllTables] = React.useState([])
    const [dataHasBeenLoaded, setDataHasBeenLoaded] = React.useState(false);
    const [isConfirmed, setIsConfirmed] = React.useState(false);
    const [format, setFormat] = React.useState<string>('');

    const savedOptions = allSaved.map((saved) => {
        return (
            <option key={saved} value={saved}>{saved}</option>
        )
    })

    const tablesOptions = allTables.map((name) => {
        return (
            <option key={name} value={name}>{name}</option>
        )
    })

     // at the first rendering i take all saved tables and al csv tables
    React.useEffect(() => {
        //getting all saved
        (async () => {
            dispatchSetLoading();
            const allSaved = await getAllSaved();
            if (await !allSaved.error) {
                dispatchUnsetLoading();
                setAllSaved(allSaved.data);
                setSavedName(allSaved.data[0]);
            } else {
                dispatchUnsetLoading();
                dispatchError(allSaved.errorText);
            }
        })();
        // getting all tables
        (async () => {
            dispatchSetLoading();
            const allTables = await getAllTables();
            if (await !allTables.error) {
                dispatchUnsetLoading();
                setTableName(allTables.data[0])
                setAllTables(allTables.data);

            } else {
                dispatchUnsetLoading();
                dispatchError(allTables.errorText);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // handling file upload
    function handlingUpload(e: any) {
        const reader = new FileReader();
        const file = e.target.files[0];
        let fileName = file.name.split(" ").join("-");
        // get the format from the filename
        function getFormat(fileName: string) {
            const nameArr = fileName.split(".");
            return nameArr[nameArr.length - 1];
        }
        const myFormat = getFormat(fileName);
        setFormat(myFormat);
        reader.onload = function (event) { //on loading file.
            const unconvertedFile = event.target!.result;
            dispatchName(fileName.split('.')[0]);
            if(myFormat === 'csv') { // if the format its csv i convert it and dispatch
                dispatchLoadedSuccess(convert(myFormat, unconvertedFile));
            } else if(myFormat === 'json') { // if the format is json i convert it and add a index column
                const [columns, table ] = convertFromJSON(JSON.parse(JSON.stringify(unconvertedFile!)));
                dispatchColumns(columns);
                for (let i = 0; i < table.length; i++) {
                    table[i]['index'] = {
                        label: i+1,
                        type: cellTypeEnum.index,
                        metadata: []
                    }
                }
                console.log(table);
                dispatchLoadSavedSuccess(table);
                // if both columns and table has been loaded, i set dataHasBeenLaoded on true, so i open the modal to choose the name and go to the next view
                setDataHasBeenLoaded(true);
            }
            
        }
        reader.readAsText(file);
    }


    // calling TableServer to get  a raw or a saved table
    function getTableData() {
        dispatchSetLoading()
        switch (dataSource) {
            case "Table Server":
                (async () => {
                    const tableData = await getTable(tableName);
                    if (await tableData.error) {
                        dispatchUnsetLoading();
                        dispatchError(tableData.errorText);
                    } else {
                        dispatchName(tableName);
                        dispatchUnsetLoading();
                        dispatchLoadedSuccess(convert("csv", tableData.data));
                    }
                })();
                break;
            case "Tabella Salvata":
                (async () => {
                    const tableData = await getSaved(savedName);
                    const [columns, table] = convertFromAppData(tableData.data);
                    if (tableData.error) {
                        dispatchUnsetLoading();
                        dispatchError(tableData.errorText);
                    } else {
                        dispatchName(savedName);
                        dispatchUnsetLoading();
                        dispatchLoadSavedSuccess(table);
                        dispatchColumns(columns);
                    }
                })();
                break;
            default:
                return;
        }
    }

    // when i load raw data i have to build columns from table
    const setColumns = () => {
        let keys: colInterface[] = [];
        for (let i = 0; i < LoadedData.length; i++) {
            if (Object.keys(LoadedData[i]).length > keys.length) {
                keys = Object.keys(LoadedData[i]).filter(key => key !== 'index').map((key) => {
                    return {
                        label: key,
                        name: key,
                        selected: false,
                        type: cellTypeEnum.data,
                        reconciliated: false,
                        reconciliator: '',
                        new: false,
                        metadata: [],
                    }
                })
            }
        }
        keys.unshift({
            label: "0",
            name: 'index',
            selected: false,
            type: cellTypeEnum.index,
            reconciliated: false,
            reconciliator: "",
            new: false,
            metadata: [],
        });
        // add first empty column
        return keys;
    }


    // listen for Data change, if are there data but not columns, i open the modal and set the name.
    // columns will be loaded when the user will close the modal 
    React.useEffect(() => {
        if (LoadedData.length >= 1 && LoadedColumns.length === 0) {
            setDataHasBeenLoaded(true);
            setTableName(LoadedName);
        } else if (LoadedData.length === 0 && !LoadedColumns) {
            displayError(t('shared.error.data-loading.empty'));
            setDataHasBeenLoaded(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [LoadedData])


    const confirmAction = () => {
        // on confirmation (orange button of the modal) i dispatch the name, set isConfirmed to go to the next view and reset dataHasBeenLoaded
        dispatchName(tableName);
        setIsConfirmed(true);
        setDataHasBeenLoaded(false);
    }



    return (
        <>
            <div className='get-data'>
                <div>
                    <Card className="get-data-card">
                        <Card.Body>
                            <Form>
                                <Form.Group>
                                    <Form.Label>
                                        {t('homepage-content.get-data.where-to-load.label')}
                                    </Form.Label>
                                    <Form.Control as="select" onChange={(e) => { setDataSource(e.target.value); }}>
                                        <option value="Table Server">{t('homepage-content.get-data.where-to-load.options.table-server')}</option>
                                        <option value="Tabella Salvata">{t('homepage-content.get-data.where-to-load.options.table-saved')}</option>
                                        <option value="File system">{t('homepage-content.get-data.where-to-load.options.file.-system')}</option>
                                    </Form.Control>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </div>
                <div>
                    <Card className="get-data-card">
                        <Card.Body >
                            {
                                dataSource === "Table Server" &&
                                <div>
                                    <Form>
                                        <Form.Group>
                                            <Form.Label>
                                                {t('homepage-content.get-data.choose-from.server-tables')}
                                            </Form.Label>
                                            <Form.Control as="select" onChange={(e) => { setTableName(e.target.value); }}>
                                                {tablesOptions}
                                            </Form.Control>
                                        </Form.Group>
                                    </Form>
                                    <MainButton label={t('buttons.load')} cta={() => { getTableData() }} />
                                </div>
                            }
                            {
                                dataSource === "Tabella Salvata" &&
                                <div>
                                    <Form>
                                        <Form.Group>
                                            <Form.Label>
                                                {t('homepage-content.get-data.choose-from.saved-tables')}
                                            </Form.Label>
                                            <Form.Control as="select" onChange={(e) => { setSavedName(e.target.value); }}>
                                                {savedOptions}
                                            </Form.Control>
                                        </Form.Group>
                                    </Form>
                                    <MainButton label={t('buttons.load')} cta={getTableData} />
                                </div>
                            }
                            {
                                dataSource === "File system" &&
                                <div>
                                    <Form>
                                        <Form.Group>
                                            <Form.File id="exampleFormControlFile1" label="Scegli file:" onChange={(e: any) => { handlingUpload(e) }} />
                                        </Form.Group>
                                    </Form>
                                </div>
                            }
                        </Card.Body>
                    </Card>
                </div>

            </div>
            {dataHasBeenLoaded && LoadedData && // when data are loaded i open a modal to choose the name, then confirm and go to the next view
                <InputModal
                    titleText={t('homepage-content.get-data.choose-name-modal.title-text')}
                    inputLabel={t('homepage-content.get-data.choose-name-modal.input-label')}
                    mainButtonLabel={t('buttons.confirm')}
                    mainButtonAction={() => {
                        confirmAction();
                        if (dataSource === 'Table Server' || (dataSource === "File system" && format !== 'json')) {
                            // is columns arent already been loaded i get them from the data structure
                            dispatchColumns(setColumns());
                        }
                    }}
                    setInputValue={(name: SetStateAction<string>) => { setTableName(name) }}
                    secondaryButtonLabel={t('buttons.cancel')}
                    secondaryButtonAction={() => {dispatchDeleteData(); setDataHasBeenLoaded(false)}}
                    value={LoadedName}
                    showState={dataHasBeenLoaded}
                    onClose={() => { setDataHasBeenLoaded(false); dispatchDeleteAllCols(); }}
                />
            }
            {isConfirmed &&
                <Redirect to={{
                    pathname: "/table"
                }} />
            }
        </>
    )
}

export default GetData;