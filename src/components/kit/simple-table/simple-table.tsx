import { Radio } from '@material-ui/core';
import clsx from 'clsx';
import styles from './simple-table.module.scss';
import { ISimpleColumn, ISimpleRow } from './interfaces/simple-table';

interface ISimpleTableProps {
  columns: ISimpleColumn[];
  rows: ISimpleRow[];
  selectedValue?: string;
  selectableRows?: boolean;
  handleSelectRow?: (rowId: string) => void;
}

const SimpleTable = ({
  columns,
  rows,
  selectedValue = '',
  selectableRows = false,
  handleSelectRow = undefined
}: ISimpleTableProps) => {
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
};

export default SimpleTable;
