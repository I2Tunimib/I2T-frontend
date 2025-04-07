import styled from "@emotion/styled";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { getPrefixIfAvailable, KG_INFO } from "@services/utils/kg-info";
import { selectAppConfig } from "@store/slices/config/config.selectors";
import {
  selectColumnCellMetadataTableFormat,
  selectColumnTypes,
  selectIsViewOnly,
} from "@store/slices/table/table.selectors";
import {
  addColumnType,
  updateColumnType,
  updateUI,
} from "@store/slices/table/table.slice";
import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { getCellComponent } from "../MetadataDialog/componentsConfig";
import { Cell, Row } from "react-table";
import { BaseMetadata } from "@store/slices/table/interfaces/table";
import usePrepareTable from "../MetadataDialog/usePrepareTable";
import deferMounting from "@components/HOC";
import CustomTable from "@components/kit/CustomTable/CustomTable";
const DeferredTable = deferMounting(CustomTable);

const PercentageBar = styled.div<{ percentage: string; checked: boolean }>(
  ({ percentage, checked }) => ({
    width: `${percentage}%`,
    height: "8px",
    borderRadius: "6px",
    backgroundColor: checked ? "#4AC99B" : "#E4E6EB",
    transition: "all 250ms ease-out",
  })
);

const SquaredBox = styled.div({
  borderRadius: "7px",
  padding: "10px",
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
      <Stack direction="row" gap="10px">
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
    rawData: ReturnType<typeof selectColumnCellMetadataTableFormat>
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
    const newMetadata = types.allTypes
      .map((type) => {
        return {
          selected: selected.some((item) => item.id === type.id),
          id: type.id,
          name: { value: type.label, uri: "" },
          percentage: Number(type.percentage).toFixed(0) + "%",
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
        Header: label,
        accessor: key,
        Cell: (cellValue: Cell<{}>) => getCellComponent(cellValue, type),
      };
    });

    const data = newMetadata.map((metadataItem) => {
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
    selector: selectColumnCellMetadataTableFormat,
    makeData,
    dependencies: [selected, types],
  });
  const onSubmitNewMetadata = (formState: NewMetadata) => {
    if (formState.uri) {
      let prefix = getPrefixIfAvailable(formState.uri, formState.id);
      if (prefix) {
        const newType = {
          id: prefix + formState.id,
          name: formState.name,
          uri: formState.uri,
        };
        dispatch(addColumnType([newType]));

        // dispatch(addNewType(newType));
      }
    }
  };

  const handleRowTypeCheck = (row: any) => {
    const rowId = row.id;
    const index = selected.findIndex((item) => item.id === rowId);
    if (index > -1) {
      setSelected(selected.filter((item) => item.id !== rowId));
    } else {
      if (types) {
        const selectedType = types.allTypes.find((item) => item.id === rowId);
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
    [selected, setSelected]
  );

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (types && types.allTypes) {
      if (checked) {
        const selectedType = types.allTypes.find(
          (item) => item.id === event.target.value
        );

        if (selectedType) {
          setSelected([...selected, selectedType]);
        }
      } else {
        setSelected(selected.filter((item) => item.id !== event.target.value));
      }
    }
  };
  useEffect(() => {
    if (selected && selected.length > 0) {
      const mappedTypes = selected.map((item) => ({
        id: item.id,
        name: item.label,
      }));
      const payload = updateColumnType(mappedTypes);
      addEdit(updateColumnType(mappedTypes), true, true);
    }
  }, [selected]);

  useEffect(() => {
    if (types && types.selectedType) {
      setSelected(types.selectedType);
    }
  }, [types]);

  const handleConfirm = () => {
    if (selected) {
      addEdit(
        updateColumnType({
          id: selected.id,
          name: selected.label,
        }),
        true
      );
    }
    //   dispatch(updateColumnType({
    //     id: selected.id,
    //     name: selected.label
    //   }));
    // }
    // dispatch(updateUI({ openMetadataColumnDialog: false }));
  };

  const handleCancel = () => {
    dispatch(updateUI({ openMetadataColumnDialog: false }));
  };

  return types ? (
    <Stack gap="10px" padding="10px">
      <Stack direction="row">
        <Typography variant="h6">Column types</Typography>
        {/* <Stack direction="row" gap="10px" marginLeft="auto">
          <Button variant="outlined" onClick={handleCancel}>Cancel</Button>
          <Button variant="outlined" onClick={handleConfirm}>Confirm</Button>
        </Stack> */}
      </Stack>
      <Typography color="textSecondary">
        In the following list is shown the frequency of the types which are
        present in the column
      </Typography>
      {false && selected && (
        <Box
          marginLeft="-10px"
          marginRight="-10px"
          padding="10px"
          position="sticky"
          top="47px"
          zIndex={10}
          bgcolor="#FFF"
        >
          <Stack component={SquaredBox}>
            <Typography variant="h6" fontSize="14px">
              Current selection
            </Typography>
            {selected.map((type) => (
              <div style={{ marginBottom: "10px" }}>
                <RadioLabel checked {...type} />
              </div>
            ))}
            {/* <RadioLabel checked {...selected[0]} /> */}
          </Stack>
        </Box>
      )}
      {
        /*data.length > 0 && */ API.ENDPOINTS.SAVE && (
          <Stack
            position="relative"
            direction="row"
            alignItems="center"
            alignSelf="flex-start"
            padding="0px 0px"
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
                onSubmit={handleSubmitNewType(onSubmitNewMetadata)}
              >
                <Tooltip
                  title="Enter a complete id, like wd:Q215627"
                  arrow
                  placement="top"
                >
                  <TextField
                    sx={{ minWidth: "200px" }}
                    size="small"
                    label="Id"
                    variant="outlined"
                    required
                    placeholder="wd:"
                    {...register("id")}
                  />
                </Tooltip>
                <Tooltip
                  title="Enter a name, like person"
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
                <TextField
                  sx={{ minWidth: "200px" }}
                  size="small"
                  label="Uri"
                  variant="outlined"
                  {...register("uri")}
                />

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
