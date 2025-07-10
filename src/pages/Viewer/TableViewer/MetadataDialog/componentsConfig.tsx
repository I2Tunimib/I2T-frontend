import { Tag } from "@components/core";
import { Button, Checkbox, Chip, Link, Stack, Typography } from "@mui/material";
import { MetaToViewItem } from "@store/slices/config/interfaces/config";
import { Cell } from "react-table";

export const ResourceLink = ({ value: cellValue }: Cell<{}>) => {
  console.log("ResourceLink called with:", cellValue);
  const { value, uri } = cellValue;
  console.log("cell uri", uri);
  if (!uri) {
    // If the URI is empty, render plain text instead of a clickable link with a tooltip for the value
    if (typeof value === "object" && value !== null && "value" in value) {
      console.log("Found object with value property:", value);
      return (
        <Typography variant="body2" color="textSecondary">
          {value.value || ""}
        </Typography>
      );
    } else {
      return (
        <Typography variant="body2" color="textSecondary">
          {value}
        </Typography>
      );
    }
  }

  return (
    <Link
      onClick={(event) => event.stopPropagation()}
      title={value}
      href={uri ?? "#"}
      target="_blank"
    >
      {value}
    </Link>
  );
};

export const MatchCell = ({ value: inputValue }: Cell<{}>) => {
  const value = inputValue == null ? false : inputValue;

  return (
    <Tag size="medium" status={value ? "done" : "doing"}>
      {`${value}`}
    </Tag>
  );
};

export const SubList = (value: any[] = []) => {
  return (
    <Stack direction="row" gap="10px" style={{ width: "100%" }}>
      {value.length > 0 ? (
        value.map((item) => (
          <Chip key={item.id} size="small" label={item.name} />
        ))
      ) : (
        <Typography variant="caption">This entity has no types</Typography>
      )}
    </Stack>
  );
};

export const Expander = ({ row, setSubRows, value: inputValue }: any) => {
  const { onClick, ...rest } = row.getToggleRowExpandedProps() as any;

  const value = inputValue || [];

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    setSubRows((old: any) => {
      if (old[row.id]) {
        const { [row.id]: discard, ...newState } = old;
        return newState;
      }

      return {
        ...old,
        [row.id]: SubList(value),
      };
    });
    onClick();
  };

  return (
    <Button onClick={handleClick} {...rest}>
      {row.isExpanded ? `(${value.length}) 👇` : `(${value.length}) 👉`}
    </Button>
  );
};
export const CheckBoxCell = ({ value, onChange }: any) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked); // Call the onChange handler if provided
  };

  return (
    <Checkbox
      checked={!!value} // Ensure value is a boolean
      onChange={handleChange}
      color="primary"
    />
  );
};
export const CELL_COMPONENTS_TYPES = {
  tag: MatchCell,
  link: ResourceLink,
  subList: Expander,
  checkBox: CheckBoxCell,
};

export const getCellComponent = (
  cell: Cell<{}>,
  type: MetaToViewItem["type"]
) => {
  const { value } = cell;

  console.log("getCellComponent called with:", value, type, cell);

  if (value == null) {
    return <Typography color="textSecondary">null</Typography>;
  }
  if (!type) {
    if (typeof value === "number") {
      return value.toFixed(2);
    }
    // Handle objects with {value, uri} structure (common in metadata)
    if (typeof value === "object" && value !== null && "value" in value) {
      console.log("Found object with value property:", value);
      return value.value || "";
    }
    return value;
  }
  return (
    <div style={{ width: "100%" }}>{CELL_COMPONENTS_TYPES[type](cell)}</div>
  );
};
