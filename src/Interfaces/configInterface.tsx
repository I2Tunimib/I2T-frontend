export interface configInterface {
    reconciliators: {
        name: string,
        relativeUrl: string,
        entityPageUrl: string | null,
        metaToViz: string[]
    }
}