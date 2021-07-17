import { Card, Form, FormControl, InputGroup } from "react-bootstrap";
import style from "./GetData.module.css";
import React from "react";
import MainButton from "../../../SharedComponents/MainButton/MainButton";
import { getAllTables, getAllSaved, getTable, getSaved} from "../../../Http/httpServices";
import { useDispatch } from "react-redux";
import { displayError } from "../../../Redux/action/error";
import { setLoadingState, unsetLoadingState } from "../../../Redux/action/loading";
import { loadDataSuccess, loadSavedDataSuccess } from "../../../Redux/action/data";
import { loadName } from "../../../Redux/action/name";
import { convert } from "../../../LogicUtilities/formatConverter";


const GetData: React.FC = () => {

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



    const [dataSource, setDataSource] = React.useState("Table Server");
    const [savedName, setSavedName] = React.useState("");
    const [externalUrl, setExternalUrl] = React.useState("");
    const [tableName, setTableName] = React.useState('');
    const [format, setFormat] = React.useState("csv");
    const [allSaved, setAllSaved] = React.useState([]);
    const [allTables, setAllTables] = React.useState([])

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
         switch(dataSource){
            case "Table Server":
                (async () => {
                    const tableData = await getTable(tableName);
                    if (await tableData.error) {
                        dispatchUnsetLoading();
                        dispatchError(tableData.errorText);
                    } else {
                        dispatchName(tableName);
                        dispatchUnsetLoading();
                        dispatchLoadedSuccess(convert( "csv", tableData.data));
                    }
                })();
                break;
            case "Tabella Salvata":
                (async () => {
                    const tableData = await getSaved(savedName);
                    if (await tableData.error) {
                        dispatchUnsetLoading();
                        dispatchError(tableData.errorText);
                    } else {
                        dispatchName(savedName);
                        dispatchUnsetLoading();
                        console.log(tableData);
                        dispatchLoadSavedSuccess(tableData.data);
                    }
                })();
                break;
            default:
                return; 
         }
    }







    return (
        <div className={style.getDataContainer}>
            <div>
                <Card className={style.card}>
                    <Card.Body>
                        <Form>
                            <Form.Group>
                                <Form.Label>
                                    Da dove vuoi caricare i dati?
                                </Form.Label>
                                <Form.Control as="select" onChange={(e) => { setDataSource(e.target.value); }}>
                                    <option value="Table Server">Table Server (tutte le tabelle csv)</option>
                                    <option value="Tabella Salvata">Table Server (tabelle salvate)</option>
                                    <option value="File system">File system locale (CSV, JSON)</option>
                                </Form.Control>
                            </Form.Group>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
            <div>
                <Card className={style.card}>
                    <Card.Body >
                        {
                            dataSource === "Table Server" &&
                            <div>
                                <Form>
                                    <Form.Group>
                                        <Form.Label>
                                            Scegli tra le tabelle disponibili:
                                        </Form.Label>
                                        <Form.Control as="select" onChange={(e) => { setTableName(e.target.value); }}>
                                            {tablesOptions}
                                        </Form.Control>
                                    </Form.Group>
                                </Form>
                                <MainButton label="Carica" cta={() => {getTableData()}} />
                            </div>
                        }
                        {
                            dataSource === "Tabella Salvata" &&
                            <div>
                                <Form>
                                    <Form.Group>
                                        <Form.Label>
                                            Scegli tra le tabelle salvate:
                                        </Form.Label>
                                        <Form.Control as="select" onChange={(e) => { setSavedName(e.target.value); }}>
                                            {savedOptions}
                                        </Form.Control>
                                    </Form.Group>
                                </Form>
                                <MainButton label="Carica" cta={getTableData} />
                            </div>
                        }
                        {
                            dataSource === "Servizio Esterno" &&
                            <div>
                                <label htmlFor="basic-url">Inserisci l'URL</label>
                                <InputGroup className="mb-3">
                                    <InputGroup.Prepend>
                                        <InputGroup.Text id="basic-addon3">
                                            GET
                                        </InputGroup.Text>
                                    </InputGroup.Prepend>
                                    <FormControl id="basic-url" aria-describedby="basic-addon3" onChange={(e) => { setExternalUrl(e.target.value); }} />
                                </InputGroup>
                                <Form>
                                    <Form.Group>
                                        <Form.Label>
                                            Scegli il formato dei dati in arrivo:
                                        </Form.Label>
                                        <Form.Control as="select" onChange={(e) => { setFormat(e.target.value); }}>
                                            <option value="csv">CSV</option>
                                            <option value="ssv">SSV</option>
                                            <option value="json">JSON</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Form>

                                <MainButton label="Carica" cta={getTableData} />
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
    )
}

export default GetData;