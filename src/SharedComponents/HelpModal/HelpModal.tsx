import React from 'react';
import { Modal, Dropdown } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import SecondaryButton from '../SecondaryButton/SecondaryButton';
import { HelpExtension } from './HelpContents/HelpExtension';
import { HelpGeneral } from './HelpContents/HelpGeneral';
import { HelpReconciliation } from './HelpContents/HelpReconciliation';
import {ReactComponent as HelpIcon} from "../../Assets/Icons/help.svg";
const HelpModal = () => {
    const { t } = useTranslation();
    const [helpModalIsOpen, setHelpModalIsOpen] = React.useState<boolean>(false);
    const [section, setSection] = React.useState<string>('general');
    const sections = [
        { label: t('help.general-help.title'), value: 'general' },
        { label: t('help.reconciliation-help.title'), value: 'reconciliation' },
        { label: t('help.extension-help.title'), value: "extension" }
    ]
    console.log(t('help.general-help.title'));
    return (
        <>
            <Dropdown className='dropdown help-dropdown'>
                <Dropdown.Toggle id="dropdown-basic">
                    <HelpIcon className='help-icon'/>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    {sections.map((section) => {
                        return (
                            <Dropdown.Item key={section.value} onClick={() => { setHelpModalIsOpen(true); setSection(section.value) }}>
                                {section.label}
                            </Dropdown.Item>
                        )
                    })}
                </Dropdown.Menu>
            </Dropdown>
            <Modal show={helpModalIsOpen} onHide={() => { setHelpModalIsOpen(false) }}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {t('help.' + section + '-help.title')}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {section === 'general' &&
                        <HelpGeneral />
                    }
                    {section === 'reconciliation' &&
                        <HelpReconciliation />
                    } 
                    {section === 'extension' &&
                        <HelpExtension/>

                    }
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