import styled from "@emotion/styled";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { KG_INFO, fetchTypeAndDescription } from "@services/utils/kg-info";
import { createWikidataURI } from "@services/utils/uri-utils";
import { selectAppConfig, selectReconciliatorsAsArray } from "@store/slices/config/config.selectors";
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
}

interface NewMetadata {
  id: string;
  name: string;
  uri?: string;
}
const TypeTab: FC<TypeTabProps> = ({ addEdit }) => {
  const [selected, setSelected] = useState<SelectedTypeState[]>([]);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const isViewOnly = useAppSelector(selectIsViewOnly);
  const reconciliators = useAppSelector(selectReconciliatorsAsArray);
  const colId = useAppSelector((state) => state.table.ui.metadataColumnDialogColId);
  const rawData = useAppSelector(selectColumnCellMetadataTableFormat);
  const currentService = rawData?.service?.prefix || "";

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
      ...(column.metadata[0]?.additionalTypes || []),
    ];

    const uniqueTypesMap: Record<string, any> = {};
    allColumnTypes.forEach((type) => {
      uniqueTypesMap[type.id] = type;
    });
    const allTypes = Object.values(uniqueTypesMap);

    const newMetadata = allTypes
      .map((type) => {
        console.log(
          "mapped types",
          type,
          selected,
          selected.some((item) => item.id === type.id) ||
            column.metadata[0]?.additionalTypes?.some(
              (t: any) => t.id === type.id,
            ),
        );
        return {
          selected:
            selected.some((item) => item.id === type.id) ||
            column.metadata[0]?.additionalTypes?.some(
              (t: any) => t.id === type.id,
            ),
          id: isValidWikidataId(type.id) ? "wd:" + type.id : type.id,
          name: {
            value: type.label || type.name,
            uri: createWikidataURI(type.id) || type.uri,
          },
          percentage: Number(type.percentage || 100).toFixed(0) + "%",
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
    if (formState.uri) {
      const prefix = formState?.prefix;
      //console.log("onSubmitNewMetadata prefix", prefix);
      let idFromUri = "";

      // Robust extraction strategy:
      // 1) Try to parse as URL and prefer fragment (#id) if present.
      // 2) Otherwise use the last non-empty path segment.
      // 3) Apply special cases for known prefixes (wd, geo, geoCoord).
      // 4) If parsing fails, fallback to string token extraction.
      try {
        const url = new URL(formState.uri);
        console.log("url", url);

        // Prefer fragment (after #)
        if (url.hash && url.hash.length > 1) {
          idFromUri = url.hash.slice(1);
        } else {
          // Last non-empty path segment
          const pathParts = url.pathname.split("/").filter(Boolean);
          if (pathParts.length > 0) {
            idFromUri = pathParts[pathParts.length - 1];
          } else {
            // No path segments - try to use pathname without leading/trailing slashes
            idFromUri = url.pathname.replace(/^\/+|\/+$/g, "");
          }
        }

        // Apply known special cases when needed (prefer the above result if present)
        if (
          (!idFromUri || idFromUri === "") &&
          prefix &&
          prefix.startsWith("wd")
        ) {
          // e.g. https://www.wikidata.org/wiki/Q18711
          idFromUri = url.pathname.split("/").filter(Boolean).pop() || "";
        } else if ((!idFromUri || idFromUri === "") && prefix === "geo") {
          // e.g. https://www.geonames.org/3117735/madrid.html -> 3117735
          const parts = url.pathname.split("/").filter(Boolean);
          idFromUri =
            parts[0] === undefined
              ? ""
              : parts[0] || parts[parts.length - 1] || "";
        } else if ((!idFromUri || idFromUri === "") && prefix === "geoCoord") {
          // e.g. https://www.google.com/maps/place/lat,long
          const parts =
            url.pathname.split("/").filter(Boolean).pop()?.split(",") || [];
          idFromUri = parts.join(",");
        }

        // If still empty, try to extract something from the query params (last value)
        if (!idFromUri) {
          const params = new URLSearchParams(url.search);
          const lastKey = Array.from(params.keys()).pop();
          if (lastKey) {
            idFromUri = params.get(lastKey) || "";
          }
        }

        // Final fallback: stringify pathname+search+hash trimmed
        if (!idFromUri) {
          idFromUri = (
            url.pathname +
            (url.search || "") +
            (url.hash || "")
          ).replace(/^\/+/, "");
        }
      } catch (err) {
        // Not a valid URL - fallback heuristics on the raw string
        console.warn("Invalid URI, fallback to extracting last token", err);
        const trimmed = formState.uri.trim();
        if (trimmed.includes("#")) {
          idFromUri = trimmed.split("#").pop() || trimmed;
        } else {
          const parts = trimmed.split("/").filter(Boolean);
          idFromUri = parts.length > 0 ? parts[parts.length - 1] : trimmed;
        }
      }

      const sanitizedPrefix = prefix ? String(prefix).replace(/:+$/, "") : "";
      const finalId = idFromUri.includes(":")
        ? idFromUri
        : sanitizedPrefix
          ? `${sanitizedPrefix}:${idFromUri}`
          : idFromUri;

      if (prefix) {
        const newType = {
          id: finalId,
          name: formState.name,
          uri: formState.uri,
        };
        // Add the new type to the column metadata
        dispatch(addColumnType({ colId, newTypes: [newType] }));
        // Ensure the column's main type list is updated (id + name) so selectors/readers see it
        dispatch(updateColumnType([{ id: finalId, name: formState.name }]));
        // Also mark the newly added type as matched so checkboxes reflect selection/save
        dispatch(updateColumnTypeMatches({ typeIds: [finalId] }));
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
      }
    }
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
        const allTypes = [
          ...(types.allTypes || []),
          ...(column?.metadata?.[0]?.additionalTypes || []),
        ];
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
      const mappedTypes = selected.map((item) => item.id);
      const payload = updateColumnType(mappedTypes);
      addEdit(updateColumnTypeMatches({ typeIds: mappedTypes }), true, true);
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

  const servicesByPrefix = reconciliators.reduce<Record<string, any>>(
    (acc, service) => {
      acc[service.prefix] = service;
      return acc;
    },
    {},
  );

  const handleTypesInService = () => {
    if (!rawData?.column?.id || !currentService) return;
    const serviceInfo = servicesByPrefix[currentService];
    let url = "";
    if (serviceInfo?.searchTypesPattern) {
      url = serviceInfo.searchTypesPattern.replace("{label}", encodeURIComponent(rawData.column.id));
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
            alignItems="flex-start"
            flexWrap="wrap"
            padding="0px 16px"
            gap={1}
          >
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
                    gap: 1
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
                !!currentService ? (
                  servicesByPrefix[currentService]?.searchTypesPattern ? (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleTypesInService}
                      sx={{ textTransform: "none" }}
                    >
                      Search in {KG_INFO[currentService].groupName}
                    </Button>
                  ) : servicesByPrefix[currentService]?.listTypes ? (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleTypesInService}
                      sx={{ textTransform: "none" }}
                    >
                      View list of {KG_INFO[currentService].groupName} types
                    </Button>
                  ) : null
                ) : (
                  // fallback when no service → Wikidata
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      const wikidataPattern = "https://www.wikidata.org/w/index.php?search={label}&title=Special:Search";
                      const url = wikidataPattern.replace("{label}", encodeURIComponent(rawData?.column?.id || ""));
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    sx={{ textTransform: "none" }}
                  >
                    Search "{rawData?.column?.id}" in {KG_INFO["wd"].groupName || "Wikidata"}
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
