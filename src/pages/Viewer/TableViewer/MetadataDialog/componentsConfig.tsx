import { React } from "react";
import { Tag } from "@components/core";
import { Button, Checkbox, Chip, Link, Stack, Typography } from "@mui/material";
import { MetaToViewItem } from "@store/slices/config/interfaces/config";
import { CellContext, Row } from "@tanstack/react-table";

export const ResourceLink = ({ getValue }: CellContext<any, any>) => {
  const cellValue = getValue();
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
    }
    return (
      <Typography variant="body2" color="textSecondary">
        {value}
      </Typography>
    );
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

export const MatchCell = ({ getValue }: CellContext<any, any>) => {
  const value = getValue() ?? false;
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

export const Expander = ({
  row,
  setSubRows,
  getValue,
}: {
  row: Row<any>;
  setSubRows: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  getValue: () => any[];
}) => {
  const value = getValue() || [];

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
    row.toggleExpanded();
  };

  return (
    <Button onClick={handleClick}>
      {row.getIsExpanded() ? `(${value.length}) 👇` : `(${value.length}) 👉`}
    </Button>
  );
};
export const CheckBoxCell = ({
  getValue,
  table,
  row,
  column,
}: CellContext<any, any>) => {
  const value = getValue();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    table.options.meta?.onCheckboxChange?.(
      row,
      column.id,
      event.target.checked,
    );
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
  cell: CellContext<any, any>,
  type: MetaToViewItem["type"],
) => {
  const value = cell.getValue();

  console.log("getCellComponent called with:", value, type, cell);

  // Allow checkBox cells to render even when their value is null/undefined.
  // Previously the function returned early with "null" for any null value,
  // preventing checkbox rendering. Now we render the checkbox component
  // when type === "checkBox" even if value is null.
  if (value == null) {
    if (type === "checkBox") {
      return (
        <div style={{ width: "100%" }}>{CELL_COMPONENTS_TYPES[type](cell)}</div>
      );
    }
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
