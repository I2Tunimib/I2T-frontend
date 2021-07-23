import React from "react";
import { Accordion, Card, Button } from "react-bootstrap";
import { useTranslation } from 'react-i18next';


const Tutorial: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className='tutorial'>
            <Accordion >
                <Card>
                    <Card.Header className='accordion-header'>
                        <Accordion.Toggle as={Button} className='info-button' variant="link" eventKey="0">
                            <div className='info-icon'>
                            </div>
                        </Accordion.Toggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="0">
                        <Card.Body>
                            <div className='step-container'>
                                <div>
                                    <Card className="tutorial-card">
                                        <Card.Title>
                                            <h4>{t('homepage-content.tutorial.step-one.title')}</h4>
                                        </Card.Title>
                                        <Card.Body className="card-body">
                                            <p>
                                                {t('homepage-content.tutorial.step-one.content')}
                                            </p>
                                        </Card.Body>
                                    </Card>

                                </div>
                                <div>
                                    <Card className="tutorial-card">
                                        <Card.Title>
                                            <h4>{t('homepage-content.tutorial.step-two.title')}</h4>
                                        </Card.Title>
                                        <Card.Body className="card-body">
                                            {t('homepage-content.tutorial.step-two.content')}
                                        </Card.Body>
                                    </Card>
                                </div>
                                <div>
                                    <Card className="tutorial-card">
                                        <Card.Title>
                                            <h4>
                                                {t('homepage-content.tutorial.step-three.title')}
                                            </h4>
                                        </Card.Title>
                                        <Card.Body className="card-body">
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