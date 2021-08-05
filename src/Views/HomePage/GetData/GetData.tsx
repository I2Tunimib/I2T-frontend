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
import { convertFromAppData } from "@utils/format-converter/converters";


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
        // getting al tables
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
        function getFormat(fileName: string) {
            const nameArr = fileName.split(".");
            return nameArr[nameArr.length - 1];
        }
        const myFormat = getFormat(fileName);
        reader.onload = function (event) { //on loading file.
            const unconvertedFile = event.target!.result;
            dispatchName(fileName.split('.')[0]);
            dispatchLoadedSuccess(convert(myFormat, unconvertedFile));
        }
        reader.readAsText(file);
    }


    // calling TableServer
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



    React.useEffect(() => {
        // reset index when loaded data changes
        // resetIndex();
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
        //console.log(tableName);
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
            {dataHasBeenLoaded && LoadedData &&
                <InputModal
                    titleText={t('homepage-content.get-data.choose-name-modal.title-text')}
                    inputLabel={t('homepage-content.get-data.choose-name-modal.input-label')}
                    mainButtonLabel={t('buttons.confirm')}
                    mainButtonAction={() => {
                        confirmAction();
                        if (dataSource !== 'Tabella Salvata') {
                            dispatchColumns(setColumns());
                        }
                    }}
                    setInputValue={(name: SetStateAction<string>) => { setTableName(name) }}
                    secondaryButtonLabel={t('buttons.cancel')}
                    secondaryButtonAction={dispatchDeleteData}
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