import React from 'react';
import { Modal, Tabs, Tab } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import SecondaryButton from '../SecondaryButton/SecondaryButton';
import { HelpGeneral } from './HelpContents/HelpGeneral';
import MainButton from '../MainButton/MainButton';
const HelpModal = () => {
    const { t } = useTranslation();
    const [helpModalIsOpen, setHelpModalIsOpen] = React.useState<boolean>(false);
    const generalStructure = [
        {
            title: 'about',
            items:  [
                'interaction',
                'context-menu'
            ]
        },{
            title: 'columns',
            items: [
                'select-column',
                'delete-column',
                'drag-columns',
                'filter-column'
            ]
        },{
            title: 'cells',
            items: [
                'edit-label'
            ]
        }, {
            title: 'row',
            items: [
                'delete-row'
            ]
        },{
            title: 'commands',
            items: [
                'extension',
                'reconcile-column'
            ]
        },{
            title: 'metadata',
            items: [
                'view-meta',
                'finalize-matching'
            ]
        }
    ]
    const reconciliationStructure = [
        {
            title: 'about',
            items: ['general']
        },
        {
            title: 'services',
            items: [
                'general',
                'wikifier',
                'geonames',
                'keywordsmatcher',
                'lamapi',
                'wikidata',
            ]
        }
    ]
    const extensionStructure = [
        {
            title: 'about',
            items: ['general']
        },{
            title: 'services',
            items: [
                'geonames',
                'weather'
            ]
        }
    ]
    return (
        <>
            <span className='help-button'>
               <MainButton label='?' cta={() => { setHelpModalIsOpen(true) }}/> 
            </span>
            

            <Modal show={helpModalIsOpen} onHide={() => { setHelpModalIsOpen(false) }} className='help-modal'>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <h3>{t('help.title')}</h3>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tabs defaultActiveKey="general" id="uncontrolled-tab-example" className="mb-3">
                        <Tab eventKey="general" title={t('help.general-help.title')}>
                            <HelpGeneral structure={generalStructure} sectionName='general'/>
                        </Tab>
                        <Tab eventKey="reconciliation" title={t('help.reconciliation-help.title')}>
                            <HelpGeneral structure={reconciliationStructure} sectionName='reconciliation'/>
                        </Tab>
                        <Tab eventKey="extension" title={t('help.extension-help.title')}>
                            <HelpGeneral structure={extensionStructure} sectionName='extension'/>
                        </Tab>
                    </Tabs>
                </Modal.Body>
                <Modal.Footer>
                    <SecondaryButton
                        label={t('buttons.close')}
                        cta={() => { setHelpModalIsOpen(false) }} />

                </Modal.Footer>
            </Modal>
        </>
    )
}

export default HelpModal;