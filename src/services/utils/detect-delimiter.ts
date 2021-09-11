import { parse } from 'papaparse';

export const detectDelimiter = async (
  file: File, maxRows = 200
) => {
  return new Promise<string | undefined>((resolve, reject) => {
    parse(file, {
      preview: maxRows,
      complete: (res) => {
        resolve(res.meta.delimiter);
      },
      error: (err) => {
        reject(err);
      }
    });
  });

  // let csvData = e.target.result.split('\r\n') as string[];
  // csvData = csvData.length < maxRows ? csvData : csvData.slice(0, maxRows);
  // return delimiters.filter((delimiter) => {
  //   let isValid;
  //   try {
  //     const rows = parse(csvData.join('\n'), { delimiter });
  //     isValid = rows.some((row: string[]) => row.length > 1);
  //   } catch (e) {
  //     isValid = false;
  //   }
  //   return isValid;
  // });
  // fileReader.onload = (e: any) => {
  //   let csvData = e.target.result.split('\r\n') as string[];
  //   csvData = csvData.length < maxRows ? csvData : csvData.slice(0, maxRows);
  //   return delimiters.filter((delimiter) => {
  //     let isValid;
  //     try {
  //       const rows = parse(csvData.join('\n'), { delimiter });
  //       isValid = rows.some((row: string[]) => row.length > 1);
  //     } catch (e) {
  //       isValid = false;
  //     }
  //     return isValid;
  //   });
  // };
};
