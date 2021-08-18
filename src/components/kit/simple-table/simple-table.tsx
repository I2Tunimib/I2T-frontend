import { Radio } from '@material-ui/core';
import { useState } from 'react';
import clsx from 'clsx';
import styles from './simple-table.module.scss';

interface ISimpleTableProps {
  columns: string[],
  rows: string[][];
  selectableRows?: boolean;
}

const SimpleTable = ({
  columns,
  rows,
  selectableRows = false
}: ISimpleTableProps) => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  /**
   * Preprare columns with ids
   */
  const prepareColumns = (originalColumns: string[]) => (
    originalColumns.map((col, index) => ({
      id: index,
      cell: col
    }))
  );

  /**
   * Preprare rows with ids
   */
  const prepareRows = (originalRows: string[][]) => (
    originalRows.map((row, index) => ({
      id: index,
      cells: row
        .map((cell) => ({
          id: `${cell}-${index}`,
          value: cell
        }))
    }))
  );

  const handleChange = (radioId: number) => {
    setSelectedRow(radioId);
  };

  return (
    <table className={styles.TableRoot}>
      <thead>
        <tr className={styles.TableRow}>
          {prepareColumns(columns).map((col) => (
            <th className={styles.TableHeaderCell} key={col.id}>{col.cell}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {prepareRows(rows).map((row) => (
          <tr
            onClick={() => handleChange(row.id)}
            className={clsx(
              styles.TableRow,
              {
                [styles.Selectable]: selectableRows,
                [styles.Selected]: selectedRow === row.id
              }
            )}
            key={row.id}
          >
            {row.cells.map((cell) => (
              <td className={styles.TableRowCell} key={cell.id}>{cell.value}</td>
            ))}
            {selectableRows && (
              <td
                className={styles.TableRowCell}
                key={row.id}
              >
                <Radio
                  checked={selectedRow === row.id}
                  onChange={() => handleChange(row.id)}
                  value={`radio-${row.id}`}
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SimpleTable;
