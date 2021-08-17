import styles from './simple-table.module.scss';

interface ISimpleTableProps {
  columns: string[],
  rows: string[][];
}

const SimpleTable = ({ columns, rows }: ISimpleTableProps) => {
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
          <tr className={styles.TableRow} key={row.id}>
            {row.cells.map((cell) => (
              <td className={styles.TableRowCell} key={cell.id}>{cell.value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SimpleTable;
