// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePollTableStatus } from "./usePollTableStatus";

const getTableStatus = vi.hoisted(() => vi.fn());
vi.mock("@services/api/table", () => ({ default: { getTableStatus } }));

const base = { datasetId: "d1", tableId: "t1", enabled: true };

// let pending promises (the mocked request) settle between timer ticks
const tick = (ms: number) => vi.advanceTimersByTimeAsync(ms);

describe("usePollTableStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getTableStatus.mockReset();
    getTableStatus.mockResolvedValue({ data: { complianceStatus: "PENDING" } });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("polls on the interval, not immediately by default", async () => {
    const onStatus = vi.fn();
    renderHook(() => usePollTableStatus({ ...base, onStatus }));
    expect(getTableStatus).not.toHaveBeenCalled();
    await tick(5000);
    expect(getTableStatus).toHaveBeenCalledTimes(1);
    expect(getTableStatus).toHaveBeenCalledWith({
      tableId: "t1",
      datasetId: "d1",
    });
    expect(onStatus).toHaveBeenCalledWith(
      { complianceStatus: "PENDING" },
      expect.any(Function),
    );
    await tick(5000);
    expect(getTableStatus).toHaveBeenCalledTimes(2);
  });

  it("polls right away with immediate", async () => {
    renderHook(() =>
      usePollTableStatus({ ...base, immediate: true, onStatus: vi.fn() }),
    );
    await tick(0);
    expect(getTableStatus).toHaveBeenCalledTimes(1);
  });

  it("does nothing while disabled or without ids", async () => {
    renderHook(() =>
      usePollTableStatus({ ...base, enabled: false, onStatus: vi.fn() }),
    );
    renderHook(() =>
      usePollTableStatus({ ...base, tableId: undefined, onStatus: vi.fn() }),
    );
    await tick(20000);
    expect(getTableStatus).not.toHaveBeenCalled();
  });

  it("never overlaps requests", async () => {
    let release!: () => void;
    getTableStatus.mockImplementation(
      () => new Promise((resolve) => (release = () => resolve({ data: {} }))),
    );
    renderHook(() => usePollTableStatus({ ...base, onStatus: vi.fn() }));
    await tick(15000); // three ticks while the first request is still pending
    expect(getTableStatus).toHaveBeenCalledTimes(1);
    release();
    await tick(5000);
    expect(getTableStatus).toHaveBeenCalledTimes(2);
  });

  it("stop() ends polling, even if the follow-up work fails", async () => {
    const onStatus = vi.fn(async (_status, stop: () => void) => {
      stop();
      throw new Error("reload failed");
    });
    renderHook(() => usePollTableStatus({ ...base, onStatus }));
    await tick(5000);
    expect(onStatus).toHaveBeenCalledTimes(1);
    await tick(30000);
    expect(getTableStatus).toHaveBeenCalledTimes(1);
  });

  it("retries after a failed request", async () => {
    getTableStatus.mockRejectedValueOnce(new Error("network"));
    const onStatus = vi.fn();
    renderHook(() => usePollTableStatus({ ...base, onStatus }));
    await tick(5000);
    expect(onStatus).not.toHaveBeenCalled();
    await tick(5000);
    expect(onStatus).toHaveBeenCalledTimes(1);
  });

  it("stops on unmount and when disabled", async () => {
    const { rerender, unmount } = renderHook(
      ({ enabled }) =>
        usePollTableStatus({ ...base, enabled, onStatus: vi.fn() }),
      { initialProps: { enabled: true } },
    );
    await tick(5000);
    expect(getTableStatus).toHaveBeenCalledTimes(1);
    rerender({ enabled: false });
    await tick(20000);
    expect(getTableStatus).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("uses the latest callback without restarting the interval", async () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      ({ cb }) => usePollTableStatus({ ...base, onStatus: cb }),
      { initialProps: { cb: first } },
    );
    await tick(2500);
    rerender({ cb: second });
    await tick(2500); // the interval was not reset by the rerender
    expect(getTableStatus).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
