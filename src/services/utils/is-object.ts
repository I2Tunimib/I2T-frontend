/**
 * Returns true if the item is an object, false otherwise.
 */
export const isObject = (item: any): boolean => (typeof item === 'object' && item !== null && !Array.isArray(item));

export const isEmptyObject = (object: Object): boolean => (object
  && Object.keys(object).length === 0 && object.constructor === Object);
