import { Card, Form, FormControl, InputGroup } from "react-bootstrap";
import style from "./GetData.module.css";
import React from "react";
import DateTime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import MainButton from "../../../SharedComponents/MainButton/MainButton";


const GetData = () => {

    const [dataSource, setDataSource] = React.useState("Table Server");
    const [serverDataType, setServerDataType] = React.useState("covid");
    const [region, setRegion] = React.useState("Valle-d'Aosta");
    const [date, setDate] = React.useState({});
    const [savedName, setSavedName] = React.useState("");
    const [externalUrl, setExternalUrl] = React.useState("");
    const [format, setFormat] = React.useState("csv");

    const regions = [{ name: "Valle d'Aosta", value: "Valle-d'Aosta" }, { name: "Piemonte", value: "Piemonte" }, { name: "Liguria", value: "Liguria" },
    { name: "Lombardia", value: "Lombardia" }, { name: "Trentino-Alto Adige", value: "Trentino-Alto-Adige" }, { name: "Veneto", value: "Veneto" }, { name: "Friuli-Venezia Giulia", value: "Friuli-Venezia-Giulia" },
    { name: "Emilia Romagna", value: "Emilia-Romagna" }, { name: "Toscana", value: "Toscana" }, { name: "Umbria", value: "Umbria" }, { name: "Lazio", value: "Lazio" }, { name: "Abruzzo", value: "Abruzzo" },
    { name: "Molise", value: "Molise" }, { name: "Campania", value: "Campania" }, { name: "Puglia", value: "Puglia" }, { name: "Basilicata", value: "Basilicata" }, { name: "Calabria", value: "Calabria" },
    { name: "Sicilia", value: "Sicilia" }, { name: "Sardegna", value: "Sardegna" }
    ]
    const regionOptions = regions.map((region) => {
        return (
            <option value={region.value} key={region.value}>
                {region.name}
            </option>
        )
    })


    // setting date
    function handleChangeDate(date) {
        const dateArr = date.toString().split(' ');
        const year = dateArr[3];
        const day = dateArr[2];
        const calcMonth = () => {
            let myMonth = "";
            switch (dateArr[1]) {
                case "Jan":
                    myMonth = "Gennaio"
                    break;
                case "Feb":
                    myMonth = "Febbraio";
                    break;
                case "Mar":
                    myMonth = "Marzo";
                    break;
                case "Apr":
                    myMonth = "Aprile";
                    break;
                case "May":
                    myMonth = "Maggio";
                    break;
                case "Jun":
                    myMonth = "Giugno";
                    break;
                case "Jul":
                    myMonth = "Luglio";
                    break;
                case "Aug":
                    myMonth = "Agosto";
                    break;
                case "Sep":
                    myMonth = "Settembre";
                    break;
                case "Oct":
                    myMonth = "Ottobre";
                    break;
                case "Dec":
                    myMonth = "Dicembre";
                    break;
                default:
                    console.log("Hai sbagliato mese");
            }
            return myMonth;
        }
        const month = calcMonth();
        setDate({
            day,
            month,
            year,
        });
    }

    //gettin date on rendering
    React.useEffect(() => {
        handleChangeDate(new Date());
    }, []);

    // handling file upload
    function handlingUpload(e) {
        const reader = new FileReader();
        const file = e.target.files[0];
        let fileName = file.name.split(" ").join("-");
        function getFormat (fileName) {
            const nameArr = fileName.split(".");
            const format = nameArr[nameArr.length - 1];
        }
        const format = getFormat(fileName);
        reader.onload = function (event) { //on loading file.
            const unconverteFile = event.target.result;
            console.log(unconverteFile);
            console.log(format);
            //TODO more logic
        }
        reader.readAsText(file);
    }
    

    // calling TableServer
    function getTableServer() {
        if (serverDataType === "covid" || serverDataType === "meteo") {
            //call httpservice
            console.log(serverDataType);
            console.log(region);
            console.log(date);
            //TODO call service
        } else {
            //call httpservice
            console.log(savedName);
            //TODO call service
        }

    }

    //calling external server
    function getExternalService() {
        // call http service
        console.log(externalUrl);
        console.log(format);
        //TODO call service
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
                                    <option value="Table Server">Table Server</option>
                                    <option value="Servizio Esterno">Servizio Esterno</option>
                                    <option value="File system">File system</option>
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
                                            Che tipo di dati vuoi caricare?
                                        </Form.Label>
                                        <Form.Control as="select" onChange={(e) => { setServerDataType(e.target.value); }}>
                                            <option value="covid">Covid</option>
                                            <option value="meteo">Meteo</option>
                                            <option value="saved">Tabella salvata</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Form>
                                {
                                    (serverDataType === "covid" || serverDataType === "meteo") &&
                                    <div>
                                        <Form>
                                            <Form.Group>
                                                <Form.Label>
                                                    Scegli la regione:
                                                </Form.Label>
                                                <Form.Control as="select" onChange={(e) => { setRegion(e.target.value) }}>
                                                    {regionOptions}
                                                </Form.Control>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label>
                                                    Scegli la data:
                                                </Form.Label>
                                                <DateTime value={new Date()} timeFormat={false} onChange={(e) => { handleChangeDate(e._d) }} />
                                            </Form.Group>
                                        </Form>
                                        <MainButton label="Carica" cta={getTableServer} />

                                    </div>
                                }
                                {
                                    serverDataType === "saved" &&
                                    <div>
                                        <Form>
                                            <Form.Group>
                                                <Form.Label>
                                                    Inserisci il nome con cui hai salvato la tabella:
                                                </Form.Label>
                                                <Form.Control type="text" onChange={(e) => { setSavedName(e.target.value); }}>

                                                </Form.Control>
                                            </Form.Group>
                                        </Form>
                                        <MainButton label="Carica" cta={getTableServer} />
                                    </div>
                                }
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
                                
                                <MainButton label="Carica" cta={getExternalService} />
                            </div>
                        }
                        {
                            dataSource === "File system" &&
                            <div>
                                <Form>
                                    <Form.Group>
                                        <Form.File id="exampleFormControlFile1" label="Scegli file:" onChange={(e)=>{handlingUpload(e)}}/>
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