import { useQuery } from "@hooks/router";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import TableViewer from "@pages/Viewer/TableViewer";
import {
  selectCurrentTable,
  selectGetTableStatus,
} from "@store/slices/table/table.selectors";
import { selectIsLoggedIn } from "@store/slices/auth/auth.selectors";
import { getTable, getDependencies } from "@store/slices/table/table.thunk";
import { updateUI } from "@store/slices/table/table.slice";
import datasetAPI from "@services/api/datasets";
import {
  FC,
  useCallback,
  useEffect,
  useState,
  useLayoutEffect,
  useRef,
} from "react";
import { useHistory, useParams } from "react-router-dom";
import { LinearProgress, Stack } from "@mui/material";
import {
  restoreInitialState,
  updateCurrentTable,
} from "@store/slices/table/table.slice";
import deferMounting from "@components/HOC";
import { SnackbarKey, useSnackbar } from "notistack";
import { isEmptyObject } from "@services/utils/objects-utils";
import { Loader } from "@components/core";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import useSocketIo from "@components/core/SocketIoProvider/useSocketIo";
import Toolbar from "../Toolbar";
import W3CViewer from "../W3CViewer";
import GraphViewer from "../GraphViewer";

const ALLOWED_QUERY = ["table", "graph", "raw"];

const DeferredTableViewer = deferMounting(TableViewer);
const DeferredW3CViewer = deferMounting(W3CViewer);
const DeferredGraphViewer = deferMounting(GraphViewer);

const spin = keyframes`
  0% { transform: rotate(0deg) }
  100% { transform: rotate(359deg) }
`;

const LoaderAnnoation = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 3px solid;
  border-color: #ffffff rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.1);
  animation: ${spin} 0.6s linear infinite;
`;

const Viewer: FC<unknown> = () => {
  const refSnack = useRef<SnackbarKey | null>(null);
  const history = useHistory();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { tableId, datasetId } = useParams<{
    tableId: string;
    datasetId: string;
  }>();
  const { view } = useQuery();
  const { loading } = useAppSelector(selectGetTableStatus);
  const currentTable = useAppSelector(selectCurrentTable);
  const dispatch = useAppDispatch();
  const socket = useSocketIo();
  const auth = useAppSelector(selectIsLoggedIn);

  useEffect(() => {
    if (tableId && datasetId) {
      if (!view && ALLOWED_QUERY.indexOf(view) === -1) {
        history.push(`/datasets/${datasetId}/tables/${tableId}?view=table`);
      }
    }
  }, [view, tableId, datasetId]);

  useEffect(() => {
    if (!datasetId || !tableId) return;

    let cancelled = false;

    const checkPermissionsAndAcquireLock = async () => {
      try {
        // 1. Determine if this user has edit rights (ACL check)
        const response = await datasetAPI.getDatasetInfo({ datasetId });
        const dataset = response.data;
        const currentUserId = auth.user?.id;
        const uid = String(currentUserId);

        const isOwner =
          dataset &&
          currentUserId !== undefined &&
          String(dataset.userId) === uid;

        const isDatasetEditor =
          dataset &&
          Array.isArray(dataset.editors) &&
          currentUserId !== undefined &&
          dataset.editors.map(String).includes(uid);

        // Owner always has dataset-level edit rights; also respect visibility/editors
        const datasetCanEdit = Boolean(
          dataset &&
          (isOwner || dataset.visibility === "public" || isDatasetEditor),
        );

        let canEdit = datasetCanEdit;
        try {
          const tableResp = await datasetAPI.getTableAcl(datasetId, tableId);
          const table = tableResp.data as any;
          if (table.visibility === "private") {
            const isTableEditor =
              Array.isArray(table.editors) &&
              table.editors.map(String).includes(uid);
            canEdit = datasetCanEdit && isTableEditor;
          }
        } catch {
          // fall back to dataset-level
        }

        // 2. No edit rights → view only, done
        if (!canEdit) {
          if (!cancelled)
            dispatch(updateUI({ settings: { isViewOnly: true } }));
          return;
        }

        // 3. Has edit rights → MUST acquire the lock (including owners)
        //    The lock is the single source of truth for concurrent editing.
        const lockResponse = await datasetAPI.acquireTableLock(tableId);
        if (!cancelled) {
          if (lockResponse.data?.acquired === true) {
            dispatch(updateUI({ settings: { isViewOnly: false } }));
          } else {
            // Lock is held by someone else
            dispatch(updateUI({ settings: { isViewOnly: true } }));
          }
        }
      } catch {
        // Any failure (network, lock error) → safe default is view-only
        if (!cancelled) dispatch(updateUI({ settings: { isViewOnly: true } }));
      }
    };

    checkPermissionsAndAcquireLock();

    return () => {
      cancelled = true;
    };
  }, [datasetId, tableId, auth.user?.id, auth.loggedIn, dispatch]);

  // Release lock when leaving the table
  useEffect(() => {
    return () => {
      if (tableId) {
        datasetAPI.releaseTableLock(tableId).catch(() => {});
      }
    };
  }, [tableId]);

  useEffect(() => {
    if (tableId && datasetId) {
      dispatch(getTable({ tableId, datasetId }))
        .unwrap()
        .then(() => {
          dispatch(getDependencies({ tableId, datasetId }));
        })
        .catch(() => history.push("/404"));
    }
  }, [tableId, datasetId]);

  // WebSocket listener for compliance status updates
  useEffect(() => {
    if (!socket || !datasetId || !tableId) return;

    const handleComplianceDone = (data: any) => {
      if (data.datasetId !== datasetId || data.tableId !== tableId) return;

      if (refSnack.current) {
        closeSnackbar(refSnack.current);
        refSnack.current = null;
      }

      if (data.status === "DONE") {
        enqueueSnackbar("GDPR compliance check completed successfully!", {
          variant: "success",
        });
        dispatch(updateCurrentTable(data.table));
      } else if (data.status === "ERROR") {
        enqueueSnackbar(
          data.error || "GDPR compliance check failed. Please try again.",
          { variant: "error" },
        );
        dispatch(updateCurrentTable({ complianceStatus: "ERROR" }));
      }
    };

    socket.on("compliance-done", handleComplianceDone);
    return () => {
      socket.off("compliance-done", handleComplianceDone);
    };
  }, [socket, datasetId, tableId, dispatch, enqueueSnackbar, closeSnackbar]);

  useEffect(() => {
    if (isEmptyObject(currentTable)) return;

    if (refSnack.current) {
      closeSnackbar(refSnack.current);
      refSnack.current = null;
    }

    let message = "";
    if (currentTable.schemaStatus === "PENDING") {
      message = "The headers are being classified";
    } else if (currentTable.mantisStatus === "PENDING") {
      message = "The table is being annotated";
    } else if (currentTable.complianceStatus === "PENDING") {
      message = "Compliance assessments are being done";
    }
    if (message) {
      refSnack.current = enqueueSnackbar(
        <Stack direction="row" gap="10px" alignItems="center">
          <span>{message}</span>
          <LoaderAnnoation />
        </Stack>,
        { persist: true, variant: "info" },
      );
    }
  }, [currentTable]);

  useEffect(() => {
    return () => {
      dispatch(restoreInitialState());
      if (refSnack.current) {
        closeSnackbar(refSnack.current);
      }
    };
  }, []);

  const Switch = useCallback(() => {
    if (view) {
      switch (view) {
        case "table":
          return <DeferredTableViewer />;
        case "graph":
          return <DeferredGraphViewer />;
        case "raw":
          return <DeferredW3CViewer />;
        default:
          return null;
      }
    }
  }, [view]);

  return (
    <>
      <Toolbar />
      {!loading ? <>{Switch()}</> : <LinearProgress />}
    </>
  );
};

export default Viewer;
