interface Config {
  APP: AppConfig;
  API: ApiConfig;
}

interface AppConfig {
  DEMO: boolean;
  MODE: 'standard' | 'challenge';
}

interface ApiConfig {
  GLOBAL: string;
  GET_DATASET: string;
  GET_DATASET_INFO: string;
  GET_TABLES_BY_DATASET: string;
  GET_TABLE: string;
  GET_ANNOTATIONS: null;
  GET_CEA: null;
  GET_CPA: null;
  GET_CTA: null;
}

declare module '*.yaml' {
  const content: Config;
  export default content;
}
