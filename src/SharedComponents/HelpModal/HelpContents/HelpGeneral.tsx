import { useTranslation } from 'react-i18next';
import { Accordion, Card } from 'react-bootstrap';
import {ReactComponent as BottomArrow} from '../../../Assets/Icons/arrow-bottom.svg';

export const HelpGeneralTitle = () => {
    const { t } = useTranslation();
    return (
        <>
            <h3>
                {t('help.general-help.title')}
            </h3>
        </>
    )
}

export const HelpGeneral = () => {
    const { t } = useTranslation();
    const topics = ['interaction',
        'context-menu',
        'drag-columns',
        'select-column',
        'delete-column',
        'edit-label',
        'delete-row',
        'reconcile-column',
        'view-meta',
        'filter-column',
        'finalize-matching',
        'extension']

    return (
        <> {
            topics.map((topic) => {
                return (
                    <Accordion className='help-accordion' >
                        <Card>
                            <Card.Header>
                                <Accordion.Toggle eventKey="0">
                                    <h5 className="topic-title">
                                        {t('help.general-help.topics.' + topic + '.title')}
                                    </h5>
                                    <BottomArrow/>
                                </Accordion.Toggle>
                            </Card.Header>
                            <Accordion.Collapse eventKey="0">
                                <Card.Body>
                                    <p>{t('help.general-help.topics.' + topic + '.content')}
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