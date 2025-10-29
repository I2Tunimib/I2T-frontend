export const dateRegex = new RegExp(
  "^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$",
);
export const stripWikidataPrefix = (str: string): string => {
  if (str.startsWith("wd:")) {
    return str.slice(3);
  } else if (str.startsWith("wdL:")) {
    return str.slice(4);
  } else if (str.startsWith("wdA:")) {
    return str.slice(4);
  } else if (str.startsWith("wda:")) {
    return str.slice(4);
  } else {
    return str;
  }
};
export const isValidWikidataId = (str: string): boolean => {
  const wikidataIdRegex = /^Q\d+$/;
  return wikidataIdRegex.test(str);
};
