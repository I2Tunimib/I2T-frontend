import { colInterface } from '../../Interfaces/col.interface';
import { addMetaApplication } from './meta-saver';
import { SaveFormat } from './types/save-format';
import { standardSaver } from './savers';
import { Saver } from './types';

export const convertToSaveFormat = (headers: colInterface[], rows: any, saver: Saver = 'standard'): SaveFormat => {
    let saveFormat: any;

    switch (saver) {
        case 'standard':
            saveFormat = standardSaver(headers, rows);
            break;
        default:
            saveFormat = standardSaver(headers, rows);
    }

    return addMetaApplication(saveFormat, saver);
}