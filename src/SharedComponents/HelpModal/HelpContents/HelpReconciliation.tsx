import { useTranslation } from 'react-i18next';
import { Accordion, Card } from 'react-bootstrap';
import {ReactComponent as BottomArrow} from '../../../Assets/Icons/arrow-bottom.svg';

export const HelpReconciliationTitle = () => {
    const { t } = useTranslation();
    return (
        <>
            <h3>
                {t('help.reconciliation-help.title')}
            </h3>
        </>
    )
}

export const HelpReconciliation = () => {
    const { t } = useTranslation();
    const topics = [
        'general',
        'wikifier',
        'geonames',
        'keywordsmatcher',
        'lamapi',
        'wikidata',
    ]

    return (
        <> {
            topics.map((topic) => {
                return (
                    <Accordion className='help-accordion' >
                        <Card>
                            <Card.Header>
                                <Accordion.Toggle eventKey="0">
                                    <h5 className="topic-title">
                                        {t('help.reconciliation-help.topics.' + topic + '.title')}
                                    </h5>
                                    <BottomArrow/>
                                </Accordion.Toggle>
                            </Card.Header>
                            <Accordion.Collapse eventKey="0">
                                <Card.Body>
                                    <p>{t('help.reconciliation-help.topics.' + topic + '.content')}
                                    </p>
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    </Accordion>
                )
            })
        }
        </>
    )
}