/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { ID } from "@store/interfaces/store";
import {
  ChangeEvent,
  FC,
  KeyboardEvent,
  useState,
  MouseEvent,
  useRef,
  FocusEvent,
  useEffect,
} from "react";
import styled from "@emotion/styled";
import EditableCell from "../EditableCell";
import { TableCell, TableColumn, TableRow } from "../interfaces/table";
import NormalCell from "../NormalCell";

interface TableRowCellProps extends TableCell {
  cell: any;
  column: TableColumn;
  row: TableRow;
  selected: boolean;
  expanded: boolean;
  editable: boolean;
  matching: boolean;
  dense: boolean;
  highlightState: any;
  settings: any;
  searchHighlightState: any;
  handleSelectedRowChange: (event: MouseEvent<any>, id: string) => void;
  handleSelectedCellChange: (event: MouseEvent<any>, id: string) => void;
  handleCellRightClick: (
    event: MouseEvent<any>,
    type: string,
    id: string
  ) => void;
  updateTableData: (cellId: ID, value: string) => any;
}

const Td = styled.td<{
  selected: boolean;
  columnId: string;
  highlightState: any;
  searchHighlight: boolean;
  dense?: boolean;
}>(({ selected, highlightState, searchHighlight, columnId, dense }) => ({
  position: "relative",
  textAlign: "center",
  verticalAlign: "middle",
  cursor: "default",
  backgroundColor: "inherit",
  borderRight: "1px solid #ededed",
  borderBottom: "1px solid #ededed",
  ...(highlightState &&
    highlightState.columns.includes(columnId) && {
      backgroundColor: `${highlightState.color}0d`,
    }),
  ...(selected && {
    backgroundColor: "var(--brand-color-one-transparent)",
  }),
  ...(searchHighlight && {
    backgroundColor: "#FFFCE8",
  }),
  ...(dense && {
    padding: "0px",
  }),
}));

/**
 * Table row cell.
 */
const TableRowCell: FC<TableRowCellProps> = ({
  cell,
  children,
  column: { id: columnId },
  row: { id: rowId, ...restRow },
  selected,
  expanded,
  editable,
  value,
  settings,
  dense,
  highlightState,
  searchHighlightState = {},
  handleSelectedRowChange,
  handleCellRightClick,
  handleSelectedCellChange,
  updateTableData,
}) => {
  console.log("row cell value", value);

  // Simple check: if value is not defined, use placeholder
  const displayValue = value?.label || "N/A";

  const [cellValue, setCellValue] = useState<string>(
    columnId === "index" ? "" : displayValue
  );

  // If value is changed externally, sync it up with local state
  useEffect(() => {
    const newDisplayValue = value?.label || "N/A";
    if (newDisplayValue !== cellValue) {
      setCellValue(newDisplayValue);
    }
  }, [value, cellValue]);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCellValue(event.target.value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && value?.rowId) {
      const cellId = `${value.rowId}$${columnId}`;
      updateTableData(cellId, (event.target as HTMLInputElement).value);
    }
  };

  const onBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (value?.rowId) {
      const cellId = `${value.rowId}$${columnId}`;
      updateTableData(cellId, event.target.value);
    }
  };

  const handleSelectCell = (event: MouseEvent<HTMLElement>) => {
    if (columnId === "index") {
      handleSelectedRowChange(event, rowId);
    } else {
      handleSelectedCellChange(event, `${rowId}$${columnId}`);
    }
  };

  const handleOnContextMenu = (event: MouseEvent<HTMLElement>) => {
    if (columnId === "index") {
      handleCellRightClick(event, "row", rowId);
    } else {
      handleCellRightClick(event, "cell", `${rowId}$${columnId}`);
    }
  };

  return (
    <Td
      columnId={columnId}
      selected={selected}
      highlightState={highlightState}
      searchHighlight={
        value?.rowId ? `${rowId}$${columnId}` in searchHighlightState : false
      }
      role="gridcell"
      onClick={(event) => handleSelectCell(event)}
      onContextMenu={handleOnContextMenu}
      dense={dense}
    >
      {columnId === "index" ? (
        children
      ) : (
        <>
          {editable ? (
            <EditableCell
              value={cellValue}
              onChange={onChange}
              onKeyDown={onKeyDown}
              onBlur={onBlur}
              dense={dense}
            />
          ) : (
            <NormalCell
              label={cellValue}
              settings={settings}
              expanded={expanded}
              value={value}
              dense={dense}
            />
          )}
        </>
      )}
    </Td>
  );
};

export default TableRowCell;
