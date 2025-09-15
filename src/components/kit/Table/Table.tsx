import { IconButton, Radio } from '@mui/material';
import {
  FC, forwardRef,
  useEffect,
  useRef
} from 'react';
import {
  ColumnDef,
  Row,
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import clsx from 'clsx';
import TableCell from './TableCell';
import styles from './Table.module.scss';

interface TableProps<TData extends object> {
  columns: ColumnDef<any, any>[];
  data: any[];
  onSelectedRowChange: (row: any) => void;
  onDeleteRow: (row: any) => void;
  tableHeaderClass?: any;
}

const defaultColumn = {
  cell: TableCell
};

const RadioCell = forwardRef(
  ({
    indeterminate,
    checked,
    onChange,
    ...rest
  }: any, ref) => {
    const defaultRef = useRef();
    const resolvedRef = ref || defaultRef;

    const handle = (e: any) => {
      e.stopPropagation();
      if (checked) {
        e.target.checked = !checked;
        onChange(e);
      }
    };

    return (
      <>
        <Radio
          onChange={onChange}
          onClick={handle}
          checked={checked}
          inputRef={resolvedRef}
          inputProps={{
            ...rest
          }}
        />
      </>
    );
  }
);

const Table: FC<TableProps> = ({
  columns,
  data,
  tableHeaderClass,
  onSelectedRowChange,
  onDeleteRow
}) => {

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const table = useReactTable({
    data,
    columns: [
      ...columns,
      {
        id: 'delete',
        cell: ({ row }) => (
          <IconButton size="small" onClick={() => onDeleteRow(row)}>
            <DeleteOutlineRoundedIcon/>
          </IconButton>
        ),
      },
      {
        id: 'selection',
        cell: ({ row }) => (
          <div>
            <RadioCell
              checked={row.getIsSelected()}
              onChange={() => setRowSelection({ [row.id]: true })}/>
          </div>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    defaultColumn,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      // Enforce single selection
      const onlyOne: Record<string, boolean> = {};
      const firstId = Object.keys(newSelection)[0];
      if (firstId) {
        onlyOne[firstId] = true;
      } else {
        setRowSelection(onlyOne);
      }
    },
  });

  useEffect(() => {
    const selectedRows = table.getSelectedRowModel().flatRows;
    if (selectedRows[0]) {
      onSelectedRowChange(selectedRows[0].original);
    }
  }, [rowSelection]);

  useEffect(() => {
    data.forEach((row, id) => {
      if (row.isSelected) {
        setRowSelection({ [id.toString()]: true });
      }
    });
  }, [data]);

  const handleRowClick = (row: Row<any>) => {
    const isSelected = row.getIsSelected();
    setRowSelection(isSelected ? {} : { [row.id]: true });
  };

  return (
    <table className={styles.TableRoot}>
      <thead className={clsx(styles.TableHeader, tableHeaderClass)}>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className={styles.TableRow}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className={styles.TableHeaderCell}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
            <tr key={row.id}
              onClick={() => handleRowClick(row)}
              className={clsx(
                styles.TableRow,
                {
                  [styles.Selected]: row.getIsSelected()
                }
              )}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={styles.TableRowCell}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
