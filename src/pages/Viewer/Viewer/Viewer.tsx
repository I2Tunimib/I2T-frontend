import { useQuery } from "@hooks/router";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import TableViewer from "@pages/Viewer/TableViewer";
import {
  selectCurrentTable,
  selectGetTableStatus,
} from "@store/slices/table/table.selectors";
import { selectIsLoggedIn } from "@store/slices/auth/auth.selectors";
import { getTable, getDependencies } from "@store/slices/table/table.thunk";
import { usePollTableStatus } from "@hooks/table-status";
import {
  checkEditAccess,
  releaseTableLock,
} from "@store/slices/table/table.access.thunk";
import { FC, useCallback, useEffect, useRef } from "react";
import { useHistory, useParams } from "react-router-dom";
import { LinearProgress, Stack } from "@mui/material";
import {
  updateUI,
  restoreInitialState,
  updateCurrentTable,
} from "@store/slices/table/table.slice";
import deferMounting from "@components/HOC";
import { SnackbarKey, useSnackbar } from "notistack";
import { isEmptyObject } from "@services/utils/objects-utils";
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
      if (!view || !ALLOWED_QUERY.includes(view)) {
        history.replace(`/datasets/${datasetId}/tables/${tableId}?view=table`);
      }
    }
  }, [view, tableId, datasetId]);

  // Decide view-only vs edit (ACL) and take the edit lock when editing.
  useEffect(() => {
    if (!datasetId || !tableId) return;
    const request = dispatch(
      checkEditAccess({ datasetId, tableId, userId: auth.user?.id }),
    );
    return () => {
      request.abort();
    };
  }, [datasetId, tableId, auth.user?.id, auth.loggedIn, dispatch]);

  // Release lock when leaving the table
  useEffect(() => {
    return () => {
      if (tableId) {
        dispatch(releaseTableLock({ tableId }));
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

  // Latest compliance status, readable from callbacks without stale closures
  const complianceStatusRef = useRef<string | undefined>(undefined);
  complianceStatusRef.current = currentTable.complianceStatus;

  // Shared by the websocket event and the polling fallback. Idempotent: once
  // the status is no longer PENDING, further calls are ignored.
  const onComplianceFinished = useCallback(
    (data: { status: string; complianceReports?: any; error?: string }) => {
      if (complianceStatusRef.current !== "PENDING") return;
      if (data.status !== "DONE" && data.status !== "ERROR") return;
      complianceStatusRef.current = data.status;

      if (refSnack.current) {
        closeSnackbar(refSnack.current);
        refSnack.current = null;
      }

      if (data.status === "DONE") {
        enqueueSnackbar("GDPR compliance check completed successfully!", {
          variant: "success",
        });
        dispatch(
          updateCurrentTable({
            complianceStatus: "DONE",
            complianceReports: data.complianceReports,
          }),
        );
      } else {
        enqueueSnackbar(
          data.error || "GDPR compliance check failed. Please try again.",
          { variant: "error" },
        );
        dispatch(updateCurrentTable({ complianceStatus: "ERROR" }));
      }
    },
    [dispatch, enqueueSnackbar, closeSnackbar],
  );

  // WebSocket listener for compliance status updates
  useEffect(() => {
    if (!socket || !datasetId || !tableId) return;

    const handleComplianceDone = (data: any) => {
      if (data.datasetId !== datasetId || data.tableId !== tableId) return;
      onComplianceFinished(data);
    };

    socket.on("compliance-done", handleComplianceDone);
    return () => {
      socket.off("compliance-done", handleComplianceDone);
    };
  }, [socket, datasetId, tableId, onComplianceFinished]);

  // Polling fallback in case the websocket event is never received
  usePollTableStatus({
    datasetId,
    tableId,
    enabled: currentTable.complianceStatus === "PENDING",
    onStatus: (table) => {
      // Other values (e.g. a GDPR result written just before DONE) mean the
      // run is still finishing: keep polling.
      if (table?.complianceStatus === "DONE") {
        onComplianceFinished({
          status: "DONE",
          complianceReports: table.complianceReports,
        });
      } else if (table?.complianceStatus === "ERROR") {
        onComplianceFinished({ status: "ERROR" });
      }
    },
  });

  // Both annotation kinds complete asynchronously and normally notify us via
  // Socket.IO. If that event is missed (or websockets are unavailable), poll the
  // lightweight status endpoint, which does not touch the store, and reload the
  // table once when the run is over so the grid does not flicker meanwhile.
  // The reload happens at most once per pending run, even if the store still
  // reports PENDING afterwards.
  usePollTableStatus({
    datasetId,
    tableId,
    enabled:
      currentTable.mantisStatus === "PENDING" ||
      currentTable.schemaStatus === "PENDING",
    immediate: true,
    onStatus: async (status, stop) => {
      const stillPending =
        (currentTable.mantisStatus === "PENDING" &&
          status?.mantisStatus === "PENDING") ||
        (currentTable.schemaStatus === "PENDING" &&
          status?.schemaStatus === "PENDING");
      if (stillPending) return;
      stop();
      await dispatch(getTable({ tableId, datasetId })).unwrap();
      dispatch(updateUI({ settings: { isViewOnly: false } }));
      dispatch(getDependencies({ tableId, datasetId }));
    },
  });

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

  useEffect(() => {
    if (view && ALLOWED_QUERY.includes(view)) {
      dispatch(updateUI({ view: view as "table" | "graph" | "raw" }));
    }
  }, [view, dispatch]);

  const Switch = useCallback(() => {
    if (view) {
      switch (view) {
        case "table":
          return <DeferredTableViewer />;
        case "graph":
          return <DeferredGraphViewer datasetId={datasetId} tableId={tableId} />;
        case "raw":
          return <DeferredW3CViewer />;
        default:
          return null;
      }
    }
  }, [view, datasetId, tableId]);

  return (
    <>
      <Toolbar />
      {!loading ? <>{Switch()}</> : <LinearProgress />}
    </>
  );
};

export default Viewer;
