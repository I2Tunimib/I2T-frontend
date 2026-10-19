import {
  DatasetInstance,
  TableInstance,
} from "@store/slices/datasets/interfaces/datasets";
import { apiEndpoint } from "../../configHelpers";
import { getAuthToken } from "./auth-token";
import apiClient from "./config/config";

export type Dataset = Omit<DatasetInstance, "tables">;
export type Table = TableInstance;
export type GlobalSearchResult = {
  datasets: DatasetInstance[];
  tables: TableInstance[];
};

export type MetaCollection = {
  label: string;
  type?: "date" | "percentage" | "tag";
  props?: any;
};
export type Meta<T> = Partial<Record<keyof T, MetaCollection>>;

export type GetCollectionResult<T = {}> = {
  meta: Meta<T>;
  collection: T[];
};

const datasetAPI = {
  getDataset: (params: Record<string, string | number> = {}) => {
    return apiClient.get<GetCollectionResult<Dataset>>(
      apiEndpoint({
        endpoint: "GET_DATASET",
        paramsValue: { ...params },
      }),
      {
        clearCacheEntry: true,
      },
    );
  },

  getDatasetInfo: (params: Record<string, string | number> = {}) => {
    return apiClient.get<Dataset>(
      apiEndpoint({
        endpoint: "GET_DATASET_INFO",
        paramsValue: { ...params },
      }),
      {
        clearCacheEntry: true,
      },
    );
  },

  getTablesByDataset: (params: Record<string, string | number> = {}) => {
    return apiClient.get<GetCollectionResult<Table>>(
      apiEndpoint({
        endpoint: "GET_TABLES_BY_DATASET",
        paramsValue: { ...params },
      }),
      {
        clearCacheEntry: true,
      },
    );
  },

  annotate: (name: string, data: { idDataset: any[]; idTable: any[] }) => {
    return apiClient.post<Table[]>(
      apiEndpoint({
        endpoint: "PROCESS_START",
        subEndpoint: name,
      }),
      data,
    );
  },

  globalSearch: (query: string) => {
    return apiClient.get<GlobalSearchResult>(
      apiEndpoint({
        endpoint: "GLOBAL_SEARCH",
        paramsValue: { query },
      }),
    );
  },

  uploadDataset: (formData: FormData) => {
    if (!getAuthToken()) {
      throw new Error("No authentication token found");
    }

    return apiClient.post(
      apiEndpoint({
        endpoint: "UPLOAD_DATASET",
      }),
      // no headers: axios sets the multipart Content-Type with its boundary
      formData,
    );
  },

  updateDataset: (formData: FormData, datasetId: string) => {
    return apiClient.put(
      apiEndpoint({
        endpoint: "UPDATE_DATASET",
        paramsValue: { datasetId },
      }),
      formData,
    );
  },

  deleteDataset: (datasetId: string) => {
    return apiClient.delete(
      apiEndpoint({
        endpoint: "DELETE_DATASET",
        paramsValue: { datasetId },
      }),
    );
  },

  uploadTable: (formData: FormData, datasetId: string) => {
    return apiClient.post(
      apiEndpoint({
        endpoint: "UPLOAD_TABLE",
        paramsValue: { datasetId },
      }),
      formData,
    );
  },

  deleteTable: (params: { datasetId: string; tableId: string }) => {
    return apiClient.delete(
      apiEndpoint({
        endpoint: "DELETE_TABLE",
        paramsValue: params,
      }),
    );
  },

  // ACL endpoints
  addAclUser: (datasetId: string, userId: string, role: "viewer" | "editor") => {
    return apiClient.post(
      apiEndpoint({ endpoint: "ADD_ACL_USER", paramsValue: { datasetId } }),
      { userId, role },
    );
  },

  removeAclUser: (
    datasetId: string,
    userId: string,
    role: "viewer" | "editor",
  ) => {
    return apiClient.delete(
      apiEndpoint({ endpoint: "REMOVE_ACL_USER", paramsValue: { datasetId } }),
      { data: { userId, role } },
    );
  },

  // Table ACL endpoints
  getTableAcl: (datasetId: string, tableId: string) =>
    apiClient.get(
      apiEndpoint({
        endpoint: "GET_TABLE_ACL",
        paramsValue: { datasetId, tableId },
      }),
      { clearCacheEntry: true },
    ),

  addTableAclUser: (
    datasetId: string,
    tableId: string,
    userId: string,
    role: "viewer" | "editor",
  ) =>
    apiClient.post(
      apiEndpoint({
        endpoint: "ADD_TABLE_ACL_USER",
        paramsValue: { datasetId, tableId },
      }),
      { userId, role },
    ),

  removeTableAclUser: (
    datasetId: string,
    tableId: string,
    userId: string,
    role: "viewer" | "editor",
  ) =>
    apiClient.delete(
      apiEndpoint({
        endpoint: "REMOVE_TABLE_ACL_USER",
        paramsValue: { datasetId, tableId },
      }),
      { data: { userId, role } },
    ),

  setTableVisibility: (
    datasetId: string,
    tableId: string,
    visibility: "restricted" | null,
  ) =>
    apiClient.post(
      apiEndpoint({
        endpoint: "SET_TABLE_VISIBILITY",
        paramsValue: { datasetId, tableId },
      }),
      { visibility },
    ),

  acquireTableLock: (tableId: string) =>
    apiClient.post(
      apiEndpoint({ endpoint: "ACQUIRE_TABLE_LOCK", paramsValue: { tableId } }),
      {},
    ),

  releaseTableLock: (tableId: string) =>
    apiClient.post(
      apiEndpoint({ endpoint: "RELEASE_TABLE_LOCK", paramsValue: { tableId } }),
      {},
    ),

  forceReleaseTableLock: (tableId: string) =>
    apiClient.post(
      apiEndpoint({
        endpoint: "FORCE_RELEASE_TABLE_LOCK",
        paramsValue: { tableId },
      }),
      {},
    ),
};

export default datasetAPI;
