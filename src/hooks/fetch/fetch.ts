import { useState, useEffect } from 'react';
import { AxiosRequestConfig } from 'axios';
import { useAppDispatch } from '@hooks/store';
import apiClient from '@services/api/config/config';
import { isObject } from '@services/utils/is-object';

export interface IFetchParams extends AxiosRequestConfig { }

export interface IFetchConfig {
  mappingFn?: (result: any) => any; // function which will be executed before returning the response
  dispatchFn?: (...params: any) => any; // to dispatch automatically to a store
  dispatchParams?: any[]; // any params you can pass to the dispatch function
  manual?: boolean; // to configure when the fetch is happening
}

/**
 * A reusable axios hook which keeps track of response, error, loading states.
 * Added generic so we can specify the return of useFetch
 */
const useFetch = <T>(
  fetchParams: IFetchParams,
  {
    manual,
    mappingFn,
    dispatchFn,
    dispatchParams = []
  }: IFetchConfig = {}
) => {
  const [response, setData] = useState<T>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  const fetchData = async (params: AxiosRequestConfig, clearCacheEntry = false) => {
    try {
      const { data } = await apiClient.request({ ...params, clearCacheEntry });

      let result = data;
      // if a mapping function is passed, process data before returning it
      if (mappingFn) {
        result = mappingFn(data);
      }
      setData(result);

      // if a dispatch action is passed, dispatch response to store
      if (dispatchFn) {
        const dispatchParamsObj = dispatchParams.reduce(
          (acc, param) => {
            if (isObject(param)) {
              return { ...acc, ...param };
            }
            throw Error('Parameter has to be an object');
          }, result
        );

        dispatch(dispatchFn({ ...result, ...dispatchParamsObj }));
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manually fetch data
   */
  const fetchManualData = () => {
    fetchData(fetchParams, true);
  };

  useEffect(() => {
    // only fetch data if not manual
    if (!manual) {
      fetchData(fetchParams);
    }
  }, [fetchParams.url, manual]); // execute each time the url changes

  return {
    response,
    error,
    loading,
    fetchManualData // to let user trigger fetch manually
  };
};

export default useFetch;
