import { IFetchParams } from 'hooks/fetch/fetch';

/**
 * Get table names
 */
export interface ITableNamesResponse {
  data: string[];
}
export const tableNamesEndpoint = (dataSource: string): IFetchParams => ({
  method: 'GET',
  url: `/${dataSource}`
});

/**
 * Get table data by name
 */
export interface ITableDataResponse {
  data: [{
    format: string;
    content: string;
  }];
}
export const tableDataEndpoint = (dataSource: string, name: string): IFetchParams => ({
  method: 'GET',
  url: `/${dataSource}/${name}`
});

/**
 * Reconciliation request to Asia Geonames
 */
export interface IAsiaGeoRequest {
  data: IAsiaGeoItem[];
}
interface IAsiaGeoItem {
  [key: string]: {
    label: string;
  }[];
}
export const asiaGeoEndpoint = (data: IAsiaGeoRequest): IFetchParams => ({
  method: 'POST',
  url: '/asia/reconcile/geonames',
  data
});
