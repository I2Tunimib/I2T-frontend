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
};

export default datasetAPI;
