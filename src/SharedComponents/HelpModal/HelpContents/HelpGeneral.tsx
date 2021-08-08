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

export const HelpGeneral = (props: any) => {
    const {structure, sectionName} = props;
    const { t } = useTranslation();

    return (
        <> 
        {
            structure.map((section: {title: string, items: string[]}) => {
                return (
                    <div className='section'>
                    <h5>
                        {t('help.' + sectionName + '-help.titles.' + section.title)}
                    </h5>
                    {
                        section.items.map((item)=> {
                            return (
                                <Accordion className='help-accordion' >
                                    <Card>
                                        <Card.Header>
                                            <Accordion.Toggle eventKey="0">
                                                <h6 className="topic-title">
                                                    {t('help.' + sectionName + '-help.topics.' + item + '.title')}
                                                </h6>
                                                <BottomArrow/>
                                            </Accordion.Toggle>
                                        </Card.Header>
                                        <Accordion.Collapse eventKey="0">
                                            <Card.Body>
                                                <p>{t('help.'+ sectionName +'-help.topics.' + item + '.content')}
                                                </p>
                                            </Card.Body>
                                        </Accordion.Collapse>
                                    </Card>
                                </Accordion>
                            )
                        })
                    }
                    </div>
                )
            })
        }
        </>
    )
}