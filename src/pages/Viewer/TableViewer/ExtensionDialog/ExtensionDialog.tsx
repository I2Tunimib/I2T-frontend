import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  Alert,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
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
  ExpandLess,
  ExpandMore,
  HelpCenterRounded,
  HelpOutlineRounded,
} from "@mui/icons-material";
import {
  selectAreCellReconciliated,
  selectExtendRequestStatus,
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
    ref: Ref<unknown>
  ) => <Slide direction="down" ref={ref} {...props} />
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
  const { loading } = useAppSelector(selectExtendRequestStatus);

  async function groupServices() {
    const groupedServsMap = new Map();
    const uniqueExtensionServices = extensionServices.filter(
      (service, index, self) =>
        index === self.findIndex((s) => s.id === service.id)
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
      })
    );
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    const val = extensionServices.find(
      (service) => service.id === event.target.value
    );
    if (val) {
      console.log("current service", val);
      setCurrentService(val);
    }
  };

  const handleSubmit = (formState: Record<string, any>, reset?: Function) => {
    if (currentService) {
      dispatch(
        extend({
          extender: currentService,
          formValues: formState,
        })
      )
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
              (service) => service.id === selected
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
            dangerouslySetInnerHTML={{ __html: currentService.description }}
          />
          {!cellReconciliated && (
            <Alert severity="warning">
              The selected column does not have reconciliated cells, the result
              of the extension will be
              <b> null</b>
            </Alert>
          )}
          <Divider />
          <DynamicExtensionForm
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            service={currentService}
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

  return (
    <Dialog open={open} TransitionComponent={Transition} onClose={handleClose}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <DialogTitle>Extension</DialogTitle>

        <IconButton
          sx={{
            color: "rgba(0, 0, 0, 0.54)",
            marginRight: "20px",
          }}
          onClick={() => {
            dispatch(updateUI({ openHelpDialog: true, tutorialStep: 10 }));
          }}
        >
          <HelpOutlineRounded />
        </IconButton>
      </Stack>
      <DialogContent>
        <DialogContentText paddingBottom="10px">
          Select an extension service:
        </DialogContentText>
        <Content>
          <DialogInnerContent />
        </Content>
      </DialogContent>
    </Dialog>
  );
};

export default ExtensionDialog;
