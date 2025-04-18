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
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
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
import { ExpandLess, ExpandMore } from "@mui/icons-material";
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
    props: TransitionProps & { children?: ReactElement<any, any> },
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
    for (const service of extensionServices) {
      const currentUri = service.uri ?? "other";
      if (groupedServsMap.has(currentUri)) {
        groupedServsMap.get(currentUri).push(service);
      } else {
        groupedServsMap.set(currentUri, [service]);
      }
    }
    setGroupedServices(groupedServsMap);
  }

  const handleClose = () => {
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

  const handleSubmit = (formState: Record<string, any>) => {
    if (currentService) {
      dispatch(
        extend({
          extender: currentService,
          formValues: formState,
        })
      )
        .unwrap()
        .then(({ data }) => {
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
  const handleHeaderClick = (e, uri) => {
    e.stopPropagation(); // Prevent the Select from closing
    setExpandedGroup((prev) => (prev === uri ? null : uri));
  };
  return (
    <>
      <FormControl className="field">
        <Select
          value={currentService ? currentService.id : undefined}
          onChange={handleChange}
          variant="outlined"
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: "400px",
              },
            },
          }}
          renderValue={(selected) => {
            const selectedService = extensionServices.find(
              (service) => service.id === selected
            );
            return selectedService ? selectedService.name : "";
          }}
        >
          {extensionServices.map((extender) => (
            <MenuItem
              key={extender.id}
              value={extender.id}
              sx={{ pl: 4 }}
              onClick={() => handleChange({ target: { value: extender.id } })}
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
  return (
    <Dialog open={open} TransitionComponent={Transition} onClose={handleClose}>
      <DialogTitle>Extension</DialogTitle>
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
