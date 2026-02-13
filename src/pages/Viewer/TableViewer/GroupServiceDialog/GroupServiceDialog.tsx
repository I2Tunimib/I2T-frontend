import React, { FC, useEffect, useRef, useState, useMemo } from "react";
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
        reconciliators: [],
        extenders: [],
        modifiers: [],
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
    if (groupedServicesByType.reconciliators.length > 0) {
      types.push({ id: "reconciliator", label: "Reconcilers" });
    }
    if (groupedServicesByType.extenders.length > 0) {
      types.push({ id: "extender", label: "Extenders" });
    }
    if (groupedServicesByType.modifiers.length > 0) {
      types.push({ id: "modifier", label: "Modifiers" });
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
      open={open}
      onClose={onClose}
      className="default-dialog"
      fullWidth
      maxWidth="md"
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, pt: 1 }}
      >
        <DialogTitle sx={{ m: 0, p: 0 }}>
          {`Services - ${groupName || "Group"}`}
        </DialogTitle>
        <IconButton onClick={onClose} size="large">
          <span style={{ fontSize: 18, opacity: 0.6 }}>✕</span>
        </IconButton>
      </Stack>

      <DialogContent dividers>
        <DialogContentText sx={{ mb: 2 }}>
          Choose the type of service from this group:
        </DialogContentText>

        {/* Step 1: Select Service Type (filtered by group) */}
        <FormControl
          fullWidth
          variant="outlined"
          className="field"
          sx={{ mb: 2 }}
        >
          <InputLabel id="service-type-label">Service Type</InputLabel>
          <Select
            labelId="service-type-label"
            value={serviceType}
            label="Service Type"
            onChange={handleServiceTypeChange}
            disabled={loading || availableServiceTypes.length === 0}
          >
            <MenuItem value="">
              <em>Choose a service type...</em>
            </MenuItem>
            {availableServiceTypes.map((type) => (
              <MenuItem key={type.id} value={type.id} disabled={loading}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Step 2: Select Specific Service */}
        {serviceType && (
          <>
            <DialogContentText sx={{ mb: 2 }}>
              Select a specific service:
            </DialogContentText>
            <FormControl
              fullWidth
              variant="outlined"
              className="field"
              sx={{ mb: 2 }}
            >
              <InputLabel id="service-label">Service</InputLabel>
              <Select
                labelId="service-label"
                value={currentService ? currentService.id : ""}
                label="Service"
                onChange={(e) => onSelectService(String(e.target.value))}
                MenuProps={{ PaperProps: { style: { maxHeight: 400 } } }}
                disabled={loading || availableServices.length === 0}
              >
                <MenuItem value="">
                  <em>Choose a service...</em>
                </MenuItem>
                {availableServices.map((svc) => (
                  <MenuItem key={svc.id} value={svc.id} disabled={loading}>
                    {svc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}

        {/* Service Description */}
        {currentService?.description && (
          <SquaredBox
            dangerouslySetInnerHTML={{ __html: currentService.description }}
            sx={{ mb: 2 }}
          />
        )}

        {/* Dynamic Form for Service Configuration */}
        {currentService ? (
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
        ) : serviceType ? (
          <div style={{ marginTop: 8, color: "rgba(0,0,0,0.6)" }}>
            No service selected. Choose one from the dropdown to configure and
            run it.
          </div>
        ) : availableServiceTypes.length === 0 ? (
          <div style={{ marginTop: 8, color: "rgba(0,0,0,0.6)" }}>
            No services available in this group.
          </div>
        ) : (
          <div style={{ marginTop: 8, color: "rgba(0,0,0,0.6)" }}>
            Select a service type to begin.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GroupServiceDialog;
