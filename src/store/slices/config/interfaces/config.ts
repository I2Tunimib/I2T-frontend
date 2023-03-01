import { RequestEnhancedState } from '@store/enhancers/requests';
import { BaseState, ID } from '@store/interfaces/store';
import { AppConfig } from 'config';

// Define a type for the slice state
export interface IConfigState extends RequestEnhancedState {
  app: AppConfig;
  entities: {
    reconciliators: ReconciliatorsState;
    extenders: ExtendersState;
  }
}

export interface ReconciliatorsState extends BaseState<Reconciliator> { }
export interface ExtendersState extends BaseState<Extender> { }

// export type FormFieldSchema = FormInputParams | Record<string, FormInputParams>[];

export interface Reconciliator {
  id: ID;
  name: string;
  description: string;
  prefix: string;
  uri: string;
  relativeUrl: string;
  metaToView: Record<string, MetaToViewItem>;
  formSchema: FormSchema;
}

export type MetaToViewItem = {
  label?: string;
  type?: 'link' | 'subList' | 'tag';
}

export interface Extender extends Record<string, any> {
  id: ID;
  name: string;
  relativeUrl: string;
  description: string;
  formSchema: FormSchema;
}

// export interface FormInputParams {
//   description: string;
//   label: string;
//   inputType: 'text' | 'select' | 'selectColumns' | 'checkbox';
//   rules: string[];
//   options?: Option[];
//   infoText?: string;
//   defaultValue?: string;
// }

interface FormFieldBaseSchema {
  title?: string;
  description?: string;
  dynamic?: boolean;
}

interface FormInputFieldBaseSchema {
  description?: string;
  label?: string;
  infoText?: string;
  defaultValue?: any;
  rules?: string[];
  dynamic?: boolean;
}

export interface GroupFieldSchema extends FormFieldBaseSchema {
  component: 'group';
  fields: FormSchema;
}

export interface CheckboxSchema extends FormInputFieldBaseSchema {
  component: 'checkbox';
  options: {
    id: string;
    label: string;
    value: string;
  }[]
}

export interface InputTextSchema extends FormInputFieldBaseSchema {
  component: 'text';
  defaultValue?: string;
}

export interface SelectColumnsSchema extends FormInputFieldBaseSchema {
  component: 'selectColumns';
}

export interface SelectSchema extends FormInputFieldBaseSchema {
  component: 'select';
  options: {
    id: string;
    label: string;
    value: string;
  }[]
}

export type FormInputSchema =
  | CheckboxSchema
  | InputTextSchema
  | SelectColumnsSchema
  | SelectSchema

export type FormFieldSchema = FormInputSchema | GroupFieldSchema

export type FormSchema = Record<string, FormFieldSchema>;

export interface Option {
  id: string;
  value: string;
  label: string;
}

// export interface AppConfig {
//   DEMO: boolean;
//   MODE: 'standard' | 'challenge';
// }

export interface Endpoint {
  path: string;
  useGlobal: boolean;
  name?: string;
}

export interface ApiConfig {
  GLOBAL: string;
  ENDPOINTS: {
    GET_SERVICES_CONFIG: Endpoint;
    GET_DATASET: Endpoint;
    GET_DATASET_INFO: Endpoint;
    GET_TABLES_BY_DATASET: Endpoint;
    GET_TABLE: Endpoint;
    GET_ANNOTATIONS: Endpoint;
    GET_CEA: Endpoint;
    GET_CPA: Endpoint;
    GET_CTA: Endpoint;
    GLOBAL_SEARCH: Endpoint;
    DELETE_DATASET: Endpoint;
    DELETE_TABLE: Endpoint;
    UPLOAD_DATASET: Endpoint;
    SAVE: Endpoint;
    PROCESS_START: Endpoint[];
    EXPORT: Endpoint[];
  }
}
