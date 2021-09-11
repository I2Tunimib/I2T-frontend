import tableAPI from '@services/api/table';
import { convertFromChallengeTables } from '@services/converters/challenge-table-converter';
import { convertFromCSV, CsvSeparator } from '@services/converters/csv-converter';
import {
  ColumnState, CurrentTableState, FileFormat,
  ID,
  RowState, TableFile, TableType
} from '../interfaces/table';

interface LoadTableResponse {
  columns: ColumnState,
  rows: RowState,
  currentTable: CurrentTableState;
  selectedCellMetadataId?: Record<ID, ID>;
}

interface ConvertTableOptions {
  separator: CsvSeparator;
}

const EMPTY_TABLE = {
  columns: { byId: {}, allIds: [] },
  rows: { byId: {}, allIds: [] },
  currentTable: {
    name: ''
  }
};

const getTableName = (table: TableFile | TableFile[], challenge: boolean) => {
  if (challenge && Array.isArray(table)) {
    // it can only be a challenge table. Set name equal to 'Data' table.
    const fData = table.find((file) => file.type === TableType.DATA);
    return fData ? fData.name : 'Table name';
  }
  if (!Array.isArray(table)) {
    return table.name;
  }
  return 'Table name';
};

const getTableType = (table: TableFile | TableFile[], challenge: boolean) => {
  if (challenge) {
    return TableType.CHALLENGE;
  }
  if (Array.isArray(table)) {
    throw Error('Multiple tables, but not a challenge table');
  }
  return table.type;
};

const convertTable = async (
  data: any,
  type: TableType,
  format: FileFormat,
  options: Partial<ConvertTableOptions> = {}
) => {
  if (format === FileFormat.CSV) {
    return convertFromCSV(data, options.separator);
  }
  if (format === FileFormat.JSON) {
    // convert from json
    return {
      columns: { byId: {}, allIds: [] },
      rows: { byId: {}, allIds: [] }
    };
  }
  return {
    columns: { byId: {}, allIds: [] },
    rows: { byId: {}, allIds: [] }
  };
};

export const loadTable = async (
  /**
   * Table to load. It can be a single local table,
   * a challenge table (multiple files), or remote table (by specifying only the name).
   */
  table: TableFile | TableFile[],
  /**
   * If table is a challenge table
   */
  challenge: boolean
): Promise<LoadTableResponse> => {
  // default response
  const loadResponse: LoadTableResponse = {
    ...EMPTY_TABLE,
    currentTable: {
      name: getTableName(table, challenge),
      type: getTableType(table, challenge)
    }
  };

  if (challenge) {
    if (!Array.isArray(table)) {
      throw Error('Challenge table requires multiple files');
    }
    // load challenge table
    const response = await convertFromChallengeTables(table);
    return { ...loadResponse, ...response };
  }

  if (Array.isArray(table)) {
    throw Error('Multiple tables cannot be loaded into a single one');
  }

  if (!table.original) {
    // no file present, remote table
    const response = await tableAPI.getTable(table.name);
    const { data, ...meta } = response.data;
    const { columns, rows } = await convertTable(data, meta.type, meta.format, {
      separator: meta.separator
    });
    return { columns, rows, currentTable: meta };
  }

  const { columns, rows } = await convertTable(table.original, table.type, table.meta.format);
  return { ...loadResponse, columns, rows };
};
