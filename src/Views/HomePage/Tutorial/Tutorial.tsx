import React from "react";
import { Accordion, Card, Button } from "react-bootstrap";
import style from "./Tutorial.module.css";
import { useTranslation } from 'react-i18next';
import LanguageDropdown from "../../TableView/UpperBar/CommandsBar/LanguageDropdown/LanguageDropdown";


const Tutorial: React.FC = () => {
    const { t, i18n } = useTranslation();
    return (
        <div className='tutorial'>
            <Accordion >
                <Card>
                    <Card.Header className='accordion-header'>
                        <Accordion.Toggle as={Button} className='info-button' variant="link" eventKey="0">
                            <div className='info-icon'>
                            </div>
                        </Accordion.Toggle>
                        <div className="language-dropdown">
                            <LanguageDropdown />
                        </div>
                        
                    </Card.Header>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <div className={style.stepContainer}>
                                <div>
                                    <Card>
                                        <Card.Title className={style.cardTitle}>
                                            {t('homepage-content.tutorial.step-one.title')}
                                        </Card.Title>
                                        <Card.Body className={style.cardBody}>
                                            <p>
                                                {t('homepage-content.tutorial.step-one.content')}
                                            </p>
                                        </Card.Body>
                                    </Card>

                                </div>
                                <div>
                                    <Card>
                                        <Card.Title className={style.cardTitle}>
                                            {t('homepage-content.tutorial.step-two.title')}
                                        </Card.Title>
                                        <Card.Body className={style.cardBody}>
                                            {t('homepage-content.tutorial.step-two.content')}
                                        </Card.Body>
                                    </Card>
                                </div>
                                <div>
                                    <Card>
                                        <Card.Title className={style.cardTitle}>
                                            {t('homepage-content.tutorial.step-three.title')}
                                        </Card.Title>
                                        <Card.Body className={style.cardBody}>
                                            {t('homepage-content.tutorial.step-three.content')}
                                        </Card.Body>
                                    </Card>
                                </div>
                            </div>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
            </Accordion>
        </div>
    )
}

export default Tutorial;