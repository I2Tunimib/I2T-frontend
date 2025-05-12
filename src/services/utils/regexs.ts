export const dateRegex = new RegExp(
  "^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$"
);
export const isValidWikidataId = (str: string): boolean => {
  const wikidataIdRegex = /^Q\d+$/;
  return wikidataIdRegex.test(str);
};
