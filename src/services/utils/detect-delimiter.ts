import { CsvSeparator } from '@services/converters/csv-converter';
import { parse } from 'papaparse';

export const detectDelimiter = async (
  file: File, maxRows = 200
) => {
  return new Promise<CsvSeparator | undefined>((resolve, reject) => {
    parse(file, {
      // only parse up to maxRows
      preview: maxRows,
      worker: true,
      complete: (res) => {
        resolve(res.meta.delimiter as CsvSeparator);
      },
      error: (err) => {
        reject(err);
      }
    });
  });
};
