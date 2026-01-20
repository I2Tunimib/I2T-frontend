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
import { Cell } from "@tanstack/react-table";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { SelectColumns } from "@components/core/DynamicForm/formComponents/Select";
import { KG_INFO, fetchTypeAndDescription } from "@services/utils/kg-info";
import { Property } from "@store/slices/table";
import { getCellComponent } from "../MetadataDialog/componentsConfig";
import usePrepareTable from "../MetadataDialog/usePrepareTable";
import AddMetadataForm from "./AddMetadataForm";

const DeferredTable = deferMounting(CustomTable);

const makeData = (column: Column | undefined) => {
  if (!column) {
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

  if (!column.metadata || !column.metadata[0] || !column.metadata[0].property) {
    return {
      columns: [],
      data: [],
    };
  }

  const { property: metadata } = column.metadata[0];
  console.log("column data", column);
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
          description: item.description || "",
        };
      } else {
        return {
          ...item,
          selected: item.match,
          name: { value: item.name, uri: "" },
          description: item.description || "",
        };
      }
    }
    return item;
  });

  const columns = Object.keys(metaToView).map((key) => {
    const { label = key, type } = metaToView[key];
    return {
      header: label,
      accessorKey: key,
      cell: (cellValue: Cell<{}>) => getCellComponent(cellValue, type),
    };
  });

  const data = newMetadata
    .map((metadataItem) => {
      //const data = metadata.map((metadataItem) => {
      return Object.keys(metaToView).reduce(
        (acc, key) => {
          const value = metadataItem[key as keyof BaseMetadata];
          if (value !== undefined) {
            acc[key] = value;
          } else {
            acc[key] = null;
          }

          return acc;
        },
        {} as Record<string, any>,
      );
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
  description: string;
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
    selector: selectCurrentCol,
    makeData,
    dependencies: [column],
  });

  const [selectedMetadata, setSelectedMetadata] = useState<string>("");
  const [undoSteps, setUndoSteps] = useState(0);
  const { API } = useAppSelector(selectAppConfig);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const { loading } = useAppSelector(selectReconcileRequestStatus);
  const settings = useAppSelector(selectSettings);
  const dispatch = useAppDispatch();
  const currentService =
    column?.metadata?.[0]?.property?.[0]?.id?.split(":")?.[0] || "";

  const options = useAppSelector(selectColumnsAsSelectOptions);
  const currentColumnId = column?.id;
  const otherColumns = options.filter((opt) => opt.value !== currentColumnId);
  type Item = { id: string; label: string; value: string };

  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const hasColumnClassifier = !!column?.kind && !!column?.nerClassification;
  const getPropertyInfo = (kind?: string, nerClassification?: string) => {
    const baseUrl = "https://www.wikidata.org/wiki/Special:ListProperties";

    if (kind === "entity") {
      return {
        url: `${baseUrl}/wikibase-item`,
        label: "Items",
      };
    }
    if (kind === "literal") {
      switch (nerClassification) {
        case "DATE":
          return {
            url: `${baseUrl}/time`,
            label: "Point in time",
          };
        case "NUMBER":
          return {
            url: `${baseUrl}/quantity`,
            label: "Quantity",
          };
        case "STRING":
          return {
            url: `${baseUrl}/string`,
            label: "String",
          };
        default:
          return {
            url: baseUrl,
            label: "Wikidata",
          };
      }
    }
    return {
      url: baseUrl,
      label: "Wikidata",
    };
  };
  const propertyInfo = getPropertyInfo(column?.kind, column?.nerClassification);

  const { handleSubmit, reset, register, control } = useForm<NewMetadata>({
    defaultValues: {
      score: 1.0,
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
          false,
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
            (deleteColumnMetadata({
              metadataId: row.id,
              colId: column.id,
              type: "property",
            }),
              true);

            // dispatch(deleteColumnMetadata({ metadataId: row.id, colId: column.id, type: 'property' }));
            // setUndoSteps(undoSteps + 1);
          } else if (column.metadata[0].entity) {
            (deleteColumnMetadata({
              metadataId: row.id,
              colId: column.id,
              type: "entity",
            }),
              true);

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
    [setState, setSelectedMetadata],
  );

  const fetchMetadata = (service: string) => {
    const reconciliator = reconciliators.find(
      (recon) => recon.prefix === service,
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

  const onSubmitNewMetadata = async (formState: Property) => {
    if (!column) return;
    if (column.metadata) {
      const { prefix } = formState;
      let idFromUri = "";
      try {
        const url = new URL(formState.uri);
        console.log("url", url);
        if (prefix.startsWith("wd")) {
          // es. https://www.wikidata.org/wiki/Property:P286
          idFromUri = url.pathname.split("/").pop().split(":")[1];
        }
      } catch (err) {
        console.log("Invalid URI, fallback to id", err);
      }

      let description = "";
      try {
        const result = await fetchTypeAndDescription(
          prefix.replace(/:$/, ""),
          idFromUri,
          formState.name,
        );
        description = result.description || "";
      } catch (err) {
        console.error("Error fetching metadata info:", err);
      }

      dispatch(
        addColumnMetadata({
          colId: column.id,
          type: "property",
          prefix,
          value: { ...formState, id: `${prefix}:${idFromUri}`, description },
        }),
        true,
      );
      reset();
      setShowAdd(false);
    }
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
    [lowerBound],
  );

  const servicesByPrefix = reconciliators.reduce<Record<string, any>>(
    (acc, service) => {
      acc[service.prefix] = service;
      return acc;
    },
    {},
  );

  const handleListPropsInService = () => {
    if (!currentService) return;

    const serviceInfo = servicesByPrefix[currentService];
    if (!serviceInfo?.listProps) return;

    const url = serviceInfo.listProps;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {
        /*data.length > 0 && */ API.ENDPOINTS.SAVE && !isViewOnly && (
          <Stack
            position="relative"
            direction="column"
            alignItems="flex-start"
            flexWrap="wrap"
            padding="0px 16px"
            gap={1}
          >
            <Stack direction="row" gap={1} alignItems="center">
              {column.kind !== "literal" && (
                <Tooltip
                  open={showTooltip}
                  title="Add property"
                  placement="right"
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    onMouseLeave={handleTooltipClose}
                    onMouseEnter={handleTooltipOpen}
                    onClick={handleShowAdd}
                    sx={{
                      textTransform: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    Add column property
                    <AddRoundedIcon
                      sx={{
                        transition: "transform 150ms ease-out",
                        transform: showAdd ? "rotate(45deg)" : "rotate(0)",
                      }}
                    />
                  </Button>
                </Tooltip>
              )}
              {(column.kind === "literal" || showAdd) && (
                <>
                  {!!currentService &&
                  servicesByPrefix[currentService]?.listProps ? (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleListPropsInService}
                      sx={{ textTransform: "none" }}
                    >
                      View list of {KG_INFO[currentService].groupName}{" "}
                      properties
                    </Button>
                  ) : (
                    <Tooltip
                      title={
                        hasColumnClassifier
                          ? `List filtered using the Column Classifier schema annotation result (Kind: ${column?.kind}
                        - Classification: ${column?.nerClassification}).`
                          : ""
                      }
                      placement="right"
                      arrow
                    >
                      <span>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() =>
                            window.open(
                              propertyInfo.url,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                          sx={{ textTransform: "none" }}
                        >
                          View list of Wikidata properties
                          {hasColumnClassifier
                            ? ` for ${propertyInfo.label}`
                            : ""}
                        </Button>
                      </span>
                    </Tooltip>
                  )}
                </>
              )}
            </Stack>
            {showAdd && (
              <Box sx={{ width: "100%", paddingTop: "8px" }}>
                <AddMetadataForm
                  currentService={currentService}
                  onSubmit={onSubmitNewMetadata}
                  otherColumns={otherColumns || []}
                  context="propertyTab"
                />
              </Box>
            )}
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
