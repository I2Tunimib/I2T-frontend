import styled from "@emotion/styled";
import { useAppDispatch, useAppSelector } from "@hooks/store";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { selectColumnTypes } from "@store/slices/table/table.selectors";
import { updateColumnType, updateUI } from "@store/slices/table/table.slice";
import { ChangeEvent, FC, useEffect, useState } from "react";

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
const TypeTab: FC<TypeTabProps> = ({ addEdit }) => {
  const [selected, setSelected] = useState<SelectedTypeState[]>([]);
  const types = useAppSelector(selectColumnTypes);
  const dispatch = useAppDispatch();

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
      {selected && (
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
      <RadioButtonsGroup
        selected={selected}
        types={types.allTypes}
        value={selected ? selected.id : ""}
        onChange={handleChange}
      />
    </Stack>
  ) : null;
};

export default TypeTab;
