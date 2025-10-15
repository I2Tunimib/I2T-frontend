import React, { forwardRef, Ref, ReactElement, useState, useEffect, FC } from "react";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Slide,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { HelpOutlineRounded } from "@mui/icons-material";
import { selectModifyRequestStatus } from "@store/slices/table/table.selectors";
import { updateUI } from "@store/slices/table/table.slice";
import { selectModifiersAsArray } from "@store/slices/config/config.selectors";
import { Modifier } from "@store/slices/config/interfaces/config";
import styled from "@emotion/styled";
import { modify } from "@store/slices/table/table.thunk";
import { useSnackbar } from "notistack";
import { SquaredBox } from "@components/core";
import DynamicModificationForm from "@components/core/DynamicForm/DynamicForm";

const Transition = forwardRef(
  (
    props: TransitionProps & { children?: ReactElement<any, any> },
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
  const [uniqueServices, setUniqueServices] = useState<Modifier[]>([]);
  const [currentService, setCurrentService] = useState<Modifier>();
  const [groupedServices, setGroupedServices] =
    useState<Map<string, Modifier[]>>();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const modificationServices = useAppSelector(selectModifiersAsArray);
  const { loading, error } = useAppSelector(selectModifyRequestStatus);

  async function groupServices() {
    const groupedServsMap = new Map();
    const uniqueModificationServices = modificationServices.filter(
      (service, index, self) => index === self.findIndex((s) => s.id === service.id)
    );

    setUniqueServices(uniqueModificationServices);

    for (const service of uniqueModificationServices) {
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
    if (modificationServices) {
      groupServices();
    }
  }, [modificationServices]);

  const handleClose = () => {
    // Reset selected service when dialog is closed
    setCurrentService(undefined);
    dispatch(
      updateUI({
        openModificationDialog: false,
      }),
    );
  };

  const handleChange = (event: SelectChangeEvent<string>) => {
    const val = modificationServices.find(
      (service) => service.id === event.target.value,
    );
    if (val) {
      console.log("current service", val);
      setCurrentService(val);
    }
  };

  const handleSubmit = async (formState: Record<string, any>, reset?: Function) => {
    if (!currentService) return;
    try {
      const { data } = await dispatch(
          modify({
            modifier: currentService,
            formValues: formState,
          })
      ).unwrap();
      if (reset) reset();
      setCurrentService(undefined);
      dispatch(updateUI({ openModificationDialog: false }));
      const nColumns = Object.keys(data.columns).length;
      const infoText = `${nColumns} ${nColumns > 1 ? "columns" : "column"} added`;
      enqueueSnackbar(infoText, {
        autoHideDuration: 3000,
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
      });
      return data;
    } catch (err: any) {
      enqueueSnackbar(err.message || "An error occurred while formatting dates.", {
        variant: "error",
        autoHideDuration: 4000,
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
      });
      throw err;
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
          value={currentService ? currentService.id : ""}
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
            const selectedService = modificationServices.find(
              (service) => service.id === selected,
            );
            return selectedService ? selectedService.name : "";
          }}
        >
          {uniqueServices.map((modifier) => (
            <MenuItem
              key={modifier.id}
              value={modifier.id}
              sx={{ pl: 4 }}
              onClick={() => handleChange({ target: { value: modifier.id } })}
            >
              {modifier.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {currentService && (
        <>
          <SquaredBox
            dangerouslySetInnerHTML={{ __html: currentService.description }}
          />
          {error && <Typography color="error">{error.message}</Typography>}
          <Divider />
          <DynamicModificationForm
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

export type ModifyDialogProps = {
  open: boolean;
  handleClose: () => void;
};

const ModifyDialog: FC<ModifyDialogProps> = ({ open, handleClose }) => {
  const dispatch = useAppDispatch();

  return (
    <Dialog open={open} TransitionComponent={Transition} onClose={handleClose}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <DialogTitle>Modify</DialogTitle>
        <IconButton
          sx={{
            color: "rgba(0, 0, 0, 0.54)",
            marginRight: "20px",
          }}
          onClick={() => {
            dispatch(updateUI({ openHelpDialog: true, tutorialStep: 15 }));
          }}
        >
          <HelpOutlineRounded />
        </IconButton>
      </Stack>
      <DialogContent>
        <DialogContentText paddingBottom="10px">
          Select a transformation function to modify with:
        </DialogContentText>
        <Content>
          <DialogInnerContent />
        </Content>
      </DialogContent>
    </Dialog>
  );
};

export default ModifyDialog;
