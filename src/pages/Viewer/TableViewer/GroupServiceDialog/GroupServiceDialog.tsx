import React, { FC, useEffect, useRef, useState, useMemo, forwardRef, ReactElement, Ref } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  FormControl,
  MenuItem,
  Select,
  Divider,
  IconButton,
  Stack,
  InputLabel,
  SelectChangeEvent,
  Slide,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import { useSnackbar } from "notistack";
import DynamicForm from "@components/core/DynamicForm/DynamicForm";
import { SquaredBox } from "@components/core";
import {
  selectExtendersAsArray,
  selectReconciliatorsAsArray,
  selectModifiersAsArray,
} from "@store/slices/config/config.selectors";
import {
  selectSelectedColumnIdsAsArray,
  selectReconciliationCells,
  selectExtendRequestStatus,
  selectModifyRequestStatus,
  selectReconcileRequestStatus,
} from "@store/slices/table/table.selectors";
import { extend, reconcile, modify } from "@store/slices/table/table.thunk";
import { updateUI } from "@store/slices/table/table.slice";
import { HelpOutlineRounded, Close } from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";

const Transition = forwardRef(
  (
    props: TransitionProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>,
  ) => <Slide direction="down" ref={ref} {...props} />,
);

/**
 * Dialog props
 * - open: whether the dialog is shown
 * - groupName: the label of the group to display services for
 * - handleClose: close callback
 */
export type GroupServiceDialogProps = {
  open: boolean;
  groupName: string | null;
  handleClose: () => void;
};

type ServiceType = "reconciliator" | "extender" | "modifier" | "";

const GroupServiceDialog: FC<GroupServiceDialogProps> = ({
  open,
  groupName,
  handleClose,
}) => {
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  // Services from config store
  const extenders = useAppSelector(selectExtendersAsArray) || [];
  const reconciliators = useAppSelector(selectReconciliatorsAsArray) || [];
  const modifiers = useAppSelector(selectModifiersAsArray) || [];

  // Context state used when invoking services
  const selectedColumnIds =
    useAppSelector(selectSelectedColumnIdsAsArray) || [];
  const reconciliationCells = useAppSelector(selectReconciliationCells) || [];

  // Local UI state - two-step selection
  const [serviceType, setServiceType] = useState<ServiceType>("");
  const [currentService, setCurrentService] = useState<any | null>(null);
  const requestRef = useRef<any>(null);

  // Use centralized request selectors instead of local loading state.
  const extendRequestStatus = useAppSelector(selectExtendRequestStatus);
  const modifyRequestStatus = useAppSelector(selectModifyRequestStatus);
  const reconcileRequestStatus = useAppSelector(selectReconcileRequestStatus);
  const loading =
    Boolean(extendRequestStatus?.loading) ||
    Boolean(modifyRequestStatus?.loading) ||
    Boolean(reconcileRequestStatus?.loading);

  // Helper to extract group label from service
  const getServiceGroup = (service: any): string => {
    return (
      service.group ||
      service.public?.group ||
      service.public?.groupName ||
      null
    );
  };

  // Filter services by groupName and annotate with service type
  const groupedServicesByType = useMemo(() => {
    if (!groupName) {
      return {
        modifiers: [],
        reconciliators: [],
        extenders: [],
      };
    }

    // Deduplicate by service id
    const deduplicateById = (services: any[]) => {
      const seen = new Set();
      return services.filter((s) => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
    };

    return {
      reconciliators: deduplicateById(
        reconciliators
          .filter((s) => getServiceGroup(s) === groupName)
          .map((s) => ({ ...s, _serviceType: "reconciliator" })),
      ),
      extenders: deduplicateById(
        extenders
          .filter((s) => getServiceGroup(s) === groupName)
          .map((s) => ({ ...s, _serviceType: "extender" })),
      ),
      modifiers: deduplicateById(
        modifiers
          .filter((s) => getServiceGroup(s) === groupName)
          .map((s) => ({ ...s, _serviceType: "modifier" })),
      ),
    };
  }, [groupName, reconciliators, extenders, modifiers]);

  // Determine which service types have available services in this group
  const availableServiceTypes = useMemo(() => {
    const types: Array<{ id: ServiceType; label: string }> = [];
    if (groupedServicesByType.modifiers.length > 0) {
      types.push({ id: "modifier", label: "Modification" });
    }
    if (groupedServicesByType.reconciliators.length > 0) {
      types.push({ id: "reconciliator", label: "Reconciliation" });
    }
    if (groupedServicesByType.extenders.length > 0) {
      types.push({ id: "extender", label: "Extension" });
    }
    return types;
  }, [groupedServicesByType]);

  // Get available services based on selected type (filtered by group)
  const availableServices = useMemo(() => {
    if (!serviceType) return [];

    switch (serviceType) {
      case "reconciliator":
        return groupedServicesByType.reconciliators;
      case "extender":
        return groupedServicesByType.extenders;
      case "modifier":
        return groupedServicesByType.modifiers;
      default:
        return [];
    }
  }, [serviceType, groupedServicesByType]);

  // Reset state when dialog opens/closes or groupName changes
  useEffect(() => {
    if (!open || !groupName) {
      setServiceType("");
      setCurrentService(null);
    }
  }, [open, groupName]);

  // Reset service selection when service type changes
  const handleServiceTypeChange = (e: SelectChangeEvent<ServiceType>) => {
    setServiceType(e.target.value as ServiceType);
    setCurrentService(null);
  };

  // Close handler that also aborts any running request
  const onClose = () => {
    const inflight =
      (window as any).__groupServiceRequest || requestRef.current;
    if (inflight && inflight.abort) {
      try {
        inflight.abort();
      } catch {
        // ignore
      }
    }
    if ((window as any).__groupServiceRequest === inflight) {
      (window as any).__groupServiceRequest = null;
    }
    requestRef.current = null;
    setServiceType("");
    setCurrentService(null);
    handleClose();
  };

  const onSelectService = (serviceId: string) => {
    const svc = availableServices.find((s) => s.id === serviceId) || null;
    setCurrentService(svc);
  };

  // Submit handler: call correct thunk according to service type
  const onSubmit = async (
    formValues: Record<string, any>,
    reset?: Function,
  ) => {
    if (!currentService) return;

    try {
      if (currentService._serviceType === "extender") {
        const req = dispatch(
          extend({
            extender: currentService,
            formValues: { ...formValues, selectedColumns: selectedColumnIds },
          }),
        );
        requestRef.current = req;
        (window as any).__groupServiceRequest = req;
        const result = await req.unwrap();
        if (reset) reset();
        const nCols = Object.keys(result.data?.columns || {}).length;
        enqueueSnackbar(
          `${nCols} ${nCols === 1 ? "column" : "columns"} added`,
          {
            autoHideDuration: 3000,
          },
        );
        onClose();
      } else if (currentService._serviceType === "reconciliator") {
        const req = dispatch(
          reconcile({
            items: reconciliationCells,
            reconciliator: currentService,
            formValues,
          }),
        );
        requestRef.current = req;
        (window as any).__groupServiceRequest = req;
        await req.unwrap();
        if (reset) reset();
        enqueueSnackbar("Reconciliation completed", { autoHideDuration: 3000 });
        onClose();
      } else if (currentService._serviceType === "modifier") {
        const req = dispatch(
          modify({
            modifier: currentService,
            formValues: { ...formValues, selectedColumns: selectedColumnIds },
          }),
        );
        requestRef.current = req;
        (window as any).__groupServiceRequest = req;
        const result = await req.unwrap();
        if (reset) reset();

        const nRows = result.data?.rows
          ? Object.keys(result.data.rows).length
          : 0;
        const nCols = result.data?.columns
          ? Object.keys(result.data.columns).length
          : 0;
        if (nRows) {
          enqueueSnackbar(`${nRows} ${nRows > 1 ? "rows" : "row"} added`, {
            autoHideDuration: 3000,
          });
        } else {
          enqueueSnackbar(
            `${nCols} ${nCols > 1 ? "columns" : "column"} processed`,
            {
              autoHideDuration: 3000,
            },
          );
        }
        onClose();
      } else {
        enqueueSnackbar("Selected service is not supported", {
          variant: "warning",
          autoHideDuration: 3000,
        });
        onClose();
      }
    } catch (err: any) {
      enqueueSnackbar(
        err?.message || "An error occurred while executing the service",
        {
          variant: "error",
          autoHideDuration: 4000,
        },
      );
    } finally {
      const inflight =
        requestRef.current || (window as any).__groupServiceRequest;
      if ((window as any).__groupServiceRequest === inflight) {
        (window as any).__groupServiceRequest = null;
      }
      requestRef.current = null;
    }
  };

  return (
    <Dialog
      className="default-dialog"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <DialogTitle>
          {`Services - ${groupName || "Group"}`}
        </DialogTitle>
        <Stack direction="row" alignItems="flex-end">
          <IconButton
            aria-label="open-genAI-tutorial"
            sx={{
              color: "rgba(0, 0, 0, 0.54)",
            }}
            onClick={() => {
              dispatch(
                updateUI({
                  openHelpDialog: true,
                  helpStart: "tutorial",
                  tutorialStep: 22,
                }),
              );
            }}
          >
            <HelpOutlineRounded />
          </IconButton>
          <IconButton
            aria-label="close"
            sx={{
              color: "rgba(0, 0, 0, 0.54)",
              marginRight: "20px",
              opacity: "0.6",
            }}
            onClick={handleClose}
          >
            <Close />
          </IconButton>
        </Stack>
      </Stack>
      <DialogContent>
        <Stack direction="row" alignItems="center">
          <DialogContentText>
            Choose the type of service from this group:
          </DialogContentText>
          <IconButton
            aria-label="open-genAI-discover"
            size="small"
            onClick={() => {
              dispatch(
                updateUI({
                  openHelpDialog: true,
                  helpStart: "discover",
                  discoverStep: 24,
                }),
              );
            }}
          >
            <HelpOutlineRounded />
          </IconButton>
        </Stack>
        <Stack gap="10px">
          <FormControl
            className="field"
          >
            <Select
              labelId="service-type-label"
              value={serviceType}
              variant="outlined"
              displayEmpty
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: "400px",
                  },
                },
              }}
              onChange={handleServiceTypeChange}
              disabled={loading || availableServiceTypes.length === 0}
              renderValue={(selected) => {
                const value = selected as ServiceType;
                if (!value) {
                  return (
                    <em style={{ color: "rgba(0, 0, 0, 0.38)" }}>
                      Choose a service type...
                    </em>
                  );
                }
                const selectedType = availableServiceTypes.find((type) => type.id === value);
                return selectedType ? selectedType.label : "";
              }}
            >
              <MenuItem disabled value="">
                <em>Choose a service type...</em>
              </MenuItem>
              {availableServiceTypes.map((type) => (
                <MenuItem key={type.id} value={type.id} disabled={loading}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <DialogContentText paddingTop="10px" paddingBottom="5px">
          Select a specific service of the selected type:
        </DialogContentText>
        <Stack gap="10px">
          <FormControl className="field" disabled={!serviceType}>
            <Select
              labelId="service-label"
              value={currentService ? currentService.id : ""}
              variant="outlined"
              displayEmpty
              onChange={(e) => onSelectService(String(e.target.value))}
              MenuProps={{ PaperProps: { style: { maxHeight: 400 } } }}
              disabled={loading || availableServices.length === 0}
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <em style={{ color: "rgba(0, 0, 0, 0.38)" }}>
                      Choose a service of the selected type...
                    </em>
                  );
                }
                const selectedService = availableServices.find(
                  (service) => service.id === selected,
                );
                return selectedService ? selectedService.name : "";
              }}
            >
              <MenuItem disabled value="">
                <em>Choose a service of the selected type...</em>
              </MenuItem>
              {availableServices.map((svc) => (
                <MenuItem key={svc.id} value={svc.id} disabled={loading}>
                  {svc.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Service Description */}
          {currentService?.description && (
            <SquaredBox
              dangerouslySetInnerHTML={{ __html: currentService.description }}
              sx={{ mb: 2 }}
            />
          )}
          {/* Dynamic Form for Service Configuration */}
          {currentService && (
            <>
              <Divider sx={{ my: 2 }} />
              <DynamicForm
                service={{
                  ...currentService,
                  selectedColumns: selectedColumnIds,
                }}
                loading={loading}
                onSubmit={onSubmit}
                onCancel={onClose}
              />
            </>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default GroupServiceDialog;
