import parse from 'csv-parse/lib/sync';

const DEFAULT_DELIMITERS = [',', ';', '\t'];

export const detectDelimiter = (data: string, delimiters = DEFAULT_DELIMITERS, maxRows = 200) => {
  let csvData = data.split('\r\n');
  csvData = csvData.length < maxRows ? csvData : csvData.slice(0, maxRows);
  return delimiters.filter((delimiter) => {
    let isValid;
    try {
      const rows = parse(csvData.join('\n'), { delimiter });
      isValid = rows.some((row: string[]) => row.length > 1);
    } catch (e) {
      isValid = false;
    }
    return isValid;
  });
};
