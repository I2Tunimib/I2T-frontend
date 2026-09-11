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
  updateColumnRole,
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
import { extractIdFromUri, resolveURI } from "@services/utils/uri-utils";
import { useSnackbar } from "notistack";
import { getCellComponent } from "../MetadataDialog/componentsConfig";
import usePrepareTable from "../MetadataDialog/usePrepareTable";
import AddMetadataForm from "./AddMetadataForm";

const DeferredTable = deferMounting(CustomTable);

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
  subj: string;
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
  setCurrentRole: (role: string) => void;
  currentKind: string;
  currentDatatype: string;
}
const PropertyTab: FC<PropertyTabProps> = ({ addEdit, setCurrentRole, currentKind, currentDatatype }) => {
  const column = useAppSelector(selectCurrentCol);
  const allRowIds = useAppSelector((state: any) => state.table.entities.rows.allIds || []);
  const effectiveKind = currentKind || column?.kind || "none";
  const effectiveDatatype = currentDatatype || column?.datatype || "none";
  const currentColumnId = column?.id;
  const isLiteral = effectiveKind === "literal";
  const existingProperties = column?.metadata?.[0]?.property || [];

  const [selectedMetadata, setSelectedMetadata] = useState<string>("");
  const [localProperties, setLocalProperties] = useState<any[]>(existingProperties);
  const [undoSteps, setUndoSteps] = useState(0);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const { API } = useAppSelector(selectAppConfig);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const { loading } = useAppSelector(selectReconcileRequestStatus);
  const settings = useAppSelector(selectSettings);
  const options = useAppSelector(selectColumnsAsSelectOptions);
  const dispatch = useAppDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const currentService = column?.metadata?.[0]?.property?.[0]?.id?.split(":")?.[0] || "";
  const otherColumns = options.filter((opt: any) => opt.value !== currentColumnId && (!isLiteral || opt.kind === "entity"));
  const currentColumnOptions = options.find((opt: any) => opt.value === currentColumnId);
  const currentColumnKind = currentColumnOptions?.kind || "";

  useEffect(() => {
    setLocalProperties(existingProperties);
  }, [column]);

  const makeData = (column: Column | undefined, isLiteral: boolean, currentLocalProps: any[]) => {
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
        type?: "link" | "subList" | "tag" | "deciderTag" | "checkBox";
      };
    } = {
      selected: { label: "Selected", type: "checkBox" },
      id: { label: "ID" },
      name: { label: "Name", type: "link" },
      obj: { label: "Obj" /*, type:'link' */ },
      description: { label: "Description" },
      match: { label: "Match", type: "tag" },
      decider: { label: "Decider", type: "deciderTag" },
    };

    if (currentLocalProps.length === 0) {
      return {
        columns: [],
        data: [],
      };
    }

    const metadata = currentLocalProps;
    console.log("column data", column);
    /*
    the following snippet is a workaround because Datamodel of Property (API response JSON) is different
    from Entity Datamodel
    COULD HAVE SAME DATAMODEL? IN THIS CASE, IT NEEDS TO MAKE A CHANGE IN THE BACKEND APPLICATION
    */
    const newMetadata = metadata.map((item, index) => {
      if (item.obj !== null && item.obj !== undefined) {
        const nameValue = item.name && typeof item.name === "object"
          ? (item.name as any).value
          : item.name;

        let finalUri = "";
        if (item.name && typeof item.name === "object" && (item.name as any).uri) {
          finalUri = (item.name as any).uri;
        } else if (item.uri) {
          finalUri = item.uri;
        } else {
          const [prefix, id] = item.id.split(":");
          const resourceContext = column.context[prefix];
          if (resourceContext) {
            finalUri = `${resourceContext.uri}${id}`;
          }
        }
        return {
          ...item,
          selected: item.match,
          name: { value: nameValue || "", uri: finalUri },
          description: item.description || "",
          decider: item.decider !== undefined ? item.decider : "machine",
        };
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

  const {
    state,
    setState,
    memoizedState: { columns, data },
  } = usePrepareTable({
    selector: selectCurrentCol,
    makeData: (col) => makeData(col, isLiteral, localProperties),
    dependencies: [column, localProperties],
  });

  const hasColumnClassifier = !!effectiveKind && !!effectiveDatatype;
  const getPropertyInfo = (kind?: string, datatype?: string, service: string) => {
    const baseUrlWiki = "https://www.wikidata.org/wiki/Special:ListProperties";
    const baseUrlSchema = KG_INFO["schema"].uri;

    let wiki = { url: baseUrlWiki, label: "Wikidata" };
    let schemaOptions: Array<{ url: string; label: string }> = [
      { url: `${baseUrlSchema}/docs/full.html`, label: "Schema.org" }
    ];

    if (kind === "entity") {
      wiki = { url: `${baseUrlWiki}/wikibase-item`, label: "Items" };

      switch (datatype?.toUpperCase()) {
        case "PERSON":
          schemaOptions = [{ url: `${baseUrlSchema}Person`, label: "Person" }];
          break;
        case "ORGANIZATION":
          schemaOptions = [{ url: `${baseUrlSchema}Organization`, label: "Organization" }];
          break;
        case "PLACE":
          schemaOptions = [{ url: `${baseUrlSchema}Place`, label: "Place" }];
          break;
        case "EVENT":
          schemaOptions = [{ url: `${baseUrlSchema}Event`, label: "Event" }];
          break;
        default:
          schemaOptions = [{ url: `${baseUrlSchema}Thing`, label: "Thing" }];
          break;
      }
    } else if (kind === "literal") {
      switch (datatype?.toUpperCase()) {
        case "DATE":
          wiki = { url: `${baseUrlWiki}/time`, label: "Point in time" };
          schemaOptions = [
            { url: `${baseUrlSchema}Date`, label: "Date" },
            { url: `${baseUrlSchema}DateTime`, label: "DateTime" },
            { url: `${baseUrlSchema}Time`, label: "Time" }
          ];
          break;
        case "NUMBER":
          wiki = { url: `${baseUrlWiki}/quantity`, label: "Quantity" };
          schemaOptions = [
            { url: `${baseUrlSchema}Number`, label: "Number" },
            { url: `${baseUrlSchema}Quantity`, label: "Quantity" }
          ];
          break;
        case "STRING":
          wiki = { url: `${baseUrlWiki}/string`, label: "String" };
          schemaOptions = [{ url: `${baseUrlSchema}Text`, label: "Text" }];
          break;
        default:
          wiki = { url: baseUrlWiki, label: "Items" };
          schemaOptions = [{ url: `${baseUrlSchema}DataType`, label: "DataType" }];
          break;
      }
    }

    return { wiki, schemaOptions };
  };

  const { wiki: wikiInfo, schemaOptions } = getPropertyInfo(effectiveKind, effectiveDatatype);

  const { handleSubmit, reset, register, control } = useForm<NewMetadata>({
    defaultValues: {
      score: 1.0,
      match: "false",
    },
  });

  const handleConfirm = (selectedMetadataId: string, selectedMetadataObj: string) => {
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
            obj: selectedMetadataObj,
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
    if (row && column) {
      if (column.metadata && column.metadata.length > 0) {
        console.log("deleting prop metadata", row);
        setLocalProperties((prev) => prev.filter((item) => !(item.id === row.id && item.obj === row.obj)));
        const deleteAction = deleteColumnMetadata({
          metadataId: row.id,
          colId: column.id,
          obj: row.obj,
          type: "property",
        });

        addEdit(deleteAction, true, false);
        if (localProperties.length <= 1) {
          setCurrentRole("none");
        }

        setState((prevState) => ({
          ...prevState,
          data: prevState.data.filter((item: any) => !(item.id === row.id && item.obj === row.obj)),
        }));
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

      setLocalProperties((prevProps) => {
        const updatedProps = prevProps
          .map((item) => {
            // Inverti `match` solo per la riga con lo stesso `id` e `obj` della riga selezionata
            if (item.id === row.id && item.obj === row.obj) {
              const newMatch = !item.match;
              // Aggiorna `selectedMetadata` in base al nuovo valore di `match`
              setSelectedMetadata(newMatch ? row.id : "");
              console.log("selectedMetadata", newMatch ? row.id : "");
              handleConfirm(row.id, row.obj);
              return {
                ...item,
                match: newMatch,
                selected: newMatch,
              };
            }

            // Restituisci le altre righe senza modifiche
            return item;
          });
        return [...updatedProps]
          .sort((a, b) => {
            // Sort by selected status first (selected items come first)
            if (a.selected !== b.selected) {
              return a.selected ? -1 : 1;
            }
            // Then sort by alphabetical order of the name
            return a.name.localeCompare(b.name);
          });
        });
      },
    [setLocalProperties, setSelectedMetadata, handleConfirm],
  );

  const onSubmitNewMetadata = async (formState: Property) => {
    if (!column) return;
    if (column.metadata) {
      const { prefix, uri, name, subj, obj } = formState;
      const cleanPrefix = prefix.replace(/:$/, "");
      const idFromUri = extractIdFromUri(uri, cleanPrefix);
      const reconciliator = reconciliators.find(
        (recon) => recon.prefix === cleanPrefix,
      );
      const finalId = `${cleanPrefix}:${idFromUri}`;

      const isDuplicate = localProperties.some((prop: any) => {
        const existingId = prop.id.includes(":") ? prop.id.split(":")[1] : prop.id;
        return existingId === idFromUri && prop.obj === obj;
      });

      if (isDuplicate) {
        enqueueSnackbar(`Property ${idFromUri} already exists for this Subject and Object!`, {
          variant: "error",
          autoHideDuration: 4000,
        });
        return;
      }

      let finalUri = "";
      if (reconciliator) {
        finalUri = resolveURI(reconciliator, { id: idFromUri });
      } else {
        finalUri = uri;
      }
      console.log("finalUri", finalUri);

      let description = "";
      try {
        const result = await fetchTypeAndDescription(
          cleanPrefix,
          idFromUri,
          formState.name,
        );
        description = result.description || "";
      } catch (err) {
        console.error("Error fetching metadata info:", err);
      }

      const newPropertyItem = {
        ...formState,
        id: finalId,
        uri: finalUri,
        description: description || "",
        selected: true,
        decider: "human",
      };

      if (!isLiteral) {
        addEdit(addColumnMetadata({
          colId: column.id,
          type: "property",
          prefix,
          value: { ...formState, id: finalId, uri: finalUri, description },
        }), true);

        setLocalProperties((prev) => [...prev, newPropertyItem]);
        reset();
      } else {
        dispatch(addColumnMetadata({
          colId: column.id,
          type: "property",
          prefix,
          value: { ...formState, id: finalId, uri: finalUri, description },
        }), true);
      }

      reset();
      setCurrentRole("subject");
      setShowAdd(false);

      if (isLiteral) {
        dispatch(
          updateUI({
            openMetadataColumnDialog: false,
            metadataColumnDialogColId: null,
            selectedColumnsIds: {},
            selectedColumnCellsIds: {},
            selectedCellIds: {},
            selectedRowsIds: {},
          })
        );

        enqueueSnackbar("Property added successfully!", {
          variant: "success",
          autoHideDuration: 5000,
          action: (snackbarId) => (
            <Button
              size="small"
              color="inherit"
              variant="outlined"
              sx={{ textTransform: "none", borderColor: "rgba(255,255,255,0.5)", color: "#fff" }}
              onClick={() => {
                closeSnackbar(snackbarId);

                const selectedCellColIds: Record<string, boolean> = {};
                if (allRowIds && allRowIds.length > 0) {
                  allRowIds.forEach((rowId: string | number) => {
                    selectedCellColIds[`${rowId}$${subj}`] = true;
                  });
                }

                dispatch(
                  updateUI({
                    selectedColumnsIds: { [subj]: true },
                    selectedColumnCellsIds: { [subj]: true },
                    selectedCellIds: selectedCellColIds,
                    selectedRowsIds: {},
                    openMetadataColumnDialog: true,
                    metadataColumnDialogColId: subj,
                    metadataColumnDialogInitialTab: 1,
                  })
                );
              }}
            >
              View
            </Button>
          ),
        });
      }
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
            {isLiteral && (
              <Typography color="text.secondary">
                Properties can only be assigned to entity columns. Literal columns can be selected as object (target
                column) when defining a property on an entity column.
                <br />
                However, by defining the subject column,
                the property will be automatically created and added to that corresponding subject column.
              </Typography>
            )}
            {showAdd && (
              <Typography color="text.secondary">
                Browse external property lists filtered by the current column schema to manually add a specific property.
              </Typography>
            )}
            <Stack direction="row" gap={1} alignItems="center" marginTop="8px">
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
                  {isLiteral ? "Add column property in an Entity Column" : "Add column property"}
                  <AddRoundedIcon
                    sx={{
                      transition: "transform 150ms ease-out",
                      transform: showAdd ? "rotate(45deg)" : "rotate(0)",
                    }}
                  />
                </Button>
              </Tooltip>
              {showAdd && (
                <>
                  {(!!currentService &&
                  servicesByPrefix[currentService]?.listProps) && !hasColumnClassifier ? (
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
                      title={`List filtered using the current kind and ${isLiteral ? "datatype" : "semantic class"}`}
                      placement="bottom"
                      arrow
                    >
                      <span>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => window.open(wikiInfo.url, "_blank", "noopener,noreferrer")}
                          sx={{ textTransform: "none" }}
                        >
                          Wikidata
                          {hasColumnClassifier
                            ? `: ${wikiInfo.label}`
                            : ""}
                        </Button>
                      </span>
                    </Tooltip>
                  )}
                  {schemaOptions.map((option, idx) => (
                    <Tooltip
                      key={`${option.label}-${idx}`}
                      title={`List filtered using the current kind and ${isLiteral ? "datatype" : "semantic class"}`}
                      placement="top"
                      arrow
                    >
                      <span>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => window.open(option.url, "_blank", "noopener,noreferrer")}
                          sx={{ textTransform: "none" }}
                        >
                          Schema.org
                          {hasColumnClassifier
                            ? `: ${option.label}`
                            : ""}
                        </Button>
                      </span>
                    </Tooltip>
                  ))}
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
                  colId={currentColumnId}
                  columnKind={effectiveKind}
                />
              </Box>
            )}
          </Stack>
        )
      }
      {!isLiteral && (
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
      )}
    </>
  );
};

export default PropertyTab;
