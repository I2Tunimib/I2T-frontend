import { IconButton, Radio } from '@mui/material';
import {
  FC, forwardRef,
  useEffect,
  useRef
} from 'react';
import {
  Column, Row,
  useRowSelect, useTable
} from 'react-table';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import clsx from 'clsx';
import TableCell from './TableCell';
import styles from './Table.module.scss';

interface TableProps {
  columns: Column[];
  data: Row[];
  onSelectedRowChange: (row: any) => void;
  onDeleteRow: (row: any) => void;
  tableHeaderClass?: any;
}

const defaultColumn = {
  Cell: TableCell
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
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    selectedFlatRows,
    prepareRow,
    toggleAllRowsSelected,
    toggleRowSelected,
    state: { selectedRowIds }
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      manualRowSelectedKey: 'none',
      stateReducer: (newState, action) => {
        if (action.type === 'toggleRowSelected') {
          if (action.value) {
            newState.selectedRowIds = {
              [action.id]: true
            };
          } else {
            newState.selectedRowIds = {};
          }
        }
        return newState;
      }
    },
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((cols) => [
        ...cols,
        {
          id: 'delete',
          Cell: ({ row }) => (
            <IconButton size="small" onClick={() => onDeleteRow(row)}>
              <DeleteOutlineRoundedIcon />
            </IconButton>
          )
        },
        {
          id: 'selection',
          Cell: ({ row }) => (
            <div>
              <RadioCell {...row.getToggleRowSelectedProps()} />
            </div>
          )
        }
      ]);
    }
  );

  useEffect(() => {
    // treting selection as radio selection,
    // only one row at a time
    if (selectedFlatRows[0]) {
      onSelectedRowChange(selectedFlatRows[0].original);
    }
  }, [selectedFlatRows]);

  useEffect(() => {
    rows.forEach(({ id, original }) => {
      if ((original as any).isSelected) {
        toggleRowSelected(id, true);
      }
    });
  }, [rows, toggleRowSelected]);

  const handleRowClick = ({ id }: Row) => {
    if (id in selectedRowIds) {
      toggleRowSelected(id, false);
    } else {
      toggleRowSelected(id, true);
    }
  };

  return (
    <table {...getTableProps()} className={styles.TableRoot}>
      <thead className={clsx(styles.TableHeader, tableHeaderClass)}>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()} className={styles.TableRow}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()} className={styles.TableHeaderCell}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr
              onClick={() => handleRowClick(row)}
              {...row.getRowProps()}
              className={clsx(
                styles.TableRow,
                {
                  [styles.Selected]: row.isSelected
                }
              )}>
              {row.cells.map((cell) => {
                return (
                  <td {...cell.getCellProps()} className={styles.TableRowCell}>
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;
