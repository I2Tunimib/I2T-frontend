import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  Alert,
  //Box,
  //Button,
  //Collapse,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  //ListItemText,
  //ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  //Typography,
} from "@mui/material";
import React, {
  forwardRef,
  Ref,
  ReactElement,
  useState,
  useEffect,
  FC,
} from "react";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import {
  //ExpandLess,
  //ExpandMore,
  //HelpCenterRounded,
  HelpOutlineRounded,
} from "@mui/icons-material";
import {
  selectAreCellReconciliated,
  selectExtendRequestStatus, selectSelectedColumnIdsAsArray,
} from "@store/slices/table/table.selectors";
import { updateUI } from "@store/slices/table/table.slice";
import { selectExtendersAsArray } from "@store/slices/config/config.selectors";
import { Extender } from "@store/slices/config/interfaces/config";
import styled from "@emotion/styled";
import { extend } from "@store/slices/table/table.thunk";
import { useSnackbar } from "notistack";
import { SquaredBox } from "@components/core";
import DynamicExtensionForm from "@components/core/DynamicForm/DynamicForm";

const Transition = forwardRef(
  (
    props: TransitionProps & {
      children: ReactElement<any, any>;
    },
    ref: Ref<unknown>,
  ) => <Slide direction="down" ref={ref} {...props} />,
);

const Content = styled.div({
  display: "flex",
  flexDirection: "column",
  gap: "20px",
});

const DialogInnerContent = () => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [uniqueServices, setUniqueServices] = useState<Extender[]>([]);
  const [currentService, setCurrentService] = useState<Extender>();
  const [groupedServices, setGroupedServices] =
    useState<Map<string, Extender[]>>();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const extensionServices = useAppSelector(selectExtendersAsArray);
  const cellReconciliated = useAppSelector(selectAreCellReconciliated);
  const selectedColumnsArray = useAppSelector(selectSelectedColumnIdsAsArray);
  const { loading } = useAppSelector(selectExtendRequestStatus);

  // Log extension services on mount/update
  React.useEffect(() => {
    console.log("=== Extension Dialog: Available Services ===");
    console.log("Total services:", extensionServices.length);
    const chMatching = extensionServices.find((s) => s.name === "CH Matching");
    if (chMatching) {
      console.log("CH Matching service found:", {
        id: chMatching.id,
        name: chMatching.name,
        skipFiltering: chMatching.skipFiltering,
        allValues: chMatching.allValues,
      });
    } else {
      console.warn("CH Matching service NOT found in extension services!");
    }
  }, [extensionServices]);

  async function groupServices() {
    const groupedServsMap = new Map();
    const uniqueExtensionServices = extensionServices.filter(
      (service, index, self) =>
        index === self.findIndex((s) => s.id === service.id),
    );

    setUniqueServices(uniqueExtensionServices);

    for (const service of uniqueExtensionServices) {
      const currentUri = service.uri ?? "other";
      if (groupedServsMap.has(currentUri)) {
        groupedServsMap.get(currentUri).push(service);
      } else {
        groupedServsMap.set(currentUri, [service]);
      }
    }
    setGroupedServices(groupedServsMap);
  }

  useEffect(() => {
    if (extensionServices) {
      groupServices();
    }
  }, [extensionServices]);

  const handleClose = () => {
    // Reset selected service when dialog is closed
    setCurrentService(undefined);
    dispatch(
      updateUI({
        openExtensionDialog: false,
      }),
    );
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    const val = extensionServices.find(
      (service) => service.id === event.target.value,
    );
    if (val) {
      console.log("=== Extension Dialog: Service Selected ===");
      console.log("Service:", val.name);
      console.log("skipFiltering:", val.skipFiltering);
      console.log("allValues:", val.allValues);
      console.log("Full config:", val);
      setCurrentService(val);
    }
  };

  const handleSubmit = (formState: Record<string, any>, reset?: Function) => {
    if (currentService) {
      console.log("=== Extension Dialog: Submitting Extension Request ===");
      console.log("Service:", currentService.name);
      console.log("skipFiltering:", currentService.skipFiltering);
      console.log("allValues:", currentService.allValues);
      console.log("Form values:", formState);

      const req = dispatch(
        extend({
          extender: currentService,
          formValues: formState,
        }),
      );
      // expose the dispatched request on window so the parent dialog close handler
      // can abort it if needed (keeps the change local to the client)
      (window as any).__extensionRequest = req;
      req
        .unwrap()
        .then(({ data }) => {
          if (reset) reset();
          setCurrentService(undefined);
          dispatch(updateUI({ openExtensionDialog: false }));
          const nColumns = Object.keys(data.columns).length;
          const infoText = `${nColumns} ${
            nColumns > 1 ? "columns" : "column"
          } added`;
          enqueueSnackbar(infoText, {
            autoHideDuration: 3000,
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "center",
            },
          });
        })
        .finally(() => {
          // clear the global reference if it's still pointing to this request
          if ((window as any).__extensionRequest === req) {
            (window as any).__extensionRequest = null;
          }
        });
    }
  };
  const toggleGroup = (uri: string) => {
    setExpandedGroup((prev) => (prev === uri ? null : uri));
  };
  const handleHeaderClick = (e: React.MouseEvent, uri: string) => {
    e.stopPropagation(); // Prevent the Select from closing
    setExpandedGroup((prev) => (prev === uri ? null : uri));
  };

  const serviceWithDescription = React.useMemo(() => {
    if (!currentService) return undefined;
    const colsText = selectedColumnsArray.length ? selectedColumnsArray.join(", ") : "None";
    return {
      ...currentService,
      description: `${currentService.description || ""} ${currentService.name === "COFOG Classifier"
        ? "<b>Input selected column(s):</b>"
        : "<br/><br/><b>Input selected column(s):</b>"
      } ${colsText}`,
    };
  }, [currentService, selectedColumnsArray]);
  return (
    <>
      <FormControl className="field">
        <Select
          value={currentService ? currentService.id : ""}
          onChange={handleChange}
          variant="outlined"
          displayEmpty
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: "400px",
              },
            },
          }}
          renderValue={(selected) => {
            if (!selected) {
              return (
                <em style={{ color: "rgba(0, 0, 0, 0.38)" }}>
                  Choose an extension service...
                </em>
              );
            }
            const selectedService = extensionServices.find(
              (service) => service.id === selected,
            );
            return selectedService ? selectedService.name : "";
          }}
        >
          <MenuItem disabled value="">
            <em>Choose an extension service...</em>
          </MenuItem>
          {uniqueServices.map((extender) => (
            <MenuItem
              key={extender.id}
              value={extender.id}
              sx={{ pl: 4 }}
              onClick={() => setCurrentService(extender)}
            >
              {extender.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {currentService && (
        <>
          <SquaredBox
            dangerouslySetInnerHTML={{ __html: serviceWithDescription.description }}
          />
          {!cellReconciliated && !currentService.skipFiltering && (
            <Alert severity="warning">
              The selected column does not have reconciliated cells, the result
              of the extension will be
              <b> null</b>
            </Alert>
          )}
          {!cellReconciliated && currentService.skipFiltering && (
            <Alert severity="info">
              This service will process all rows, using the content of each cell
              during the process. Non-matched rows will be sent with empty
              knowledge base identifiers.
            </Alert>
          )}
          {cellReconciliated && currentService.skipFiltering && (
            <Alert severity="info">
              This service will process all rows, using the content of each cell
              during the process. Non-matched rows will be sent with empty
              knowledge base identifiers.
            </Alert>
          )}
          <Divider />
          <DynamicExtensionForm
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={() => {
              // abort any in-flight extension request when user cancels the modal form
              if (
                (window as any).__extensionRequest &&
                (window as any).__extensionRequest.abort
              ) {
                (window as any).__extensionRequest.abort();
                (window as any).__extensionRequest = null;
              }
              handleClose();
            }}
            service={{ ...serviceWithDescription, selectedColumns: selectedColumnsArray }}
          />
        </>
      )}
    </>
  );
};

export type ExtensionDialogProps = {
  open: boolean;
  handleClose: () => void;
};

const ExtensionDialog: FC<ExtensionDialogProps> = ({ open, handleClose }) => {
  const dispatch = useAppDispatch();

  const handleDialogClose = () => {
    // abort any in-flight extension request when dialog is closed
    if (
      (window as any).__extensionRequest &&
      (window as any).__extensionRequest.abort
    ) {
      (window as any).__extensionRequest.abort();
      (window as any).__extensionRequest = null;
    }
    handleClose();
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      onClose={handleDialogClose}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <DialogTitle>Extension</DialogTitle>

        <IconButton
          sx={{
            color: "rgba(0, 0, 0, 0.54)",
            marginRight: "20px",
          }}
          onClick={() => {
            dispatch(updateUI({ openHelpDialog: true, helpStart: "tutorial", tutorialStep: 18 }));
          }}
        >
          <HelpOutlineRounded />
        </IconButton>
      </Stack>
      <DialogContent>
        <Stack direction="row" alignItems="center">
          <DialogContentText>Select an extension service:</DialogContentText>
          <IconButton
            size="small"
            onClick={() => {
              dispatch(updateUI({ openHelpDialog: true, helpStart: "ext" }));
            }}
          >
            <HelpOutlineRounded />
          </IconButton>
        </Stack>
        <Content>
          <DialogInnerContent />
        </Content>
      </DialogContent>
    </Dialog>
  );
};

export default ExtensionDialog;
