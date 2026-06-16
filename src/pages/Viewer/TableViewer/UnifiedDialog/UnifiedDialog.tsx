import React, { FC, useEffect, useRef, useState, forwardRef, Ref, ReactElement } from "react";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  IconButton,
  Divider,
  Slide,
  TransitionProps,
} from "@mui/material";
import { HelpOutlineRounded } from "@mui/icons-material";
import { TransitionProps as TP } from "@mui/material/transitions";
import { SquaredBox } from "@components/core";
import DynamicForm from "@components/core/DynamicForm/DynamicForm";
import { updateUI } from "@store/slices/table/table.slice";
import {
  selectExtendersAsArray,
  selectModifiersAsArray,
  selectReconciliatorsAsArray,
} from "@store/slices/config/config.selectors";
import {
  selectAreCellReconciliated,
  selectSelectedColumnIdsAsArray,
  selectReconciliationCells,
  selectReconcileRequestStatus,
  selectModifyRequestStatus,
  selectExtendRequestStatus,
} from "@store/slices/table/table.selectors";
import { Reconciliator, Extender, Modifier } from "@store/slices/config/interfaces/config";
import { reconcile, modify, extend } from "@store/slices/table/table.thunk";
import { useSnackbar, closeSnackbar } from "notistack";
import { getGroupFromUri } from "@services/utils/kg-info";

const Transition = forwardRef(
  (
    props: TransitionProps & { children: ReactElement<any, any> },
    ref: Ref<unknown>,
  ) => <Slide direction="down" ref={ref} {...props} />,
);

export type UnifiedDialogMode = "reconcile" | "modify" | "extend";

export type UnifiedDialogProps = {
  mode: UnifiedDialogMode;
  open: boolean;
  handleClose: () => void;
};

const UnifiedDialog: FC<UnifiedDialogProps> = ({ mode, open, handleClose }) => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  // selectors depending on mode
  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const modifiers = useAppSelector(selectModifiersAsArray);
  const extenders = useAppSelector(selectExtendersAsArray);

  const cellReconciliated = useAppSelector(selectAreCellReconciliated);
  const selectedColumnsArray = useAppSelector(selectSelectedColumnIdsAsArray);
  const selectedCells = useAppSelector(selectReconciliationCells);

  const reconcileStatus = useAppSelector(selectReconcileRequestStatus);
  const modifyStatus = useAppSelector(selectModifyRequestStatus);
  const extendStatus = useAppSelector(selectExtendRequestStatus);

  const [grouped, setGrouped] = useState<Map<string, any[]>>(new Map());
  const [uniqueGroups, setUniqueGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [currentService, setCurrentService] = useState<Reconciliator | Extender | Modifier | null>(null);
  const [uniqueServices, setUniqueServices] = useState<any[]>([]);

  // promise refs for aborting
  const reconcileReqRef = useRef<any>(null);

  function buildReconciliatorGroups() {
    const map = new Map<string, Reconciliator[]>();
    const names = new Set<string>();
    const list = reconciliators || [];
    const ungrouped = list.filter((r: any) => {
      const hasCustom = r.group || r.public?.group || r.public?.groupName;
      return !hasCustom;
    });
    const unique = ungrouped.filter((r: any, i: number, self: any[]) => i === self.findIndex((x) => x.id === r.id));
    unique.forEach((recon) => {
      const key = getGroupFromUri(recon.uri) || "Other Services";
      names.add(key);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(recon);
    });
    setGrouped(map);
    setUniqueGroups(Array.from(names));
    setUniqueServices([]);
  }

  function buildSimpleGroups() {
    const services = mode === "modify" ? modifiers || [] : extenders || [];
    const groupedMap = new Map<string, any[]>();
    const ungrouped = services.filter((s: any) => {
      const hasCustom = s.group || s.public?.group || s.public?.groupName;
      return !hasCustom;
    });
    const unique = ungrouped.filter((s: any, i: number, self: any[]) => i === self.findIndex((x) => x.id === s.id));
    setUniqueServices(unique);
    unique.forEach((svc: any) => {
      const key = svc.uri ?? "other";
      if (!groupedMap.has(key)) groupedMap.set(key, []);
      groupedMap.get(key)!.push(svc);
    });
    setGrouped(groupedMap);
    setUniqueGroups(Array.from(groupedMap.keys()));
  }

  useEffect(() => {
    // build grouped services depending on mode
    if (mode === "reconcile") buildReconciliatorGroups();
    else buildSimpleGroups();
    // reset selections when mode changes
    setSelectedGroup(null);
    setCurrentService(null);
  }, [mode, reconciliators, modifiers, extenders]);

  const handleGroupChange = (e: SelectChangeEvent<string>) => {
    setSelectedGroup(e.target.value || null);
    setCurrentService(null);
  };

  const handleServiceChange = (e: SelectChangeEvent<string>) => {
    const id = e.target.value;
    if (mode === "reconcile") {
      const list = grouped.get(selectedGroup || "") || [];
      const s = list.find((x: any) => x.id === id) || null;
      setCurrentService(s);
    } else if (mode === "modify") {
      const s = modifiers.find((m) => m.id === id) || null;
      setCurrentService(s);
    } else {
      const s = extenders.find((m) => m.id === id) || null;
      setCurrentService(s);
    }
  };

  const handleSimpleServiceSelect = (e: SelectChangeEvent<string>) => {
    const id = e.target.value;
    const svc = uniqueServices.find((s) => s.id === id) || null;
    setCurrentService(svc);
  };

  const handleSubmit = (formState: Record<string, any>, reset?: Function) => {
    if (!currentService) return;
    if (mode === "reconcile") {
      const req = dispatch(
        // @ts-ignore
        reconcile({ items: selectedCells, reconciliator: currentService as Reconciliator, formValues: formState }),
      );
      reconcileReqRef.current = req;
      req
        .unwrap()
        .then(() => {
          if (reset) reset();
          setCurrentService(null);
          setSelectedGroup(null);
          dispatch(updateUI({ openReconciliateDialog: false }));
          enqueueSnackbar("Learn more about annotation symbols in this tutorial section", {
            variant: "info",
            autoHideDuration: 8000,
            action: (key) => (
              <IconButton
                size="small"
                sx={{ color: "#fff", fontWeight: "bold" }}
                onClick={() => {
                  dispatch(
                    updateUI({
                      openHelpDialog: true,
                      helpStart: "tutorial",
                      tutorialStep: 18,
                    }),
                  );
                  closeSnackbar(key);
                }}
              >
                <HelpOutlineRounded />
              </IconButton>
            ),
          });
        })
        .finally(() => {
          reconcileReqRef.current = null;
        });
    }

    if (mode === "modify") {
      const payload = { ...formState, selectedColumns: selectedColumnsArray };
      const req = dispatch(modify({ modifier: currentService as Modifier, formValues: payload }));
      req
        .unwrap()
        .then(({ data }: any) => {
          if (reset) reset();
          setCurrentService(null);
          dispatch(updateUI({ openModificationDialog: false }));
          let infoText = "";
          if (data.rows) {
            const nRows = Object.keys(data.rows).length;
            infoText = `${nRows} ${nRows > 1 ? "rows" : "row"} added`;
          } else {
            const modifiedColumnIds = Object.keys(data.columns || {});
            const nColumns = modifiedColumnIds.length;
            const isUpdate = modifiedColumnIds.every((id) => selectedColumnsArray.includes(id));
            const actionText = isUpdate ? "updated" : "added";
            infoText = `${nColumns} ${nColumns > 1 ? "columns" : "column"} ${actionText}`;
          }
          enqueueSnackbar(infoText, { autoHideDuration: 3000, anchorOrigin: { vertical: "bottom", horizontal: "center" } });
        })
        .catch((err) => {
          enqueueSnackbar(err.message || "An error occurred.", { variant: "error", autoHideDuration: 4000 });
          throw err;
        });
    }

    if (mode === "extend") {
      const req = dispatch(extend({ extender: currentService as Extender, formValues: formState }));
      (window as any).__extensionRequest = req;
      req
        .unwrap()
        .then(({ data }: any) => {
          if (reset) reset();
          setCurrentService(null);
          dispatch(updateUI({ openExtensionDialog: false }));
          const nColumns = Object.keys(data.columns).length;
          const infoText = `${nColumns} ${nColumns > 1 ? "columns" : "column"} added`;
          enqueueSnackbar(infoText, { autoHideDuration: 3000, anchorOrigin: { vertical: "bottom", horizontal: "center" } });
        })
        .finally(() => {
          if ((window as any).__extensionRequest === req) (window as any).__extensionRequest = null;
        });
    }
  };

  const handleCancel = () => {
    // abort reconcile request
    if (reconcileReqRef.current && reconcileReqRef.current.abort) {
      reconcileReqRef.current.abort();
      reconcileReqRef.current = null;
    }
    // abort extension
    if ((window as any).__extensionRequest && (window as any).__extensionRequest.abort) {
      (window as any).__extensionRequest.abort();
      (window as any).__extensionRequest = null;
    }
    // close and reset
    setCurrentService(null);
    setSelectedGroup(null);
    handleClose();
  };

  // small helpers for UI text and loading states
  const title = mode === "reconcile" ? "Reconciliation" : mode === "modify" ? "Modify" : "Extension";
  const loading = mode === "reconcile" ? reconcileStatus.loading : mode === "modify" ? modifyStatus.loading : extendStatus.loading;

  const servicesForSelectedGroup = mode === "reconcile" ? grouped.get(selectedGroup || "") || [] : [];

  return (
    <Dialog open={open} TransitionComponent={Transition} onClose={handleCancel} keepMounted>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <DialogTitle>{title}</DialogTitle>
        <IconButton
          sx={{ color: "rgba(0, 0, 0, 0.54)", marginRight: "20px" }}
          onClick={() => {
            const tutorialStep = mode === "reconcile" ? 16 : mode === "modify" ? 13 : 22;
            dispatch(updateUI({ openHelpDialog: true, helpStart: "tutorial", tutorialStep }));
          }}
        >
          <HelpOutlineRounded />
        </IconButton>
      </Stack>
      <DialogContent>
        <Stack direction="row" alignItems="center">
          <DialogContentText>
            {mode === "reconcile" ? "Select a group of service to reconcile with:" : mode === "modify" ? "Select a transformation function to modify with:" : "Select an extension service:"}
          </DialogContentText>
          <IconButton
            size="small"
            onClick={() => {
              const discoverStep = mode === "reconcile" ? 7 : mode === "modify" ? 0 : 15;
              dispatch(updateUI({ openHelpDialog: true, helpStart: "discover", discoverStep }));
            }}
          >
            <HelpOutlineRounded />
          </IconButton>
        </Stack>

        <Stack gap="10px" mt={1}>
          {mode === "reconcile" ? (
            <FormControl className="field">
              <Select
                value={selectedGroup || ""}
                onChange={handleGroupChange}
                displayEmpty
                variant="outlined"
                MenuProps={{ PaperProps: { style: { maxHeight: "400px" } } }}
                renderValue={(selected) => selected || (
                  <em style={{ color: "rgba(0,0,0,0.38)" }}>
                    Choose a service group...
                  </em>
                )}
              >
                <MenuItem disabled value="">
                  <em>Choose a service group...</em>
                </MenuItem>
                {uniqueGroups.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl className="field">
              <Select
                value={currentService ? currentService.id : ""}
                onChange={handleSimpleServiceSelect}
                displayEmpty
                variant="outlined"
                MenuProps={{ PaperProps: { style: { maxHeight: "400px" } } }}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <em style={{ color: "rgba(0,0,0,0.38)" }}>
                        Choose {mode === "reconcile" ? "a reconciliation" : mode === "modify" ? "a modification" : "an extension"} service...
                      </em>
                    );
                  }
                  const sel = uniqueServices.find((s) => s.id === selected);
                  return sel ? sel.name : "";
                }}
              >
                <MenuItem disabled value="">
                  <em>
                    Choose {mode === "reconcile" ? "a reconciliation" : mode === "modify" ? "a modification" : "an extension"} service...
                  </em>
                </MenuItem>
                {uniqueServices.map((svc) => (
                  <MenuItem key={svc.id} value={svc.id} onClick={() => setCurrentService(svc)}>
                    {svc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {mode === "reconcile" && (
            <FormControl className="field" disabled={!selectedGroup}>
              <DialogContentText paddingTop="8px" paddingBottom="12px">
                Select a specific service of the selected group:
              </DialogContentText>
              <Select value={(currentService && (currentService as any).id) || ""} onChange={handleServiceChange} displayEmpty variant="outlined" MenuProps={{ PaperProps: { style: { maxHeight: "400px" } } }} renderValue={(selected) => (selected ? (servicesForSelectedGroup.find((s: any) => s.id === selected)?.name ?? "") : <em style={{ color: "rgba(0,0,0,0.38)" }}>Choose a reconciliation service...</em>)}>
                <MenuItem disabled value="">
                  <em>Choose a reconciliation service...</em>
                </MenuItem>
                {servicesForSelectedGroup.map((svc: any) => (
                  <MenuItem key={svc.id} value={svc.id}>
                    {svc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* service description + form */}
          {currentService && (currentService as any).description && (
            <>
              <SquaredBox dangerouslySetInnerHTML={{ __html: (currentService as any).description }} />
              <Divider />
            </>
          )}

          {currentService && (
            <DynamicForm
              service={{ ...(currentService as any), selectedColumns: selectedColumnsArray }}
              loading={loading}
              onSubmit={handleSubmit}
              onCancel={() => {
                handleCancel();
              }}
            />
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedDialog;
