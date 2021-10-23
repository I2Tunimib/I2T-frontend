import { Config, ApiConfig, Endpoint } from '@store/slices/config/interfaces/config';
import { store } from './store';

export const getAllParams = (path: string) => {
  return path.split('/').reduce((acc, slice) => {
    if (slice.startsWith(':')) {
      acc.push(slice.split(':')[1]);
    }
    return acc;
  }, [] as string[]);
  // return Array.from(path.matchAll(/(:(.*?))\//g)).map(([_, placeholder, param]) => {
  //   return param;
  // });
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
  mergedConfig: Config
) => {
  const { GLOBAL } = mergedConfig.API;
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
    }, path);
  }

  // get env variables (if there are), and substitute with value
  const vars = getAllEnvVar(finalPath);

  finalPath = vars.reduce((acc, [placeholder, variable]) => {
    if (!process.env[variable]) {
      // eslint-disable-next-line no-console
      console.error(`.env file doesn't contain '${variable}'`);
      return acc;
    }
    return acc.replace(placeholder, process.env[variable] || '');
  }, finalPath);

  if (useGlobal) {
    const [_, globalUrlVariable] = getEnvVar(GLOBAL);
    return `${process.env[globalUrlVariable]}${finalPath}`;
  }

  return finalPath;
};

export const apiEndpoint = ({
  endpoint,
  subEndpoint,
  paramsValue
}: {
  endpoint: keyof ApiConfig['ENDPOINTS'],
  subEndpoint?: string,
  paramsValue?: Record<string, string | number>
}) => {
  const config = store.getState().config.app as Config;

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
