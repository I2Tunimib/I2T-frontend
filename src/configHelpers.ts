import { AppConfig, Endpoint } from 'config';
import { store } from './store';

export const getAllParams = (path: string) => {
  return path.split('/').reduce((acc, slice) => {
    if (slice.startsWith(':')) {
      acc.push(slice.split(':')[1]);
    }
    return acc;
  }, [] as string[]);
};

export const getAllQueryParams = (path: string): string[] => {
  const query = path.split('?')[1];
  if (query) {
    return query.split('&').reduce((acc, slice) => {
      const param = slice.split('=')[1];
      if (param.startsWith(':')) {
        acc.push(param.split(':')[1]);
      }
      return acc;
    }, [] as string[]);
  }
  return [];
};

export const getEnvVar = (yamlEnv: string) => {
  const matches = yamlEnv.match(/\$\{(.*)\}/);
  if (matches) {
    return [matches[0], matches[1]];
  }
  return [];
};

export const getAllEnvVar = (yamlValue: string) => {
  const vars = yamlValue.matchAll(/(\$\{.*?\})/g);
  return Array.from(vars).map((variable) => getEnvVar(variable[0]));
};

export const buildPath = (
  endpoint: Endpoint,
  paramsValue: Record<string, string | number> = {},
  config: AppConfig
) => {
  const { GLOBAL } = config.API;
  const { path, useGlobal } = endpoint;

  let finalPath = '';

  // get all path params and substitute with value
  const allParams = getAllParams(path);
  finalPath = allParams.reduce((acc, param) => {
    return acc.replace(`:${param}`, paramsValue[param].toString());
  }, path);

  // check if route includes query parameters
  if (path.includes('?')) {
    // get all query params and substitute with value
    const allQueryParams = getAllQueryParams(path);
    finalPath = allQueryParams.reduce((acc, param) => {
      return acc.replace(`:${param}`, paramsValue[param].toString());
    }, finalPath);
  }

  if (useGlobal === undefined || useGlobal) {
    return `${GLOBAL}${finalPath}`;
  }

  return finalPath;
};

export type ApiEndpointProps<P extends Record<string, any> = {}> = {
  endpoint: keyof AppConfig['API']['ENDPOINTS'],
  subEndpoint?: string,
  paramsValue?: P
}

export const apiEndpoint = ({
  endpoint,
  subEndpoint,
  paramsValue
}: ApiEndpointProps) => {
  const config = store.getState().config.app as AppConfig;

  const { API: { ENDPOINTS } } = config;

  const endpointObj = ENDPOINTS[endpoint];
  if (!Array.isArray(endpointObj)) {
    return buildPath(endpointObj, paramsValue, config);
  }
  const subEnd = endpointObj.find((sub) => sub.name === subEndpoint);
  if (subEnd) {
    return buildPath(subEnd, paramsValue, config);
  }
  return '';
};
