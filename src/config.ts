import Path from "@services/classes";

export type AppConfig = {
  API: ApiConfig;
};

export type Endpoint = {
  path: string;
  name?: string;
  useGlobal?: boolean;
  params?: Record<string, any>;
};

export type ApiConfig = {
  GLOBAL: string;
  ENDPOINTS: {
    GET_SERVICES_CONFIG: Endpoint;
    GET_DATASET: Endpoint;
    GET_DATASET_INFO: Endpoint;
    GET_TABLES_BY_DATASET: Endpoint;
    GET_TABLE: Endpoint;
    GLOBAL_SEARCH: Endpoint;
    DELETE_DATASET: Endpoint;
    DELETE_TABLE: Endpoint;
    UPLOAD_DATASET: Endpoint;
    UPLOAD_TABLE: Endpoint;
    SAVE: Endpoint;
    AUTOMATIC_ANNOTATION: Endpoint;
    PROCESS_START: Endpoint[];
    EXPORT: Endpoint[];
    AUTH_SIGNIN: Endpoint;
    AUTH_SIGNUP: Endpoint;
    AUTH_VERIFY: Endpoint;
    AUTH_ME: Endpoint;
    TRACK: Endpoint;
  };
};

/**
 * App configuration
 */
const CONFIG: AppConfig = {
  API: {
    // global endpoint prefixed to each path, unless useGlobal is set to false
    GLOBAL: import.meta.env.VITE_BACKEND_API_URL || "",

    ENDPOINTS: {
      GET_SERVICES_CONFIG: {
        path: "/config",
        // prefix global endpoint to /config. If not specified it defaults to true
        useGlobal: true,
      },
      GET_DATASET: {
        path: "/dataset",
      },
      GET_DATASET_INFO: {
        path: "/dataset/:datasetId",
      },
      GET_TABLES_BY_DATASET: {
        path: "/dataset/:datasetId/table",
      },
      GET_TABLE: {
        path: "/dataset/:datasetId/table/:tableId",
      },
      DELETE_DATASET: {
        path: "/dataset/:datasetId",
      },
      UPLOAD_TABLE: {
        path: "/dataset/:datasetId/table",
      },
      DELETE_TABLE: {
        path: "/dataset/:datasetId/table/:tableId",
      },
      GLOBAL_SEARCH: {
        path: "/dataset/search?query=:query",
      },
      UPLOAD_DATASET: {
        path: "/dataset",
      },
      SAVE: {
        path: "/dataset/:datasetId/table/:tableId",
      },
      AUTOMATIC_ANNOTATION: {
        path: "/reconcilers/mantis/dataset/:datasetId/table/:tableId",
      },
      PROCESS_START: [
        {
          path: "/path/process/start1",
          name: "Endpoint 1",
        },
        {
          path: "/path/process/start2",
          name: "Endpoint 2",
        },
      ],
      EXPORT: [
        {
          path: "/dataset/:datasetId/table/:tableId/export?format=w3c",
          name: "JSON (W3C Compliant)",
          params: {
            extension: "json",
            postDownload: (data: any) => JSON.stringify(data, null, 2),
          },
        },
        {
          path: "/dataset/:datasetId/table/:tableId/export?format=csv",
          name: "CSV",
          params: {
            extension: "csv",
          },
        },
        {
          path: "/dataset/:datasetId/table/:tableId/export?format=rdf",
          name: "RDF",
          params: {
            extension: "ttl",
            postDownload: (data: any) => data,
          },
        },
        {
          path: "/dataset/:datasetId/table/:tableId/code?format=python",
          name: "Python pipeline",
          params: {
            extension: "py",
            postDownload: (data: any) => {
              if (typeof data === "string") {
                return data;
              }
              if (typeof data === "object" && data !== null) {
                return JSON.stringify(data, null, 2);
              }
              return String(data);
            },
          },
        },
        {
          path: "/dataset/:datasetId/table/:tableId/code?format=notebook",
          name: "Jupyter notebook pipeline",
          params: {
            extension: "ipynb",
            postDownload: (data: any) => {
              if (typeof data === "string") {
                try {
                  // Try to parse and re-stringify to ensure proper formatting
                  return JSON.stringify(JSON.parse(data), null, 2);
                } catch {
                  // If it's not valid JSON, return as-is
                  return data;
                }
              }
              if (typeof data === "object" && data !== null) {
                return JSON.stringify(data, null, 2);
              }
              return String(data);
            },
          },
        },
      ],
      AUTH_SIGNIN: {
        path: "/auth/signin",
      },
      AUTH_SIGNUP: {
        path: "/auth/signup",
      },
      AUTH_VERIFY: {
        path: "/auth/verify",
      },
      AUTH_ME: {
        path: "/auth/me",
      },
      TRACK: {
        path: "/dataset/track/:idDataset/:idTable",
      },
    },
  },
};

export default CONFIG;
