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
import { selectModifyRequestStatus, selectSelectedColumnIdsAsArray } from "@store/slices/table/table.selectors";
import { updateUI } from "@store/slices/table/table.slice";
import { selectModifiersAsArray } from "@store/slices/config/config.selectors";
import { Modifier } from "@store/slices/config/interfaces/config";
import styled from "@emotion/styled";
import { modify } from "@store/slices/table/table.thunk";
import { useSnackbar } from "notistack";
import { SquaredBox } from "@components/core";
import DynamicModificationForm from "@components/core/DynamicForm/DynamicForm";
import { dateFormatterUtils } from "@services/utils/date-formatter-utils";
import { RootState } from "@store";

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
  const [groupedServices, setGroupedServices] = useState<Map<string, Modifier[]>>();
  const [currentService, setCurrentService] = useState<Modifier>();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const modificationServices = useAppSelector(selectModifiersAsArray);
  const { loading, error } = useAppSelector(selectModifyRequestStatus);
  const selectedColumnsArray = useAppSelector(selectSelectedColumnIdsAsArray);
  const [joinColumns, setJoinColumns] = useState(false);
  const rows = useAppSelector((state: RootState) => state.table.entities.rows);

  const sampledValues = React.useMemo(() => {
    if (!rows || selectedColumnsArray.length === 0) return [];
    const values: string[] = [];

    selectedColumnsArray.forEach((colId) => {
      const rowId = rows.allIds[0];
      const cell = rows.byId[rowId].cells[colId];
      if (cell?.label != null) {
        values.push(String(cell.label).trim());
      }
    });

    return values;
  }, [rows, selectedColumnsArray]);

  const serviceWithColumnType = React.useMemo(() => {
    if (!currentService) return undefined;
    return {
      ...currentService,
      columnType: dateFormatterUtils(sampledValues),
    };
  }, [currentService, sampledValues]);

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
      const payload = {
        ...formState,
        joinColumns: formState.joinColumns ?? false,
        selectedColumns: selectedColumnsArray,
      };
      console.log("payload", payload);
      const { data } = await dispatch(
        modify({
          modifier: currentService,
          formValues: payload,
        })
      ).unwrap();
      if (reset) reset();
      setCurrentService(undefined);
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
  const serviceWithDescription = React.useMemo(() => {
    if (!currentService) return undefined;
    const colsText = selectedColumnsArray.length ? selectedColumnsArray.join(", ") : "None";
    return {
      ...currentService,
      description: `${currentService.description || ""}<br><br><b>Input selected column(s):</b> ${colsText}`,
      joinColumns,
    };
  }, [currentService, selectedColumnsArray, joinColumns]);
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
      {serviceWithDescription && (
        <>
          <SquaredBox dangerouslySetInnerHTML={{ __html: serviceWithDescription.description }} />
          {error && <Typography color="error">{error.message}</Typography>}
          <Divider />
          <DynamicModificationForm
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={handleClose}
            service={{ ...serviceWithDescription, ...serviceWithColumnType, selectedColumns: selectedColumnsArray }}
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
            dispatch(updateUI({ openHelpDialog: true, helpStart: "tutorial", tutorialStep: 10 }));
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
