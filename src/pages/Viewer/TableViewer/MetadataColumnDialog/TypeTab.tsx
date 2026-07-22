import styled from "@emotion/styled";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import { KG_INFO, fetchTypeAndDescription, searchQudtUnits, searchW3CFormats } from "@services/utils/kg-info";
import { createWikidataURI, extractIdFromUri, resolveURI } from "@services/utils/uri-utils";
import {
  selectAppConfig,
  selectReconciliatorsAsArray,
} from "@store/slices/config/config.selectors";
import { isValidWikidataId } from "@services/utils/regexs";
import { BaseMetadata } from "@store/slices/table/interfaces/table";
import deferMounting from "@components/HOC";
import CustomTable from "@components/kit/CustomTable/CustomTable";
import {
  selectColumnCellMetadataTableFormat,
  selectColumnTypes,
  selectIsViewOnly,
} from "@store/slices/table/table.selectors";
import {
  addColumnType,
  updateColumnType,
  updateColumnTypeMatches,
  updateUI,
} from "@store/slices/table/table.slice";
import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Cell } from "@tanstack/react-table";
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { getCellComponent } from "../MetadataDialog/componentsConfig";
import usePrepareTable from "../MetadataDialog/usePrepareTable";
import AddMetadataForm from "./AddMetadataForm";

const DeferredTable = deferMounting(CustomTable);

const normalizeTypeId = (id: string) => {
  if (!id) return id;
  // If already prefixed with wd:, return as-is
  if (id.startsWith("wd:")) return id;
  // If it's a bare Wikidata id like Q123, normalize to wd:Q123
  if (/^Q\d+$/.test(id)) return `wd:${id}`;
  // Otherwise return original id
  return id;
};

const PercentageBar = styled.div<{ percentage: string; checked: boolean }>(
  ({ percentage, checked }) => ({
    width: `${percentage}%`,
    height: "8px",
    borderRadius: "6px",
    backgroundColor: checked ? "#4AC99B" : "#E4E6EB",
    transition: "all 250ms ease-out",
  }),
);

const SquaredBox = styled.div({
  borderRadius: "7px",
  padding: "8px",
  boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 10%)",
});

type RadioLabelProps = {
  percentage: string;
  id: string;
  count: number;
  label: string;
  checked: boolean;
};

const RadioLabel: FC<RadioLabelProps> = ({ percentage, label, checked }) => {
  return (
    <Stack>
      <Stack direction="row" gap="8px">
        {label}
        <Typography fontSize="14px">{`(${percentage}%)`}</Typography>
      </Stack>
      <PercentageBar checked={checked} percentage={percentage} />
    </Stack>
  );
};

const RadioButtonsGroup: FC<{
  types: any | null;
  value: string;
  selected: SelectedTypeState[];
  onChange: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}> = ({ selected, types, value, onChange }) => {
  function typeInSelected(id: string) {
    return selected.some((item) => item.id === id);
  }
  return (
    <FormControl component="fieldset">
      {selected &&
        types &&
        types.map(({ id, ...rest }: any) => (
          <FormControlLabel
            sx={{
              "& span:nth-of-type(2)": {
                flexGrow: 1,
              },
              "&:hover": {
                "& span:nth-of-type(2)": {
                  "& div:nth-of-type(2)": {
                    boxShadow: "inset 0px 0px 0px 1px #4AC99B",
                  },
                },
              },
            }}
            key={id}
            value={id}
            control={
              <Checkbox
                color="success"
                checked={typeInSelected(id)}
                onChange={onChange}
              />
            }
            label={
              <RadioLabel key={id} id={id} checked={value === id} {...rest} />
            }
          />
        ))}
    </FormControl>
  );
};

type SelectedTypeState = {
  id: string;
  label: string;
  count: number;
  percentage: string;
};
interface TypeTabProps {
  // function used to pass to the main component the
  // actions to do in order to persist the modifications
  addEdit: Function;
  currentKind?: string;
  currentDatatype?: string;
}

interface NewMetadata {
  id: string;
  name: string;
  uri?: string;
}
const TypeTab: FC<TypeTabProps> = ({ addEdit, currentKind, currentDatatype }) => {
  const [selected, setSelected] = useState<SelectedTypeState[]>([]);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const colId = useAppSelector(
    (state) => state.table.ui.metadataColumnDialogColId,
  );
  const rawData = useAppSelector(selectColumnCellMetadataTableFormat);
  const currentService = rawData?.service?.prefix || "";
  const [selectedPrefix, setSelectedPrefix] = useState<string>(currentService || "");
  const [typeOptions, setTypeOptions] = useState<{id: string, label: string, uri: string}[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [localAddedTypes, setLocalAddedTypes] = useState<any[]>([]);
  const kind = currentKind;
  const datatype = currentDatatype;

  useEffect(() => {
    if (currentService) {
      setSelectedPrefix(currentService);
    }
  }, [currentService]);

  const {
    handleSubmit: handleSubmitNewType,
    reset,
    register,
    control,
  } = useForm<NewMetadata>();
  const { API } = useAppSelector(selectAppConfig);

  const types = useAppSelector(selectColumnTypes);
  const dispatch = useAppDispatch();
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
  const makeData = (
    rawData: ReturnType<typeof selectColumnCellMetadataTableFormat>,
  ) => {
    if (!rawData) {
      return {
        columns: [],
        data: [],
      };
    }
    const { column, service } = rawData;

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
      percentage: { label: "Percentage" },
      // match: { label: "Match", type: "tag" },
    };

    if (!column.metadata || !column.metadata[0]) {
      return {
        columns: [],
        data: [],
      };
    }

    const { property: metadata } = column.metadata[0];
    // Use types from Redux state
    if (!types || !types.allTypes) {
      return {
        columns: [],
        data: [],
      };
    }
    /*
  the following snippet is a workaround because Datamodel of Property (API response JSON) is different
  from Entity Datamodel
  COULD HAVE SAME DATAMODEL? IN THIS CASE, IT NEEDS TO MAKE A CHANGE IN THE BACKEND APPLICATION
  */
    const allColumnTypes = [
      ...(types.allTypes || []),
      ...localAddedTypes,
    ];

    const uniqueTypesMap: Record<string, any> = {};
    allColumnTypes.forEach((type) => {
      if (!uniqueTypesMap[type.id] || (!uniqueTypesMap[type.id].uri && type.uri)) {
        uniqueTypesMap[type.id] = type;
      }
    });
    const allTypes = Object.values(uniqueTypesMap);

    const newMetadata = allTypes
      .map((type) => {
        console.log(
          "mapped types",
          type,
          selected,
          selected.some((item) => item.id === type.id),
        );
        const isQudt = type.id && type.id.includes("unit:");
        const isTime = type.id && type.id.includes("xsd:");
        return {
          selected: selected.some((item) => item.id === type.id),
          id: (isQudt || isTime) ? type.id : (isValidWikidataId(type.id) ? "wd:" + type.id : type.id),
          name: {
            value: type.label || type.name,
            uri: type.uri || type.name?.uri || (isQudt ? null : createWikidataURI(type.id)),
          },
          percentage: (isQudt || isTime) ? "100%" : (Number(type.percentage || 100).toFixed(0) + "%"),
          // match: "",
        };
      })
      .sort((a, b) => {
        // Sort by selected status first (selected items come first)
        if (a.selected !== b.selected) {
          return a.selected ? -1 : 1;
        }
        // Then sort by percentage (descending order)
        const percentageA = parseFloat(a.percentage.replace("%", ""));
        const percentageB = parseFloat(b.percentage.replace("%", ""));
        return percentageB - percentageA;
      });

    const columns = Object.keys(metaToView).map((key) => {
      const { label = key, type } = metaToView[key];
      return {
        header: label,
        accessorKey: key,
        cell: (cellValue: Cell<{}>) => getCellComponent(cellValue, type),
      };
    });

    const data = newMetadata.map((metadataItem) => {
      //const data = metadata.map((metadataItem) => {
      return Object.keys(metaToView).reduce(
        (acc, key) => {
          console.log("tttest", metadataItem[key]);
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
    });
    console.log("data", data);
    console.log("columns", columns);
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
    selector: selectColumnCellMetadataTableFormat,
    makeData,
    dependencies: [selected, types, colId],
  });
  const onSubmitNewMetadata = (formState: NewMetadata) => {
    const { prefix, uri, name } = formState;
    const cleanPrefix = prefix.replace(/:$/, "");
    // Extract id from URI for type and description fetching
    const idFromUri = extractIdFromUri(uri, cleanPrefix);
    const reconciliator = reconciliators.find(
      (recon) => recon.prefix === cleanPrefix,
    );

    const finalId = cleanPrefix === "geo" ? `${idFromUri}` : `${cleanPrefix}:${idFromUri}`;
    let finalUri = "";
    if (reconciliator) {
      finalUri = cleanPrefix === "geo" ? "" : resolveURI(reconciliator, { id: idFromUri });
    } else {
      finalUri = uri;
    }

    const newType = {
      id: finalId,
      uri: finalUri,
      name: formState.name,
    };

    // Add the new type to the column metadata
    addEdit(addColumnType({ colId, newTypes: [newType] }));
    // Ensure the column's main type list is updated (id + name) so selectors/readers see it
    addEdit(updateColumnType([{ id: finalId, name: formState.name }]));
    // Also mark the newly added type as matched so checkboxes reflect selection/save
    addEdit(updateColumnTypeMatches({ typeIds: [finalId] }));
    setLocalAddedTypes((prev) => [...prev, newType]);
    // Auto-select the newly added type in the local component state so UI updates immediately
    setSelected((prev) => {
      // avoid duplicates
      if (prev.some((p) => p.id === finalId)) {
        return prev;
      }
      return [
        ...prev,
        {
          id: finalId,
          label: formState.name,
          count: 1,
          percentage: "100",
        },
      ];
    });
  };

  const handleRowTypeCheck = (row: any) => {
    const normRowId = normalizeTypeId(row.id);
    const index = selected.findIndex(
      (item) => normalizeTypeId(item.id) === normRowId,
    );
    if (index > -1) {
      setSelected(
        selected.filter((item) => normalizeTypeId(item.id) !== normRowId),
      );
    } else {
      if (types && rawData) {
        const { column } = rawData;
        const allTypes = [...(types.allTypes || [])];
        const selectedType = allTypes.find(
          (item) => normalizeTypeId(item.id) === normRowId,
        );
        if (selectedType) {
          setSelected([...selected, selectedType]);
        }
      }
    }
  };

  const handleSelectedRowChange = useCallback(
    (row: any) => {
      setState(({ columns: colState, data: dataState }) => {
        if (!row.id) {
          return { columns: colState, data: dataState };
        }
        const selectedRow = dataState.find((item) => item.id === row.id);
        if (!selectedRow) {
          return { columns: colState, data: dataState };
        }
        const newData = dataState.map((item) => {
          if (item.id === row.id) {
            return {
              ...item,
              selected: !selectedRow.selected,
            };
          }
          return item;
        });
        return {
          columns: colState,
          data: newData,
        };
      });
    },
    [selected, setSelected],
  );

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    if (types && types.allTypes) {
      const value = event.target.value;
      const normValue = normalizeTypeId(value);
      if (checked) {
        const selectedType =
          (types.allTypes || []).find(
            (item) => normalizeTypeId(item.id) === normValue,
          ) || undefined;

        if (selectedType) {
          setSelected([...selected, selectedType]);
        }
      } else {
        setSelected(
          selected.filter((item) => normalizeTypeId(item.id) !== normValue),
        );
      }
    }
  };

  useEffect(() => {
    if (selected && selected.length > 0) {
      const mappedTypeIds = selected.map((item) => {
        return normalizeTypeId(item.id);
      });

      const newTypesPayload = selected.map((item) => {
        return {
          id: normalizeTypeId(item.id),
          name: item.label,
          ...(item.uri ? { uri: item.uri } : {}),
        };
      });

      const validNewTypes = newTypesPayload.filter((t) => t.id);

      if (mappedTypeIds.length > 0) {
        addEdit(addColumnType({ colId, newTypes: validNewTypes }), false, true);
      }
    }
  }, [selected]);

  useEffect(() => {
    if (types && types.selectedType) {
      console.log("types.selectedType", types.selectedType);
      setSelected(types.selectedType);
    }
  }, [types]);

  const handleConfirm = () => {
    if (selected && selected.length > 0) {
      // Prepare payloads using normalized ids:
      // 1) updateColumnType expects an array of { id, name }
      const mappedTypesForUpdate = selected.map((item) => ({
        id: normalizeTypeId(item.id),
        name: item.label,
      }));
      // 2) updateColumnTypeMatches expects { typeIds: string[] }
      const mappedTypeIds = selected.map((item) => normalizeTypeId(item.id));

      // Dispatch both actions via addEdit so they are treated as edits/undoable
      // First update the column types themselves (ids + names)
      addEdit(updateColumnType(mappedTypesForUpdate), true);
      // Then update the matches for those types
      addEdit(updateColumnTypeMatches({ typeIds: mappedTypeIds }), true);
    }
    dispatch(updateUI({ openMetadataColumnDialog: false }));
  };

  const handleCancel = () => {
    dispatch(updateUI({ openMetadataColumnDialog: false }));
  };

  const servicesByPrefix = (reconciliators || []).reduce<Record<string, any>>(
    (acc, service) => {
      if (service?.prefix) {
        const cleanPrefix = service.prefix.replace(/:$/, "");
        acc[cleanPrefix] = service;
      }
      return acc;
    },
    {},
  );

  const handleMetadataSearch = async (query: string) => {
    if (!query) {
      setTypeOptions([]);
      return;
    }
    setIsSearching(true);
    try {
      let results = [];
      if (datatype === "NUMBER") {
        results = await searchQudtUnits(query);
      } else if (datatype === "DATE") {
        const finalTerm = !query ? "date" : query;
        results = await searchW3CFormats(finalTerm, datatype);
      } else if (datatype === "STRING") {
        const finalTerm = !query ? "string" : query;
        results = await searchW3CFormats(finalTerm, datatype);
      }
      setTypeOptions(results);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (kind === "literal" && colId) {
      if (datatype === "NUMBER") {
        const initialQuery = colId.replace(/_/g, ' ');
        setInputValue(initialQuery);
        handleMetadataSearch(initialQuery);
      } else if (datatype === "DATE") {
        setInputValue("date");
        handleMetadataSearch("date");
      } else if (datatype === "STRING") {
        setInputValue("string");
        handleMetadataSearch("string");
      }
    }
  }, [colId, datatype, kind]);

  const handleSelectOption = (option: {id: string, label: string, uri: string}) => {
    const newType = {
      id: option.id,
      label: option.label,
      name: option.label,
      uri: option.uri,
      percentage: 100
    };
    addEdit(addColumnType({ colId, newTypes: [newType] }));
    setLocalAddedTypes((prev) => [...prev, newType]);
    setSelected((prev) => {
      if (prev.some((p) => p.id === newType.id)) return prev;
      return [...prev, { ...newType, count: 1, percentage: "100" }];
    });
  };

  const literalTypesConfig = {
    NUMBER: {
      title: "Unit type via QUDT Ontology",
      description: "Define the unit of measure (e.g., Celsius, Kilograms) for the data in this column.",
      url: "https://qudt.org/vocab/unit/",
      urlLabel: "qudt.org/vocab/unit",
      label: "Search for a Unit"
    },
    DATE: {
      title: "Date/Time Format via W3C XML Schema (XSD)",
      description: "Define the specific data format standard (e.g., date, dateTime) to parse this column.",
      url: "https://www.w3.org/TR/xmlschema-2/",
      urlLabel: "w3.org/TR/xmlschema-2/",
      label: "Search for Validation Format"
    },
    STRING: {
      title: "String Format via W3C XML Schema (XSD)",
      description: "Define the specific string format standard (e.g., string, token) to parse this column.",
      url: "https://www.w3.org/TR/xmlschema-2/",
      urlLabel: "w3.org/TR/xmlschema-2/",
      label: "Search for Text Format"
    }
  };

  const currentConfig = literalTypesConfig[datatype] || {
    title: "",
    description: "",
    url: "",
    urlLabel: "",
    label: ""
  };

  const handleTypesInService = () => {
    const serviceInfo = servicesByPrefix[selectedPrefix.replace(/:$/, "")];
    if (!serviceInfo) {
      console.error("No service info found for prefix:", selectedPrefix);
      return;
    }
    let url = "";
    if (serviceInfo?.searchTypesPattern) {
      url = serviceInfo.searchTypesPattern.replace(
        "{label}",
        encodeURIComponent(rawData.column.id),
      );
    } else if (serviceInfo?.listTypes) {
      url = serviceInfo.listTypes;
    } else return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return types ? (
    <Stack position="sticky" top="0" zIndex={10} bgcolor="#FFF">
      <Stack direction="column" paddingLeft="16px" paddingBottom="10px">
        <Typography color="textSecondary">
          In the following list is shown the frequency of the types which are
          present in the column
        </Typography>
      </Stack>
      {
        /*data.length > 0 && */ API.ENDPOINTS.SAVE && (
          <Stack
            position="relative"
            direction="column"
            flexWrap="wrap"
            padding="0px 16px"
            gap={1}
          >
            {kind === "literal" && (
              <Stack spacing={2}>
                {datatype && literalTypesConfig[datatype] && (
                  <>
                    <Box
                      sx={{
                        padding: "16px",
                        bgcolor: "#f0f7ff",
                        borderLeft: "4px solid #2196f3",
                        borderRadius: "4px",
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold" color="#0d47a1">
                        {currentConfig.title}
                      </Typography>
                      <Typography variant="body2" color="#0d47a1">
                        {currentConfig.description}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: '#0d47a1', opacity: 0.8 }}>
                        For more information, see:{" "}
                        <a
                          href={currentConfig.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'inherit', fontStyle: 'italic' }}
                        >
                          {currentConfig.urlLabel}
                        </a>
                      </Typography>
                    </Box>
                    <Autocomplete
                      fullWidth
                      options={typeOptions}
                      loading={isSearching}
                      inputValue={inputValue}
                      onInputChange={(_, value) => {
                        setInputValue(value);
                        handleMetadataSearch(value);
                      }}
                      onChange={(_, value) => value && handleSelectOption(value)}
                      getOptionLabel={(option) => (typeof option === 'string' ? option : option.label || "")}
                      freeSolo
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={currentConfig.label}
                          placeholder="Start typing to search..."
                          variant="outlined"
                          size="small"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <IconButton size="small" disabled sx={{ p: '4px', mr: 1 }}>
                                <FilterListRoundedIcon fontSize="small" />
                              </IconButton>
                            ),
                            endAdornment: (
                              <>
                                {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </>
                )}
                {datatype === "none" && (
                  <Box
                    sx={{
                      padding: "16px",
                      bgcolor: "#fff3e0",
                      borderLeft: "4px solid #e65100",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1
                    }}
                  >
                    <TipsAndUpdatesOutlinedIcon sx={{ color: "#e65100" }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold" color="#5d4037">
                        Define the Datatype
                      </Typography>
                      <Typography variant="body2" color="#5d4037">
                        The datatype for this literal column is currently undefined. Please define a valid datatype
                        to configure its validation format or unit properties.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            )}
            <Stack direction="row" gap={1} alignItems="center">
              <Tooltip open={showTooltip} title="Add type" placement="right">
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
                  Add column type
                    <AddRoundedIcon
                      sx={{
                        transition: "transform 150ms ease-out",
                        transform: showAdd ? "rotate(45deg)" : "rotate(0)",
                      }}
                    />
                  </Button>
                </Tooltip>
                {showAdd ? (
                  !!selectedPrefix ? (
                    servicesByPrefix[selectedPrefix]?.searchTypesPattern ? (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleTypesInService}
                        sx={{ textTransform: "none" }}
                      >
                        Search "{rawData?.column?.id}" in {KG_INFO[selectedPrefix].groupName}
                      </Button>
                    ) : servicesByPrefix[selectedPrefix]?.listTypes ? (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleTypesInService}
                        sx={{ textTransform: "none" }}
                      >
                        View list of {KG_INFO[selectedPrefix].groupName} types
                      </Button>
                    ) : null
                  ) : (
                    // fallback when no service → Wikidata
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        const wikidataPattern =
                          "https://www.wikidata.org/w/index.php?search={label}&title=Special:Search";
                        const url = wikidataPattern.replace(
                          "{label}",
                          encodeURIComponent(rawData?.column?.id || ""),
                        );
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                      sx={{ textTransform: "none" }}
                    >
                      Search "{rawData?.column?.id}" in{" "}
                      {KG_INFO["wd"].groupName || "Wikidata"}
                    </Button>
                  )
                ) : null}
              </Stack>
            {showAdd && (
              <Box sx={{ width: "100%", paddingTop: "8px" }}>
                <AddMetadataForm
                  currentService={currentService}
                  onSubmit={onSubmitNewMetadata}
                  context="typeTab"
                  onPrefixChange={setSelectedPrefix}
                />
              </Box>
            )}
          </Stack>
        )
      }
      {/* <RadioButtonsGroup
        selected={selected}
        types={types.allTypes}
        value={selected ? selected.id : ""}
        onChange={handleChange}
      /> */}
      <DeferredTable
        flexGrow={1}
        stickyHeaderTop="61.5px"
        columns={columns}
        data={data}
        disableDelete={true}
        loading={false}
        onSelectedRowChange={handleRowTypeCheck}
        onSelectedRowDeleteRequest={() => {}}
        showCheckbox={true}
        onRowCheck={handleRowTypeCheck}
        checkedRows={selected.map((item) => item.id)}
        showRadio={!!API.ENDPOINTS.SAVE && !isViewOnly}
      />
    </Stack>
  ) : null;
};

export default TypeTab;
