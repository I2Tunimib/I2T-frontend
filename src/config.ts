export type AppConfig = {
  API: ApiConfig;
};

export type Endpoint = {
  path: string;
  name?: string;
  useGlobal?: boolean;
}

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
    SAVE: Endpoint;
    PROCESS_START: Endpoint[];
    EXPORT: Endpoint[];
  }
}

/**
 * App configuration
 */
const CONFIG: AppConfig = {
  API: {
    // global endpoint prefixed to each path, unless useGlobal is set to false
    GLOBAL: process.env.REACT_APP_BACKEND_API_URL || '',

    ENDPOINTS: {
      GET_SERVICES_CONFIG: {
        path: '/config',
        // prefix global endpoint to /config. If not specified it defaults to true
        useGlobal: true
      },
      GET_DATASET: {
        path: '/dataset'
      },
      GET_DATASET_INFO: {
        path: '/dataset/:datasetId'
      },
      GET_TABLES_BY_DATASET: {
        path: '/dataset/:datasetId/table'
      },
      GET_TABLE: {
        path: '/dataset/:datasetId/table/:tableId'
      },
      DELETE_DATASET: {
        path: '/dataset/:datasetId'
      },
      DELETE_TABLE: {
        path: '/dataset/:datasetId'
      },
      GLOBAL_SEARCH: {
        path: '/dataset/search?query=:query'
      },
      UPLOAD_DATASET: {
        path: '/dataset'
      },
      SAVE: {
        path: '/dataset/:datasetId/table/:tableId'
      },
      PROCESS_START: [
        {
          path: '/path/process/start1',
          name: 'Endpoint 1'
        },
        {
          path: '/path/process/start2',
          name: 'Endpoint 2'
        }
      ],
      EXPORT: [
        {
          path: '/dataset/:datasetId/table/:tableId/export?format=w3c',
          name: 'W3C'
        }
      ]
    }
  }
};

export default CONFIG;
