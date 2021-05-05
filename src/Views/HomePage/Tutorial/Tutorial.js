import { Accordion, Card, Button } from "react-bootstrap";
import style from "./Tutorial.module.css";

const Tutorial = () => {
    return (
        <>
            <Accordion defaultActiveKey="0">
                <Card>
                    <Card.Header className={style.accordionHeader}>
                        <Accordion.Toggle as={Button} variant="link" eventKey="0">
                            <div className={style.infoIcon}>
                            </div>
                        </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <div className={style.stepContainer}>
                                <div>
                                    <Card>
                                        <Card.Title className={style.cardTitle}>
                                            1. Carica i dati
                                        </Card.Title>
                                        <Card.Body className={style.cardBody}>
                                            <p>
                                                Carica i dati con la modalità che preferisci: dal nostro server, da un servizio esterno o dal tuo file system.
                                            </p>
                                        </Card.Body>
                                    </Card>

                                </div>
                                <div>
                                    <Card>
                                        <Card.Title className={style.cardTitle}>
                                            2. Visualizza la tabella
                                        </Card.Title>
                                        <Card.Body className={style.cardBody}>
                                            Visualizza la tabella che hai caricato nell'interfaccia del tuo browser.
                                        </Card.Body>
                                    </Card>
                                </div>
                                <div>
                                    <Card>
                                        <Card.Title className={style.cardTitle}>
                                            3. Utilizza i comandi
                                        </Card.Title>
                                        <Card.Body className={style.cardBody}>
                                            Lavora sulla tabella estendendola o editando e riempiendo le celle.
                                        </Card.Body>
                                    </Card>
                                </div>
                            </div>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        </>
    )
}

export default Tutorial;