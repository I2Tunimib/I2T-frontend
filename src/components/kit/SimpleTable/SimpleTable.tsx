import { Radio } from '@material-ui/core';
import { assertFC } from '@services/utils/is-fc-component';
import clsx from 'clsx';
import { ReactElement } from 'react';
import styles from './SimpleTable.module.scss';

interface ISimpleTableProps<T> {
  columns: ISimpleColumn[];
  rows: ISimpleRow<T>[];
  selectedValue?: string;
  selectableRows?: boolean;
  handleSelectRow?: (rowId: string) => void;
}

export interface ISimpleColumn {
  id: string;
}

export interface ISimpleRow<T = any> {
  id: string;
  cells: T[];
}

export function SimpleTable<T>({
  columns,
  rows,
  selectedValue = '',
  selectableRows = false,
  handleSelectRow = undefined
}: ISimpleTableProps<T>): ReactElement | null {
  /**
   * Preprare rows with ids
   */
  const prepareRows = (originalRows: ISimpleRow[]) => (
    originalRows.map((row) => ({
      id: row.id,
      cells: row.cells.map((cell, idCell) => ({
        id: idCell,
        value: typeof cell === 'number' ? cell.toFixed(2) : `${cell}`
      }))
    }))
  );

  return (
    <table className={styles.TableRoot}>
      <thead>
        <tr className={styles.TableRow}>
          {columns.map((col) => (
            <th className={styles.TableHeaderCell} key={col.id}>{col.id}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {prepareRows(rows).map((row) => (
          <tr
            onClick={handleSelectRow ? () => handleSelectRow(row.id) : undefined}
            className={clsx(
              styles.TableRow,
              {
                [styles.Selectable]: selectableRows,
                [styles.Selected]: selectedValue === row.id
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
                  checked={selectedValue === row.id}
                  onChange={handleSelectRow ? () => handleSelectRow(row.id) : undefined}
                  value={row.id}
                />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

assertFC(SimpleTable);

export default SimpleTable;
