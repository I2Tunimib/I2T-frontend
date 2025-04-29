import { StatusBadge } from "@components/core";
import deferMounting from "@components/HOC";
import CustomTable from "@components/kit/CustomTable/CustomTable";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  selectAppConfig,
  selectReconciliatorsAsArray,
} from "@store/slices/config/config.selectors";
import {
  BaseMetadata,
  PropertyMetadata,
  Column,
} from "@store/slices/table/interfaces/table";
import {
  selectColumnCellMetadataTableFormat,
  selectColumnsAsSelectOptions,
  selectCurrentCol,
  selectIsViewOnly,
  selectReconcileRequestStatus,
  selectSettings,
} from "@store/slices/table/table.selectors";
import {
  addColumnMetadata,
  deleteColumnMetadata,
  undo,
  updateColumnMetadata,
  updateColumnPropertyMetadata,
  updateUI,
} from "@store/slices/table/table.slice";
import { reconcile } from "@store/slices/table/table.thunk";
import { getCellContext } from "@store/slices/table/utils/table.reconciliation-utils";
import { FC, useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Cell } from "react-table";
import { getCellComponent } from "../MetadataDialog/componentsConfig";
import usePrepareTable from "../MetadataDialog/usePrepareTable";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { SelectColumns } from "@components/core/DynamicForm/formComponents/Select";
import { getPrefixIfAvailable } from "@services/utils/kg-info";

const DeferredTable = deferMounting(CustomTable);

const makeData = (
  rawData: ReturnType<typeof selectColumnCellMetadataTableFormat>
) => {
  if (!rawData) {
    return {
      columns: [],
      data: [],
    };
  }

  const { column, service } = rawData;

  if (!service) {
    return {
      columns: [],
      data: [],
    };
  }

  // const { metaToView } = service;
  const metaToView: {
    [key: string]: {
      label?: string;
      type?: "link" | "subList" | "tag" | "checkBox";
    };
  } = {
    selected: { label: "Selected", type: "checkBox" },
    id: { label: "ID" },
    name: { label: "Name", type: "link" },
    obj: { label: "Obj" /*, type:'link' */ },
    description: { label: "Description" },
    match: { label: "Match", type: "tag" },
  };

  if (!column.metadata || !column.metadata[0].property) {
    return {
      columns: [],
      data: [],
    };
  }

  const { property: metadata } = column.metadata[0];

  /*
  the following snippet is a workaround because Datamodel of Property (API response JSON) is different
  from Entity Datamodel
  COULD HAVE SAME DATAMODEL? IN THIS CASE, IT NEEDS TO MAKE A CHANGE IN THE BACKEND APPLICATION
  */
  const newMetadata = metadata.map((item, index) => {
    if (item.obj !== null && item.obj !== undefined) {
      const [prefix, id] = item.id.split(":");
      const resourceContext = column.context[prefix];
      if (resourceContext) {
        return {
          ...item,
          selected: item.match,
          name: { value: item.name, uri: `${resourceContext.uri}${id}` },
        };
      } else
        return {
          ...item,
          selected: item.match,
          name: { value: item.name, uri: "" },
        };
    }
    return item;
  });

  const columns = Object.keys(metaToView).map((key) => {
    const { label = key, type } = metaToView[key];
    return {
      Header: label,
      accessor: key,
      Cell: (cellValue: Cell<{}>) => getCellComponent(cellValue, type),
    };
  });

  const data = newMetadata
    .map((metadataItem) => {
      //const data = metadata.map((metadataItem) => {
      return Object.keys(metaToView).reduce((acc, key) => {
        const value = metadataItem[key as keyof BaseMetadata];
        if (value !== undefined) {
          acc[key] = value;
        } else {
          acc[key] = null;
        }

        return acc;
      }, {} as Record<string, any>);
    })
    .sort((a, b) => {
      // Sort by selected status first (selected items come first)
      if (a.selected !== b.selected) {
        return a.selected ? -1 : 1;
      }
      // Then sort by alphabetical order of the name
      return a.name.value.localeCompare(b.name.value);
    });

  return {
    columns,
    data,
  };
};

const hasColumnMetadata = (column: Column | undefined) => {
  return !!(
    column &&
    column.metadata.length > 0 &&
    column.metadata[0].property &&
    column.metadata[0].property.length > 0
  );
};

// const getBadgeStatus = (column: Column | undefined) => {
//   if (column) {
//     if (column.metadata[0].entity) {
//       const matching = column.metadata[0].entity.some((meta: BaseMetadata) => meta.match);
//       if (matching) {
//         return 'Success';
//       }
//     }
//   }
//   return 'Warn';
// };

interface NewMetadata {
  id?: string;
  name: string;
  obj: string;
  score: number;
  match: string;
  uri: string;
}
interface PropertyTabProps {
  // function used to pass to the main component the
  // actions to do in order to persist the modifications
  addEdit: Function;
}
const PropertyTab: FC<PropertyTabProps> = ({ addEdit }) => {
  const column = useAppSelector(selectCurrentCol);
  const {
    state,
    setState,
    memoizedState: { columns, data },
  } = usePrepareTable({
    selector: selectColumnCellMetadataTableFormat,
    makeData,
    dependencies: [column],
  });

  const [selectedMetadata, setSelectedMetadata] = useState<string>("");
  const [currentService, setCurrentService] = useState<string>();
  const [undoSteps, setUndoSteps] = useState(0);
  const { API } = useAppSelector(selectAppConfig);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const { loading } = useAppSelector(selectReconcileRequestStatus);
  const settings = useAppSelector(selectSettings);
  const dispatch = useAppDispatch();

  const options = useAppSelector(selectColumnsAsSelectOptions);
  type Item = { id: string; label: string; value: string };
  const [otherColumns, setOtherColumns] = useState<Item[]>([]);

  useEffect(() => {
    // set initial value of select
    if (reconciliators) {
      setCurrentService(reconciliators[0].prefix);
    }
    if (column && options && options.length > 0) {
      setOtherColumns(options.filter((item) => item.id !== column.id));
    }
  }, [reconciliators]);

  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const { handleSubmit, reset, register, control } = useForm<NewMetadata>({
    defaultValues: {
      score: 1,
      match: "false",
    },
  });

  const handleConfirm = (selectedMetadataId: string) => {
    // update global state if confirmed
    if (column) {
      if (
        column.metadata &&
        column.metadata.length > 0 &&
        column.metadata[0].property
      ) {
        const { property } = column.metadata[0];
        const previousMatch = property.find((meta) => meta.match);
        console.log("adding edit");
        addEdit(
          updateColumnPropertyMetadata({
            metadataId: selectedMetadataId,
            colId: column.id,
          }),
          false,
          false
        );
        // dispatch(updateColumnMetadata({ metadataId: selectedMetadata, colId: column.id }));
        // dispatch(updateUI({ openMetadataColumnDialog: false }));
      }
    }
  };

  const handleCancel = () => {
    dispatch(undo(undoSteps));
    dispatch(updateUI({ openMetadataColumnDialog: false }));
  };

  const handleTooltipOpen = () => {
    setShowTooltip(!showAdd);
  };

  const handleTooltipClose = () => {
    setShowTooltip(false);
  };

  const handleShowAdd = () => {
    setShowAdd(!showAdd);
    setShowTooltip(false);
  };

  const handleSelectedRowDelete = useCallback((row: any) => {
    if (row) {
      if (column) {
        if (column.metadata && column.metadata.length > 0) {
          console.log("deleting prop metadata", row);
          if (column.metadata[0].property) {
            deleteColumnMetadata({
              metadataId: row.id,
              colId: column.id,
              type: "property",
            }),
              true;

            // dispatch(deleteColumnMetadata({ metadataId: row.id, colId: column.id, type: 'property' }));
            // setUndoSteps(undoSteps + 1);
          } else if (column.metadata[0].entity) {
            deleteColumnMetadata({
              metadataId: row.id,
              colId: column.id,
              type: "entity",
            }),
              true;

            // dispatch(deleteColumnMetadata({ metadataId: row.id, colId: column.id, type: 'entity' }));
            // setUndoSteps(undoSteps + 1);
          }
          setState((prevState) => ({
            ...prevState,
            data: prevState.data.filter((item: any) => item.id !== row.id),
          }));
        }
      }
    }
  }, []);

  /*
  const handleSelectedRowChange = useCallback((row: any) => {
    if (row) {
      setState(({ columns: colState, data: dataState }) => {
        const newData = dataState.map((item: any) => {
          if (item.id === row.id) {
            const match = !item.match;
            if (match) {
              setSelectedMetadata(row.id);
            } else {
              setSelectedMetadata('');
            }
            return {
              ...item,
              match
            };
          }
          return {
            ...item,
            match: false
          };
        });

        return {
          columns: colState,
          data: newData
        };
      });
    }
  }, []);*/

  const handleSelectedRowChange = useCallback(
    (row: any) => {
      if (!row) return;

      setState(({ columns: colState, data: dataState }) => {
        const newData = dataState
          .map((item: any) => {
            // Inverti `match` solo per la riga con lo stesso `id` della riga selezionata
            if (item.id === row.id) {
              const newMatch = !item.match;
              // Aggiorna `selectedMetadata` in base al nuovo valore di `match`
              setSelectedMetadata(newMatch ? row.id : "");
              console.log("selectedMetadata", newMatch ? row.id : "");
              handleConfirm(row.id);
              return {
                ...item,
                match: newMatch,
                selected: newMatch,
              };
            }

            // Restituisci le altre righe senza modifiche
            return item;
          })
          .sort((a, b) => {
            // Sort by selected status first (selected items come first)
            if (a.selected !== b.selected) {
              return a.selected ? -1 : 1;
            }
            // Then sort by alphabetical order of the name
            return a.name.value.localeCompare(b.name.value);
          });
        return {
          columns: colState,
          data: newData,
        };
      });
    },
    [setState, setSelectedMetadata]
  );

  const fetchMetadata = (service: string) => {
    const reconciliator = reconciliators.find(
      (recon) => recon.prefix === service
    );
    if (reconciliator && column) {
      // dispatch(reconcile({
      //   baseUrl: reconciliator.relativeUrl,
      //   items: [{
      //     id: column.id,
      //     label: column.label
      //   }],
      //   reconciliator,
      //   contextColumns: []
      // }));
    }
  };

  const handleChangeService = (event: SelectChangeEvent<string>) => {
    const newService = event.target.value;
    if (newService) {
      setCurrentService(newService);
      fetchMetadata(newService);
    }
  };

  const onSubmitNewMetadata = (formState: NewMetadata) => {
    if (column) {
      if (
        column.metadata /*&& column.metadata.length > 0 && column.metadata[0].property*/
      ) {
        let prefix = getPrefixIfAvailable(formState.uri, formState.id || "");
        /* const { property } = column.metadata[0];
        const previousMatch = property.find((meta) => meta.match);
        if (!previousMatch || (previousMatch.id !== selectedMetadata)) {*/
        addEdit(
          addColumnMetadata({
            colId: column.id,
            type: "property",
            prefix: prefix,
            value: { ...formState },
          }),
          true
        );
        // dispatch(
        //   addColumnMetadata({
        //     colId: column.id,
        //     type: "property",
        //     prefix: /*getCellContext(column),*/ "None:",
        //     value: { ...formState },
        //   })
        // );
        // setUndoSteps(undoSteps + 1);
        reset();
        setShowAdd(false);
        //}
      }
    }

    /*if (cell) {
      dispatch(addCellMetadata({
        cellId: cell.id,
        prefix: getCellContext(cell),
        value: { ...formState }
      }));
      reset();
      setShowAdd(false);
    }*/
  };

  const { lowerBound } = settings;

  const getBadgeStatus = useCallback(
    (col: Column) => {
      const {
        annotationMeta: { match, highestScore },
      } = col;

      if (match.value) {
        switch (match.reason) {
          case "manual":
            return "match-manual";
          case "reconciliator":
            return "match-reconciliator";
          case "refinement":
            return "match-refinement";
          default:
            return "match-reconciliator";
        }
      }

      const { isScoreLowerBoundEnabled, scoreLowerBound } = lowerBound;

      if (isScoreLowerBoundEnabled) {
        if (scoreLowerBound && highestScore < scoreLowerBound) {
          return "miss";
        }
      }
      return "warn";
    },
    [lowerBound]
  );

  return (
    <>
      <Stack position="sticky" top="0" zIndex={10} bgcolor="#FFF">
        <Stack
          direction="row"
          gap="10px"
          alignItems="center"
          padding="12px 16px"
        >
          <Stack direction="row" alignItems="center" gap={1}>
            {column &&
              column.annotationMeta &&
              column.annotationMeta.annotated && (
                <StatusBadge status={getBadgeStatus(column)} />
              )}
            <Typography variant="h5">{column?.label}</Typography>
            <Typography color="textSecondary">(Cell label)</Typography>
          </Stack>
          {/* <Stack direction="row" marginLeft="auto" gap="10px">
            <Button onClick={handleCancel}>
              {API.ENDPOINTS.SAVE && !isViewOnly ? "Cancel" : "Close"}
            </Button>
            {API.ENDPOINTS.SAVE && !isViewOnly && (
              <Button onClick={handleConfirm} variant="outlined">
                Confirm
              </Button>
            )}
          </Stack> */}
        </Stack>
        <Divider orientation="horizontal" flexItem />
      </Stack>
      <Box paddingLeft="16px" paddingBottom="12px" marginTop="20px">
        {currentService && (
          <FormControl
            sx={{
              maxWidth: "200px",
            }}
            fullWidth
            size="small"
          >
            <InputLabel variant="outlined" htmlFor="uncontrolled-native">
              Reconciliator service
            </InputLabel>
            <Select
              label="Reconciliator service"
              value={currentService}
              onChange={(e) => handleChangeService(e)}
              variant="outlined"
            >
              {reconciliators &&
                reconciliators.map((reconciliator) => (
                  <MenuItem
                    key={reconciliator.prefix}
                    value={reconciliator.prefix}
                  >
                    {reconciliator.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )}
      </Box>
      {
        /*data.length > 0 && */ API.ENDPOINTS.SAVE && !isViewOnly && (
          <Stack
            position="relative"
            direction="row"
            alignItems="center"
            alignSelf="flex-start"
            padding="0px 12px"
          >
            <Tooltip open={showTooltip} title="Add metadata" placement="right">
              <IconButton
                color="primary"
                onMouseLeave={handleTooltipClose}
                onMouseEnter={handleTooltipOpen}
                onClick={handleShowAdd}
              >
                <AddRoundedIcon
                  sx={{
                    transition: "transform 150ms ease-out",
                    transform: showAdd ? "rotate(45deg)" : "rotate(0)",
                  }}
                />
              </IconButton>
            </Tooltip>
            <Box
              sx={{
                position: "absolute",
                left: "100%",
                top: "50%",
                padding: "12px 16px",
                borderRadius: "6px",
                transition: "all 150ms ease-out",
                opacity: showAdd ? 1 : 0,
                transform: showAdd
                  ? "translateY(-50%) translateX(0)"
                  : "translateY(-50%) translateX(-20px)",
              }}
            >
              <Stack
                component="form"
                direction="row"
                gap="10px"
                onSubmit={handleSubmit(onSubmitNewMetadata)}
              >
                <Tooltip
                  title="Enter a complete id, like wd:P937"
                  arrow
                  placement="top"
                >
                  <TextField
                    sx={{ minWidth: "100px" }}
                    size="small"
                    label="Id"
                    variant="outlined"
                    placeholder="wd:"
                    {...register("id")}
                  />
                </Tooltip>
                <Tooltip
                  title="Enter a name, like work location"
                  arrow
                  placement="top"
                >
                  <TextField
                    sx={{ minWidth: "200px" }}
                    size="small"
                    label="Name"
                    variant="outlined"
                    required
                    {...register("name")}
                  />
                </Tooltip>
                <Tooltip
                  title="Select the referenced column"
                  arrow
                  placement="top"
                >
                  <FormControl
                    sx={{
                      maxWidth: "200px",
                    }}
                    fullWidth
                    size="small"
                  >
                    <InputLabel
                      variant="outlined"
                      htmlFor="uncontrolled-native"
                    >
                      Obj
                    </InputLabel>
                    <Select
                      id="obj-select"
                      label="Obj"
                      variant="outlined"
                      sx={{ minWidth: "200px" }}
                      required
                      defaultValue="" // Placeholder iniziale
                      {...register("obj", { required: "Seleziona un valore" })}
                    >
                      <MenuItem disabled value="">
                        <em>Select an option</em>
                      </MenuItem>
                      {otherColumns && otherColumns.length > 0 ? (
                        otherColumns.map((col) => (
                          <MenuItem key={col.id} value={col.value}>
                            {col.label}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No options available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Tooltip>
                <TextField
                  sx={{ minWidth: "200px" }}
                  size="small"
                  label="Uri"
                  required
                  variant="outlined"
                  {...register("uri")}
                />
                <Tooltip
                  title="Enter the score value, from 0.00 to 1.00"
                  arrow
                  placement="top"
                >
                  <TextField
                    sx={{ minWidth: "50px" }}
                    size="small"
                    label="Score"
                    variant="outlined"
                    required
                    type="number"
                    inputProps={{ step: "0.01" }} // Consente 2 decimali
                    {...register("score")}
                  />
                </Tooltip>
                <FormControl size="small" sx={{ width: "200px" }}>
                  <InputLabel>Match</InputLabel>
                  <Controller
                    render={({ field }) => (
                      <Select {...field} labelId="select-match" label="Match">
                        <MenuItem value="true">true</MenuItem>
                        <MenuItem value="false">false</MenuItem>
                      </Select>
                    )}
                    name="match"
                    control={control}
                  />
                </FormControl>
                <Button
                  type="submit"
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          </Stack>
        )
      }
      <DeferredTable
        flexGrow={1}
        stickyHeaderTop="61.5px"
        columns={columns}
        data={data}
        loading={loading}
        onSelectedRowChange={handleSelectedRowChange}
        onSelectedRowDeleteRequest={handleSelectedRowDelete}
        showRadio={!!API.ENDPOINTS.SAVE && !isViewOnly}
      />
    </>
  );
};

export default PropertyTab;
