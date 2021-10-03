import useIsMounted from '@hooks/is-mounted/useIsMounted';
import { useAppDispatch } from '@hooks/store';
import { Typography } from '@mui/material';
import { convertToW3C } from '@store/slices/table/table.thunk';
import { useEffect, useState } from 'react';
import ReactJson from 'react-json-view';
import styles from './W3CViewer.module.scss';

const W3CViewer = () => {
  const [data, setData] = useState<any>();
  const isMounted = useIsMounted();

  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;
    dispatch(convertToW3C(false))
      .unwrap()
      .then((res) => {
        if (mounted) {
          setData(res);
        }
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className={styles.Container}>
      <ReactJson
        src={data}
        enableClipboard={false}
        shouldCollapse={({
          name, src,
          type, namespace
        }) => {
          const path = namespace.join('.');
          if (path === 'root') {
            return false;
          }
          if (path === 'root.0' || path === 'root.1') {
            return false;
          }
          if (name === 'th0' || name === 'Point of interest') {
            return false;
          }
          if (name === 'metadata' || name === 'Point of interest') {
            return false;
          }
          if (name === '0' || name === '0') {
            return false;
          }
          if (name === 'property') {
            return false;
          }
          return true;
        }}
      />
      {/* <Typography component="pre" variant="caption" className={styles.Pre}>
        {data && JSON.stringify(data, null, 2)}
      </Typography> */}
    </div>
  );
};

export default W3CViewer;
