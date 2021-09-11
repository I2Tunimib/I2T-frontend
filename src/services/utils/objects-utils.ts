/**
 * Returns true if the item is an object, false otherwise.
 */
export const isObject = (item: any): boolean => (typeof item === 'object' && item !== null && !Array.isArray(item));

export const isEmptyObject = (object: Object): boolean => (object
  && Object.keys(object).length === 0 && object.constructor === Object);

export const enumKeys = <O extends object, K extends keyof O = keyof O>(obj: O): K[] => {
  return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
};
