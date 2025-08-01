import { ID } from "@store/interfaces/store";
import {
  Column,
  Row,
  TableInstance,
} from "@store/slices/table/interfaces/table";
import { CancelToken } from "axios";
import { apiEndpoint } from "../../configHelpers";
import apiClient from "./config/config";

export interface GetTableResponse {
  table: TableInstance;
  columns: Record<ID, Column>;
  rows: Record<ID, Row>;
}

export interface ChallengeTableDataset {
  name: string;
  tables: {
    fileName: string;
    format: string;
    ctime: Date;
    size: number;
  }[];
  annotations: string[];
}

const tableAPI = {
  getTable: (params: Record<string, string | number> = {}) => {
    console.log("Fetching table with params:", params);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
    if (params.tableId && params.datasetId) {
      console.log(
        `Adding headers for saveTable: tableId: ${params.tableId}, datasetId: ${params.datasetId}`,
      );
      headers["X-Table-Dataset-Info"] =
        `tableId:${params.tableId};datasetId:${params.datasetId}`;
    }
    return apiClient.get<GetTableResponse>(
      apiEndpoint({
        endpoint: "GET_TABLE",
        paramsValue: { ...params },
      }),
      {
        clearCacheEntry: true,
        headers,
      },
    );
  },
  exportTable: (
    format: string,
    params: Record<string, string | number> = {},
  ) => {
    return apiClient.get<any>(
      apiEndpoint({
        endpoint: "EXPORT",
        subEndpoint: format,
        paramsValue: params,
      }),
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
  },
  saveTable: (
    data: any,
    params: Record<string, string | number> = {},
    tableId?: string,
    datasetId?: string,
    deletedColumns?: string[],
  ) => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    // Add table and dataset headers if provided
    if (tableId && datasetId) {
      console.log(
        `Adding headers for saveTable: tableId: ${tableId}, datasetId: ${datasetId}`,
      );
      headers["X-Table-Dataset-Info"] =
        `tableId:${tableId};datasetId:${datasetId};deletedColumns:${
          deletedColumns ? deletedColumns.join("|-|") : "NO_DELETED"
        }`;
    }

    // Add deleted columns information ONLY for save operations

    console.log("Save table request headers:", headers);

    return apiClient.put<any>(
      apiEndpoint({
        endpoint: "SAVE",
        paramsValue: { ...params },
      }),
      data,
      {
        headers,
        clearCacheEntry: true, // Bypass cache for this request
      },
    );
  },
  automaticAnnotation: (
    params: Record<string, string | number> = {},
    data: any,
  ) => {
    return apiClient.post<any>(
      apiEndpoint({
        endpoint: "AUTOMATIC_ANNOTATION",
        paramsValue: { ...params },
      }),
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
  },
  reconcile: (
    baseUrl: string,
    data: any,
    tableId?: string,
    datasetId?: string,
    columnName?: string,
  ) => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    // Add table and dataset headers if provided
    if (tableId && datasetId) {
      console.log(
        `Adding headers for tableId: ${tableId}, datasetId: ${datasetId}, columnName: ${columnName}`,
      );
      headers["X-Table-Dataset-Info"] =
        `tableId:${tableId};datasetId:${datasetId}${
          columnName ? `;columnName:${columnName}` : ""
        }`;
    }
    console.log("Reconciliation request headers:", headers);
    console.log("Full reconcile URL:", `/reconciliators${baseUrl}`);
    console.log("Reconcile request config:", {
      headers,
      clearCacheEntry: true,
    });

    return apiClient.post(`/reconciliators${baseUrl}`, data, {
      headers,
      clearCacheEntry: true, // Bypass cache for this request
    });
  },
  extend: (
    baseUrl: string,
    data: any,
    tableId?: string,
    datasetId?: string,
    columnName?: string,
  ) => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    // Add table and dataset headers if provided
    if (tableId && datasetId) {
      console.log(
        `Adding headers for extend: tableId: ${tableId}, datasetId: ${datasetId}, columnName: ${columnName}`,
      );
      headers["X-Table-Dataset-Info"] =
        `tableId:${tableId};datasetId:${datasetId}${
          columnName ? `;columnName:${columnName}` : ""
        }`;
    }
    console.log("Extension request headers:", headers);
    console.log("Extension request URL:", `extenders${baseUrl}`);
    console.log("Extension request data:", data);
    console.log("Extend request config:", { headers, clearCacheEntry: true });

    return apiClient.post(`extenders${baseUrl}`, data, {
      headers,
      clearCacheEntry: true, // Bypass cache for this request
    });
  },
  suggest: (baseUrl: string, data: any) =>
    apiClient.post(`/suggestion${baseUrl}`, data),
  getChallengeDatasets: () =>
    apiClient.get<ChallengeTableDataset[]>("/tables/challenge/datasets"),
  getChallengeTable: (datasetName: string, tableName: string) =>
    apiClient.get(
      `/tables/challenge/datasets/${datasetName}/tables/${tableName}`,
    ),
  trackTable: (datasetId: string, tableId: string, metadataToTrack: any) =>
    apiClient.post(`/dataset/track/${datasetId}/${tableId}`, metadataToTrack, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }),
};

export default tableAPI;
