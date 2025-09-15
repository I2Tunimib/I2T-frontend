import useIsMounted from "@hooks/is-mounted/useIsMounted";
import { useAppDispatch } from "@hooks/store";
import { exportTable } from "@store/slices/table/table.thunk";
import { useEffect, useState } from "react";
import ReactJson from "react18-json-view";
import { useParams } from "react-router-dom";
import styles from "./W3CViewer.module.scss";

const W3CViewer = () => {
  const [data, setData] = useState<any>();
  const isMounted = useIsMounted();
  const params = useParams<{ datasetId: string; tableId: string }>();

  const dispatch = useAppDispatch();

  useEffect(() => {
    let mounted = true;
    // dispatch(exportTable({ format: "W3C", params }))
    //   .unwrap()
    //   .then((res) => {
    //     if (mounted) {
    //       setData(res);
    //     }
    //   });
    convertToW3C();
    // dispatch(convertToW3C(false))
    //   .unwrap()
    //   .then((res) => {
    //     if (mounted) {
    //       setData(res);
    //     }
    //   });
    return () => {
      mounted = false;
    };
  }, []);
  async function convertToW3C() {
    const res = await dispatch(
      exportTable({ format: "JSON (W3C Compliant)", params }),
    ).unwrap();
    setData(res);
  }
  return (
    <div className={styles.Container}>
      <ReactJson
        src={data}
        enableClipboard={false}
        shouldCollapse={({ name, src, type, namespace }) => {
          const path = namespace.join(".");
          if (path === "root") {
            return false;
          }
          if (path === "root.0" || path === "root.1") {
            return false;
          }
          if (name === "th0" || name === "Point of interest") {
            return false;
          }
          if (name === "metadata" || name === "Point of interest") {
            return false;
          }
          if (name === "0" || name === "0") {
            return false;
          }
          if (name === "property") {
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
