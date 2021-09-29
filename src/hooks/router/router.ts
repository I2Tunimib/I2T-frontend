import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

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
