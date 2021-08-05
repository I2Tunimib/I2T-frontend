export interface StandardSaverFormat {
    ui: UIMetadata[];
    data: any;
}

export interface UIMetadata {
    [key: string]: {
        name: string;
        selected: boolean;
        reconciliated: boolean;
        reconciliator: string;
        new: boolean;
    }
}