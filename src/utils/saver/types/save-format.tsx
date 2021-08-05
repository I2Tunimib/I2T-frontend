import { Saver } from ".";

export interface SaveFormat {
    application: {
        version: string;
        saver: Saver;
        ui: any[];
    };
    data: any[]
}