import { ISimpleColumn, ISimpleRow } from '../interfaces/simple-table';

interface ISimpleTableProps {
  columns: ISimpleColumn[],
  data: ISimpleRow[]
}

const SimpleTable = ({ columns, data }: ISimpleTableProps) => {
  const prepareCells = (row: ISimpleRow) => (
    Object.keys(row).map((key) => ({ ...row[key] }))
  );

  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th>{column.content}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr>
            {prepareCells(row).map((cell) => (
              <td>{cell.content}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SimpleTable;
