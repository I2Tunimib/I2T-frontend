import { useCallback, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

export const useQuery = () => {
  const location = useLocation();
  const querySearchParams = new URLSearchParams(location.search);

  const paramsToObject = useCallback(() => {
    return Array.from(querySearchParams.keys()).reduce((acc, key) => {
      acc[key] = querySearchParams.get(key as string);
      return acc;
    }, {} as Record<string, any>);
  }, [querySearchParams]);

  return paramsToObject();
};

export const useGoBack = (defaultUrl: string) => {
  const history = useHistory();

  const goBack = useCallback(() => {
    if (history.action === 'POP') {
      history.push(defaultUrl);
    } else {
      history.go(-1);
    }
  }, [history]);

  return {
    goBack
  };
};
