import { ID } from "@store/interfaces/store";
import {
  Column,
  Row,
  TableInstance,
} from "@store/slices/table/interfaces/table";
//import { CancelToken } from "axios";
import { apiEndpoint } from "../../configHelpers";
import apiClient from "./config/config";

export interface GetTableResponse {
  table: TableInstance;
  columns: Record<ID, Column>;
  rows: Record<ID, Row>;
  columnOrder?: string[]; // Optional field for preserving column order
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
        `Adding headers for saveTable: tableId: ${params.tableId}, datasetId: ${params.datasetId}`
      );
      headers[
        "X-Table-Dataset-Info"
      ] = `tableId:${params.tableId};datasetId:${params.datasetId}`;
    }
    return apiClient.get<GetTableResponse>(
      apiEndpoint({
        endpoint: "GET_TABLE",
        paramsValue: { ...params },
      }),
      {
        clearCacheEntry: true,
        headers,
      }
    );
  },
  exportTable: (
    format: string,
    params: Record<string, string | number> = {}
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
      }
    );
  },
  saveTable: (
    data: any,
    params: Record<string, string | number> = {},
    tableId?: string,
    datasetId?: string,
    deletedColumns?: string[]
  ) => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    // Add table and dataset headers if provided
    if (tableId && datasetId) {
      // Clean the values to ensure they only contain ISO-8859-1 characters
      const cleanTableId = tableId.replace(/[^\x00-\xFF]/g, "").trim();
      const cleanDatasetId = datasetId.replace(/[^\x00-\xFF]/g, "").trim();
      const cleanDeletedColumns = deletedColumns
        ? deletedColumns.map((col) => col.replace(/[^\x00-\xFF]/g, "").trim())
        : [];

      console.log(
        `Adding headers for saveTable: tableId: ${cleanTableId}, datasetId: ${cleanDatasetId}, deletedColumns: ${cleanDeletedColumns}`
      );

      const headerValue = `tableId:${cleanTableId};datasetId:${cleanDatasetId};deletedColumns:${
        cleanDeletedColumns.length > 0
          ? cleanDeletedColumns.join("|-|")
          : "NO_DELETED"
      }`;

      // Double-check the header value is clean
      const cleanHeaderValue = headerValue.replace(/[^\x00-\xFF]/g, "");
      console.log("Clean header value:", cleanHeaderValue);

      headers["X-Table-Dataset-Info"] = cleanHeaderValue;
    }

    // Add deleted columns information ONLY for save operations

    console.log("Save table request headers:", headers);

    // Validate all headers for ISO-8859-1 compliance
    Object.entries(headers).forEach(([key, value]) => {
      const hasNonISO = /[^\x00-\xFF]/.test(value);
      if (hasNonISO) {
        console.warn(
          `Header ${key} contains non-ISO-8859-1 characters:`,
          value
        );
        console.warn(
          "Non-ASCII characters found:",
          value.match(/[^\x00-\xFF]/g)
        );
      }
    });

    console.log(
      "Save table request data keys:",
      data ? Object.keys(data) : "no data"
    );
    console.log("Save table request data structure:", {
      hasTableInstance: data?.tableInstance ? "yes" : "no",
      hasColumns: data?.columns ? "yes" : "no",
      hasRows: data?.rows ? "yes" : "no",
      hasColumnOrder: data?.columnOrder ? "yes" : "no",
      columnOrderLength: data?.columnOrder?.length || "none",
    });

    return apiClient.put<any>(
      apiEndpoint({
        endpoint: "SAVE",
        paramsValue: { ...params },
      }),
      data,
      {
        headers,
        clearCacheEntry: true, // Bypass cache for this request
      }
    );
  },
  automaticAnnotation: (
    params: Record<string, string | number> = {},
    data: any
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
      }
    );
  },
  reconcile: (
    baseUrl: string,
    data: any,
    tableId?: string,
    datasetId?: string,
    columnName?: string
  ) => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    // Add table and dataset headers if provided
    if (tableId && datasetId) {
      console.log(
        `Adding headers for tableId: ${tableId}, datasetId: ${datasetId}, columnName: ${columnName}`
      );

      // Clean values to remove BOM and other problematic characters
      const cleanTableId = tableId.replace(/\uFEFF/g, "").trim();
      const cleanDatasetId = datasetId.replace(/\uFEFF/g, "").trim();
      const cleanColumnName = columnName
        ? columnName.replace(/\uFEFF/g, "").trim()
        : "";

      headers[
        "X-Table-Dataset-Info"
      ] = `tableId:${cleanTableId};datasetId:${cleanDatasetId}${
        cleanColumnName ? `;columnName:${cleanColumnName}` : ""
      }`;
    }
    console.log("Reconciliation request headers:", headers);

    // Clean baseUrl to remove BOM characters
    const cleanBaseUrl = baseUrl.replace(/\uFEFF/g, "").trim();
    console.log("Full reconcile URL:", `/reconciliators${cleanBaseUrl}`);
    console.log("Reconcile request config:", {
      headers,
      clearCacheEntry: true,
    });

    return apiClient.post(`/reconciliators${cleanBaseUrl}`, data, {
      headers,
      clearCacheEntry: true, // Bypass cache for this request
    });
  },
  extend: (
    baseUrl: string,
    data: any,
    tableId?: string,
    datasetId?: string,
    columnName?: string
  ) => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    // Add table and dataset headers if provided
    if (tableId && datasetId) {
      console.log(
        `Adding headers for extend: tableId: ${tableId}, datasetId: ${datasetId}, columnName: ${columnName}`
      );

      // Clean values to remove BOM and other problematic characters
      const cleanTableId = tableId.replace(/\uFEFF/g, "").trim();
      const cleanDatasetId = datasetId.replace(/\uFEFF/g, "").trim();
      const cleanColumnName = columnName
        ? columnName.replace(/\uFEFF/g, "").trim()
        : "";

      headers[
        "X-Table-Dataset-Info"
      ] = `tableId:${cleanTableId};datasetId:${cleanDatasetId}${
        cleanColumnName ? `;columnName:${cleanColumnName}` : ""
      }`;
    }
    console.log("Extension request headers:", headers);

    // Clean baseUrl to remove BOM characters
    const cleanBaseUrl = baseUrl.replace(/\uFEFF/g, "").trim();
    console.log("Extension request URL:", `extenders${cleanBaseUrl}`);
    console.log("Extension request data:", data);
    console.log("Extend request config:", { headers, clearCacheEntry: true });

    return apiClient.post(`extenders${cleanBaseUrl}`, data, {
      headers,
      clearCacheEntry: true, // Bypass cache for this request
    });
  },
  modify: (
    baseUrl: string,
    data: any,
    tableId?: string,
    datasetId?: string,
    columnName?: string
  ) => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    // Add table and dataset headers if provided
    if (tableId && datasetId) {
      console.log(
        `Adding headers for modify: tableId: ${tableId}, datasetId: ${datasetId}, columnName: ${columnName}`
      );

      // Clean values to remove BOM and other problematic characters
      const cleanTableId = tableId.replace(/\uFEFF/g, "").trim();
      const cleanDatasetId = datasetId.replace(/\uFEFF/g, "").trim();
      const cleanColumnName = columnName
        ? columnName.replace(/\uFEFF/g, "").trim()
        : "";

      headers[
        "X-Table-Dataset-Info"
        ] = `tableId:${cleanTableId};datasetId:${cleanDatasetId}${
        cleanColumnName ? `;columnName:${cleanColumnName}` : ""
      }`;
    }
    console.log("Modification request headers:", headers);

    // Clean baseUrl to remove BOM characters
    const cleanBaseUrl = baseUrl.replace(/\uFEFF/g, "").trim();
    console.log("Modification request URL:", `modifiers${cleanBaseUrl}`);
    console.log("Modification request data:", data);
    console.log("Modify request config:", { headers, clearCacheEntry: true });

    return apiClient.post(`modifiers${cleanBaseUrl}`, data, {
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
      `/tables/challenge/datasets/${datasetName}/tables/${tableName}`
    ),
  trackTable: (datasetId: string, tableId: string, metadataToTrack: any) =>
    apiClient.post(`/dataset/track/${datasetId}/${tableId}`, metadataToTrack, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }),
};

export default tableAPI;
