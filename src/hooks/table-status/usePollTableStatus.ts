import { useEffect, useRef } from "react";
import tableAPI, { GetTableStatusResponse } from "@services/api/table";

type Options = {
  datasetId?: string;
  tableId?: string;
  /** Poll only while true; the interval is cleared when it turns false. */
  enabled: boolean;
  intervalMs?: number;
  /** Also poll once right away instead of waiting for the first tick. */
  immediate?: boolean;
  /**
   * Called with every status response. Call `stop()` to end polling (do it
   * before any slow follow-up work so a failure there cannot restart it).
   */
  onStatus: (
    status: GetTableStatusResponse,
    stop: () => void,
  ) => void | Promise<void>;
};

/**
 * Poll the lightweight table status endpoint. It bypasses the store on
 * purpose, so polling does not re-render the table. Requests never overlap and
 * transient failures are retried on the next tick.
 */
export const usePollTableStatus = ({
  datasetId,
  tableId,
  enabled,
  intervalMs = 5000,
  immediate = false,
  onStatus,
}: Options) => {
  // always call the latest callback without restarting the interval
  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;

  useEffect(() => {
    if (!enabled || !datasetId || !tableId) return;

    let inFlight = false;
    let stopped = false;
    let interval: ReturnType<typeof setInterval> | undefined;

    const stop = () => {
      stopped = true;
      clearInterval(interval);
    };

    const tick = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const { data } = await tableAPI.getTableStatus({ tableId, datasetId });
        if (stopped) return;
        await onStatusRef.current(data, stop);
      } catch {
        // transient failure: retry on the next tick
      } finally {
        inFlight = false;
      }
    };

    if (immediate) tick();
    interval = setInterval(tick, intervalMs);
    return stop;
  }, [enabled, datasetId, tableId, intervalMs, immediate]);
};
