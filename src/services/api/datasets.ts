import {
  DatasetInstance,
  TableInstance,
} from "@store/slices/datasets/interfaces/datasets";
import { apiEndpoint } from "../../configHelpers";
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

/**
 * Helper to build Authorization header preferring Keycloak token (kc_token)
 * and falling back to legacy token (token).
 */
const getAuthHeader = (): Record<string, string> => {
  const kcToken =
    typeof localStorage !== "undefined" && localStorage.getItem("kc_token");
  const legacyToken =
    typeof localStorage !== "undefined" && localStorage.getItem("token");
  const token = kcToken || legacyToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
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
        headers: {
          ...getAuthHeader(),
        },
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
        headers: {
          ...getAuthHeader(),
        },
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
        headers: {
          ...getAuthHeader(),
        },
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
      {
        headers: {
          ...getAuthHeader(),
        },
      },
    );
  },

  globalSearch: (query: string) => {
    return apiClient.get<GlobalSearchResult>(
      apiEndpoint({
        endpoint: "GLOBAL_SEARCH",
        paramsValue: { query },
      }),
      {
        headers: {
          ...getAuthHeader(),
        },
      },
    );
  },

  uploadDataset: (formData: FormData) => {
    const kcToken =
      typeof localStorage !== "undefined" && localStorage.getItem("kc_token");
    const legacyToken =
      typeof localStorage !== "undefined" && localStorage.getItem("token");
    const token = kcToken || legacyToken;

    if (!token) {
      throw new Error("No authentication token found");
    }

    return apiClient.post(
      apiEndpoint({
        endpoint: "UPLOAD_DATASET",
      }),
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // Let axios set Content-Type for multipart/form-data with proper boundary
        },
      },
    );
  },

  deleteDataset: (datasetId: string) => {
    return apiClient.delete(
      apiEndpoint({
        endpoint: "DELETE_DATASET",
        paramsValue: { datasetId },
      }),
      {
        headers: {
          ...getAuthHeader(),
        },
      },
    );
  },

  uploadTable: (formData: FormData, datasetId: string) => {
    const headers = {
      ...getAuthHeader(),
    };

    return apiClient.post(
      apiEndpoint({
        endpoint: "UPLOAD_TABLE",
        paramsValue: { datasetId },
      }),
      formData,
      {
        headers,
      },
    );
  },

  deleteTable: (params: { datasetId: string; tableId: string }) => {
    return apiClient.delete(
      apiEndpoint({
        endpoint: "DELETE_TABLE",
        paramsValue: params,
      }),
      {
        headers: {
          ...getAuthHeader(),
        },
      },
    );
  },

  // ACL endpoints
  addAclUser: (datasetId: string, userId: string, role: "viewer" | "editor") => {
    return apiClient.post(
      apiEndpoint({ endpoint: "ADD_ACL_USER", paramsValue: { datasetId } }),
      { userId, role },
      { headers: { ...getAuthHeader() } },
    );
  },

  removeAclUser: (
    datasetId: string,
    userId: string,
    role: "viewer" | "editor",
  ) => {
    return apiClient.delete(
      apiEndpoint({ endpoint: "REMOVE_ACL_USER", paramsValue: { datasetId } }),
      { data: { userId, role }, headers: { ...getAuthHeader() } },
    );
  },

  setVisibility: (datasetId: string, visibility: string) => {
    return apiClient.post(
      apiEndpoint({ endpoint: "SET_VISIBILITY", paramsValue: { datasetId } }),
      { visibility },
      { headers: { ...getAuthHeader() } },
    );
  },

  // Table ACL endpoints
  getTableAcl: (datasetId: string, tableId: string) =>
    apiClient.get(
      apiEndpoint({
        endpoint: "GET_TABLE_ACL",
        paramsValue: { datasetId, tableId },
      }),
      { clearCacheEntry: true, headers: { ...getAuthHeader() } },
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
      { headers: { ...getAuthHeader() } },
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
      { data: { userId, role }, headers: { ...getAuthHeader() } },
    ),

  setTableVisibility: (
    datasetId: string,
    tableId: string,
    visibility: string | null,
  ) =>
    apiClient.post(
      apiEndpoint({
        endpoint: "SET_TABLE_VISIBILITY",
        paramsValue: { datasetId, tableId },
      }),
      { visibility },
      { headers: { ...getAuthHeader() } },
    ),

  acquireTableLock: (tableId: string) =>
    apiClient.post(
      apiEndpoint({ endpoint: "ACQUIRE_TABLE_LOCK", paramsValue: { tableId } }),
      {},
      { headers: { ...getAuthHeader() } },
    ),

  releaseTableLock: (tableId: string) =>
    apiClient.post(
      apiEndpoint({ endpoint: "RELEASE_TABLE_LOCK", paramsValue: { tableId } }),
      {},
      { headers: { ...getAuthHeader() } },
    ),

  forceReleaseTableLock: (tableId: string) =>
    apiClient.post(
      apiEndpoint({
        endpoint: "FORCE_RELEASE_TABLE_LOCK",
        paramsValue: { tableId },
      }),
      {},
      { headers: { ...getAuthHeader() } },
    ),
};

export default datasetAPI;
