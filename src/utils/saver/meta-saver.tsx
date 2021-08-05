import { Saver } from "./types";

export const addMetaApplication = (saveFormat: any, saver: Saver) => {

    switch(saver) {
        case 'standard':
            return {
                application: {
                    version: '0.1.0',
                    saver,
                    ui: saveFormat.ui,
                },
                data: saveFormat.data
            }
        default:
            return {
                application: {
                    version: '0.1.0',
                    saver,
                    ui: saveFormat.ui,
                },
                data: saveFormat.data
            }
    }
}